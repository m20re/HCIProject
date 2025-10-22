# service_tl.py  (replace current contents)
from googletrans import Translator

translator = Translator(service_urls=['translate.googleapis.com'])

async def translate_text(t: str, dest: str = "es") -> str:
    result = await translator.translate(t, dest=dest)
    return result.text

