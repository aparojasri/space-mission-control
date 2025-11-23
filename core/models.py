from django.db import models

class TelemetryData(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    engine_temp = models.DecimalField(max_digits=10, decimal_places=2)
    pressure_fuel = models.DecimalField(max_digits=10, decimal_places=2)
    altitude_km = models.DecimalField(max_digits=10, decimal_places=2)
    velocity_kmh = models.DecimalField(max_digits=10, decimal_places=2)
    attitude_roll = models.DecimalField(max_digits=10, decimal_places=2)
    status_code = models.CharField(max_length=10)

    class Meta:
        db_table = 'telemetry_data'  # Explicitly link to the table we made