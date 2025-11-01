let mediaRecorder;
let chunks = [];
let transcript = null;

function setStatus(msg) {
  const el = document.getElementById('status');
  if (el) el.textContent = msg;
}

function setTranscript(text) {
  // Prefer a dedicated transcript box; fall back to translatedText if not present
  const el = document.getElementById('transcriptText') || document.getElementById('translatedText');
  if (el) el.textContent = text || '';
}

function setTranslation(text) {
  const el = document.getElementById('translatedText');
  if (el) el.textContent = text || '';
}

function show(data) {
  const out = document.getElementById('translatedText');
  if (!out) return;
  try {
    if (data && data.error) {
      out.textContent = `Error: ${data.error}${data.detail ? ' — ' + data.detail : ''}`;
    } else if (data && (data.translation || data.translated || data.text)) {
      // If someone still calls show() with a translation payload, do not lose it
      setTranslation(data.translation || data.translated || data.text);
    } else if (data && data.transcript) {
      setTranscript(data.transcript);
    } else {
      out.textContent = JSON.stringify(data);
    }
  } catch (_) {
    out.textContent = 'Unable to display response.';
  }
}

function getCsrfToken() {
  // Try cookie first (Django default)
  const m = document.cookie.match(/(?:^|; )csrftoken=([^;]+)/);
  if (m) return decodeURIComponent(m[1]);
  // Fallback to a meta tag if you add one later
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : '';
}

async function startRecording() {
  // Prompt for Microphone permission
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // Gets proper MIME type depending on browser
  const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');

  mediaRecorder = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
  // Clears chunks in case a previous recording occured
  chunks = [];
  // Continually push new data to chunks while recording
  mediaRecorder.ondataavailable = e => chunks.push(e.data);

  mediaRecorder.onstop = handleStop;
  mediaRecorder.start();
  setStatus('Recording…');
  const startBtn = document.getElementById('translateBtn');
  const stopBtn = document.getElementById('stopBtn');
  if (startBtn) startBtn.disabled = true;
  if (stopBtn) stopBtn.disabled = false;
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    setStatus('Stopping…');
    try { mediaRecorder.stop(); } catch (_) {}
  }
}

async function handleStop() {
  if (!chunks.length) {
    setStatus('No audio captured. Try again.');
    transcript = null;
    return;
  }

  const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
  chunks = [];

  const startBtn = document.getElementById('translateBtn');
  const stopBtn = document.getElementById('stopBtn');
  if (startBtn) startBtn.disabled = false;
  if (stopBtn) stopBtn.disabled = true;

  // Refuses audio shorter than 8KB
  if (blob.size < 8 * 1024) {
    setStatus('Recording too short or silent, record at least 1-2 seconds');
    return;
  }

  // Prepares API call to views
  const fd = new FormData();
  const ext = blob.type.includes('mp4') ? 'm4a' : 'webm';
  fd.append('audio', blob, `clip.${ext}`);

  // 45s client timeout
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort('timeout'), 45000);

  setStatus('Uploading…');
  try {
    const resp = await fetch((window.API && window.API.uploadAudioUrl) || '/upload_audio', {
      method: 'POST',
      headers: { 'X-CSRFToken': getCsrfToken() },
      body: fd,
      credentials: 'same-origin',
      signal: controller.signal
    });
    clearTimeout(to);

    let data;
    try { data = await resp.json(); } catch (_) { data = null; }

    if (!resp.ok) {
      setStatus('Upload failed.');
      show(data || { error: `${resp.status} ${resp.statusText}` });
      return;
    }

    if (data?.code === 'NO_TRANSCRIPT') {
      setStatus('No speech detected.');
      show(data);
      return;
    }

    setStatus('Done');
    // Stash the transcript
    transcript = data?.transcript;
    setTranscript(transcript);

    // Automatically translate right after a successful upload
    try { await handleTranslate(); } catch (_) {}

  } catch (err) {
    clearTimeout(to);
    const aborted = (err?.name === 'AbortError') || String(err).includes('timeout');
    if (aborted) {
      setStatus('Timed out waiting for server.');
      show({ error: 'TIMEOUT', detail: String(err) });
    } else {
      setStatus('Unexpected error.');
      show({ error: 'UPLOAD_ERROR', detail: String(err) });
    }
  }
}

async function handleTranslate() {
  if (!transcript) {
    setStatus("No transcript provided");
    return;
  }

  // create new FormData
  const fd = new FormData();
  fd.append('transcript', transcript);

  // timeout
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort('timeout'), 30000);

  setStatus("Translating...");
  try {
    const resp = await fetch((window.API && window.API.translateAudioUrl) || '/translate_audio', {
      method: 'POST',
      headers: { 'X-CSRFToken': getCsrfToken() },
      body: fd,
      credentials: 'same-origin',
      signal: controller.signal
    });
    clearTimeout(to);

    const data = await resp.json().catch(() => null);

    if (!resp.ok) {
      setStatus('Translation failed.');
      show(data || { error: `${resp.status} ${resp.statusText}` });
      return;
    }

    setStatus('Translation Complete');
    setTranslation(data && (data.translation || data.translated || data.text || ''));
    // TODO: Add more robust handling
    transcript = null;

  } catch(err) {
    clearTimeout(to);
    const aborted = (err?.name === 'AbortError') || String(err).includes('timeout');
    if (aborted) {
      setStatus('Timed out waiting for server.');
      show({ error: 'TIMEOUT', detail: String(err) });
    } else {
      setStatus('Unexpected error.');
      show({ error: 'UPLOAD_ERROR', detail: String(err) });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('translateBtn');
  const stopBtn = document.getElementById('stopBtn');

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      // reset any previous transcript
      transcript = null;
      startRecording();
    });
  }
  if (stopBtn) {
    stopBtn.disabled = true; // disabled until recording starts
    stopBtn.addEventListener('click', stopRecording);
  }
});

const clearBtn = document.getElementById('clearTextarea');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    setTranscript('');
    setTranslation('');
    setStatus('Ready');
  });
}