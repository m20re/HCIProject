let mediaRecorder;
let chunks = [];
let transcript = null;

let silenceTimer = null;
let audioContext = null;
let analyser = null;
let dataArray = null;


let manualStop = false;



function setStatus(msg) {
  const el = document.getElementById('status');
  if (el) el.textContent = msg;
}

function setTranscript(text) {
  const el = document.getElementById('transcriptText') || document.getElementById('translatedText');
  if (el) el.textContent = text || '';
}

function setTranslation(text) {
  const el = document.getElementById('translatedText');
  if (!el) {
    console.warn('[translator.js] #translatedText not found in DOM');
    return;
  }
  el.textContent = text || '';
}

function pickTranslation(payload) {
  if (!payload) return '';
  if (typeof payload.translation === 'string') return payload.translation;
  if (typeof payload.Translation === 'string') return payload.Translation;
  if (typeof payload.translatedText === 'string') return payload.translatedText;
  if (payload.data?.translation) return payload.data.translation;
  if (payload.data?.translations?.[0]?.translatedText)
    return payload.data.translations[0].translatedText;
  return '';
}

function show(data) {
  const out = document.getElementById('translatedText');
  if (!out) return;
  try {
    const t = pickTranslation(data);
    if (t) { setTranslation(t); return; }

    if (data && data.error) {
      out.textContent = `Error: ${data.error}${data.detail ? ' — ' + data.detail : ''}`;
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
  const m = document.cookie.match(/(?:^|; )csrftoken=([^;]+)/);
  if (m) return decodeURIComponent(m[1]);
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : '';
}


const LANGUAGE_KEYWORDS = {
  english: "en",
  spanish: "es",
  german: "de",
  french: "fr",
  japanese: "ja",
  chinese: "zh",
  korean: "ko",
  italian: "it",
  portuguese: "pt",
  russian: "ru"
};

function detectLanguageCommand(text) {
  if (!text) return null;
  const lower = text.toLowerCase();

  const patterns = [
    /switch to ([a-z]+)/,
    /translate to ([a-z]+)/,
    /change language to ([a-z]+)/,
    /set language to ([a-z]+)/,
    /([a-z]+) mode$/
  ];

  for (const pat of patterns) {
    const m = lower.match(pat);
    if (m && m[1]) {
      const langName = m[1].trim().toLowerCase();
      if (LANGUAGE_KEYWORDS[langName]) {
        return LANGUAGE_KEYWORDS[langName];
      }
    }
  }

  return null;
}

function applyLanguageChange(code) {
  const select = document.getElementById("toLang");
  if (!select) return;
  select.value = code;
  setStatus("Language switched to " + code.toUpperCase());
}


async function startRecording() {
  manualStop = false;
  if (silenceTimer) {
    clearTimeout(silenceTimer);
    silenceTimer = null;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // Silence detection setup
  audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  dataArray = new Uint8Array(analyser.fftSize);
  source.connect(analyser);

  function checkSilence() {
    analyser.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const v = (dataArray[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / dataArray.length);

    const SILENCE_THRESHOLD = 0.015;
    const SILENCE_TIMEOUT = 3000;

    if (rms < SILENCE_THRESHOLD) {
      if (!silenceTimer) {
        silenceTimer = setTimeout(() => {
          stopRecording();
        }, SILENCE_TIMEOUT);
      }
    } else {
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }

    if (mediaRecorder && mediaRecorder.state === "recording") {
      requestAnimationFrame(checkSilence);
    }
  }

  requestAnimationFrame(checkSilence);

  const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');

  mediaRecorder = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
  chunks = [];

  mediaRecorder.ondataavailable = e => chunks.push(e.data);
  mediaRecorder.onstop = handleStop;
  mediaRecorder.start();

  setStatus('Recording…');

  const startBtn = document.getElementById('translateBtn');
  const stopBtn = document.getElementById('stopBtn');
  if (startBtn) startBtn.disabled = true;
  if (stopBtn) stopBtn.disabled = false;
}

/* -------------------------------------------------------------------------- */
/*                               STOP RECORDING                                */
/* -------------------------------------------------------------------------- */

function stopRecording() {
  if (silenceTimer) {
    clearTimeout(silenceTimer);
    silenceTimer = null;
  }

  if (audioContext) {
    try { audioContext.close(); } catch (_) {}
    audioContext = null;
  }

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

  if (blob.size < 8 * 1024) {
    setStatus('Recording too short or silent.');
    return;
  }

  const fd = new FormData();
  const ext = blob.type.includes('mp4') ? 'm4a' : 'webm';
  fd.append('audio', blob, `clip.${ext}`);

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

    const data = await resp.json().catch(() => null);

    if (!resp.ok) {
      setStatus('Upload failed.');
      show(data || { error: `${resp.status} ${resp.statusText}` });
      return;
    }

    transcript = data?.transcript;
    setTranscript(transcript);

    /* -------------------------------------------------- */
    /* 🔍 VOICE COMMAND CHECK (STOP TRANSLATION)          */
    /* -------------------------------------------------- */
    const newLang = detectLanguageCommand(transcript);
    if (newLang) {
      applyLanguageChange(newLang);
      transcript = null;

      setTimeout(() => startRecording(), 800);
      return;
    }

    // Otherwise translate normally
    await handleTranslate();

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

  const toLangSelect = document.getElementById('toLang');
  const targetLang = toLangSelect ? toLangSelect.value : 'es';

  const fd = new FormData();
  fd.append('transcript', transcript);
  fd.append('dest', targetLang);

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

    const t = pickTranslation(data);
    if (t) {
      setStatus('Translation Complete');
      setTranslation(t);
      transcript = null;

      if (data.audio_url) {
        try {
          const audio = new Audio(data.audio_url);
          audio.onended = () => {
            setStatus('Translation ready');
            if (!manualStop) {
              setTimeout(() => {
                silenceTimer = null;
                startRecording();
              }, 800);
            } else {
              setStatus('Stopped');
            }
          };
          await audio.play();
          setStatus('Playing translated audio...');
        } catch (e) {
          setStatus('Translation ready, audio unavailable.');
          if (!manualStop) {
            setTimeout(() => startRecording(), 800);
          }
        }
      } else {
        if (!manualStop) {
          setTimeout(() => startRecording(), 800);
        }
      }

    } else {
      setStatus('No translation returned');
      show(data || { error: 'EMPTY_TRANSLATION' });
    }

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


document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('translateBtn');
  const stopBtn = document.getElementById('stopBtn');

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      transcript = null;
      startRecording();
    });
  }

  if (stopBtn) {
    stopBtn.disabled = true;
    stopBtn.addEventListener('click', () => {
      manualStop = true;
      stopRecording();
    });
  }

  const clearBtn = document.getElementById('clearTextarea');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      setTranscript('');
      setTranslation('');
      setStatus('Ready');
    });
  }

  // Auto-start after 1.2s
  setTimeout(() => {
    if (startBtn) startBtn.click();
  }, 1200);
});
