from django.urls import path
from pages.views import RecordPageView

from .views import upload_audio, translate_audio

urlpatterns = [
    path("", RecordPageView.as_view(), name="Record"),
    path("upload-audio/", upload_audio, name="upload_audio"),
    path("translate-audio", translate_audio, name="translate_audio"),
]
