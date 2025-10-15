from django.urls import path

from .views import HomePageView, AboutPageView, MapPageView

urlpatterns = [
    path("", HomePageView.as_view(), name="home"),
    path("map/", MapPageView.as_view(), name="map"),
    path("about/", AboutPageView.as_view(), name="about"),
]