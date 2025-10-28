import os, tempfile, subprocess
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from translator.service_tl import translate_text
from translator.service_tc import transcribe_wav

FFMPEG_TIMEOUT_SEC = 20

@require_POST
def upload_audio(request):
    f = request.FILES.get("audio")
    if not f:
        return JsonResponse({"error": "NO_FILE", "detail": "Missing 'audio' in form-data"}, status=400)

    # Save upload to temp
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(f.name)[1] or ".bin") as tmp_in:
        for chunk in f.chunks():
            tmp_in.write(chunk)
        src_path = tmp_in.name

    # Convert to mono 16kHz WAV
    # !! Requires ffmpeg program !!
    wav_path = src_path + ".wav"
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", src_path, "-ac", "1", "-ar", "16000", wav_path],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            timeout=FFMPEG_TIMEOUT_SEC, check=True
        )
    except subprocess.TimeoutExpired:
        _cleanup(src_path, wav_path)
        return JsonResponse(
            {"error": "FFMPEG_TIMEOUT", "detail": f">{FFMPEG_TIMEOUT_SEC}s"},
            status=504
        )
    except subprocess.CalledProcessError as e:
        _cleanup(src_path, wav_path)
        return JsonResponse(
            {"error": "FFMPEG_FAILED", "detail": e.stderr.decode(errors="ignore")[:500]},
            status=422
        )
    except Exception as e:
        _cleanup(src_path, wav_path)
        return JsonResponse(
            {"error": "FFMPEG_EXCEPTION", "detail": str(e)}, 
            status=500
        )

    try:
        asr = transcribe_wav(wav_path, language=None)
        text = (asr.get("text") or "").strip()

        if not text:
            return JsonResponse({
                "code": "NO_TRANSCRIPT",
                "message": "No speech detected or transcription empty.",
                "asr_meta": {k: v for k, v in asr.items() if k != "segments"},
            }, status=200)

        return JsonResponse({"transcript": text, "asr_meta": asr}, status=200)
    except Exception as e:
        return JsonResponse({"error": "ASR_ERROR", "detail": str(e)}, status=500)
    finally:
        _cleanup(src_path, wav_path)

@require_POST
async def translate_audio(request):
    t = request.POST.get("transcript", "").strip()
    if not t:
        return JsonResponse(
            {
                "error": "NO_TRANSCRIPT",
                "details": "No transcript was provided",
            },
            status=400
        )
    
    # TODO: Add dropdown for language
    dest = request.POST.get("dest", "").strip() or "es"
    
    # Call GoogleTrans API
    try:
        translated = await translate_text(t, dest=dest)
        return JsonResponse(
            {
                "Translation": translated,
                "target": dest,
            },
            status=200
        )
    except Exception as e:
        return JsonResponse(
            {
                "error": "TRANSLATION_FAILED",
                "detail": str(e),
            },
            status=500
        )

def _cleanup(*paths):
    for p in paths:
        try:
            if p and os.path.exists(p):
                os.remove(p)
        except Exception:
            pass

