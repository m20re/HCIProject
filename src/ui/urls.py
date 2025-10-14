from django.urls import path
from . import views

urlpatterns = [
    path("", views.map_view, name="map"),
    path("api/countries", views.countries_api, name="countries_api"),
    path("api/translate", views.translate_api, name="translate_api"),
]