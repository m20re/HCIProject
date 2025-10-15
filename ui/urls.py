from django.urls import path
from pages.views import MapPageView

urlpatterns = [
    path("", MapPageView.as_view(), name="map")
]