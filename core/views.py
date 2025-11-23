from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import TelemetryData
from .serializers import TelemetrySerializer

@api_view(['GET'])
def get_latest_telemetry(request):
    # Fetch the most recent 30 records (ordered by newest first)
    data = TelemetryData.objects.order_by('-timestamp')[:30]
    
    # Convert to JSON
    serializer = TelemetrySerializer(data, many=True)
    
    # Return the JSON
    return Response(serializer.data)