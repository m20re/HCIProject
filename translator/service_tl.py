# service_tl.py (Alternative using deep-translator)
# Install: pip install deep-translator
from deep_translator import GoogleTranslator

def translate_text(t: str, dest: str) -> str:
    """
    Synchronous translation using deep-translator.
    Returns translated text as a string.
    """
    translator = GoogleTranslator(source='auto', target=dest)
    result = translator.translate(t)
    return result
