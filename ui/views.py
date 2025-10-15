from django.http import JsonResponse
from django.shortcuts import render

# Mock data for countries. This is currently hardcoded but will likely be replaced
# with a dataset or a more organized structure (e.g., a database or API).
COUNTRIES = [
    {"iso2": "US", "name": "United States", "lat": 39.8, "lon": -98.6,
     "languages": [{"code": "en", "name": "English"}]},
    {"iso2": "MX", "name": "Mexico", "lat": 23.6, "lon": -102.5,
     "languages": [{"code": "es", "name": "Español"}]},
]

# View to render the map page.
# When a user visits the corresponding URL, this function renders the "map.html" template.
def map_view(request):
    countries = [
        {"name": "United States", "iso2": "US", "lat": 38.0, "lon": -97.0,
         "languages": [{"name": "English"}]},
        {"name": "Guatemala", "iso2": "GT", "lat": 15.7835, "lon": -90.2308,
         "languages": [{"name": "Spanish"}]},
    ]
    return render(request, "map.html", {"countriesData": countries})

# API endpoint to return the list of countries as JSON.
# This is useful for frontend components (e.g., a map or dropdown) that need country data.
# Note: The COUNTRIES data will likely be replaced with a database query or external API.
def countries_api(request):
    return JsonResponse(COUNTRIES, safe=False)

# API endpoint to handle text translation.
# This is currently a placeholder that returns a hardcoded translation ("Hola mundo").
# In the future, this function will call a translation provider (e.g., Google Translate, DeepL, Azure)
# to translate text dynamically based on user input.
def translate_api(request):
    # Example of how this might work in the future:
    # text = request.POST.get("text")  # Get the text to translate from the request
    # target = request.POST.get("target")  # Get the target language code
    # Call the translation provider here and return the translated text.

    return JsonResponse({"translated": "Hola mundo"})  # Demo response
