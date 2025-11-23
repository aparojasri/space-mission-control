from rest_framework import serializers
from .models import TelemetryData

class TelemetrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TelemetryData
        fields = '__all__'  # Send every column (temp, pressure, etc.) to the frontend