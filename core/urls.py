from django.urls import path
from .views import get_latest_telemetry

urlpatterns = [
    path('telemetry/', get_latest_telemetry),
]