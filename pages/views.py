from django.views.generic import TemplateView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie

class HomePageView(TemplateView):
    template_name = "pages/home.html"


class AboutPageView(TemplateView):
    template_name = "pages/about.html"

@method_decorator(ensure_csrf_cookie, name="dispatch")
class RecordPageView(TemplateView):
    template_name = "translator/record.html"
