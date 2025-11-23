FROM python:3.9-slim

WORKDIR /app

# Install dependencies
RUN pip install numpy psycopg2-binary

# Copy the simulation script
COPY telemetry_gen.py /app/

# Run the simulation
CMD ["python", "-u", "telemetry_gen.py"]