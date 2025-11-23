# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt /app/

# Install any needed packages specified in requirements.txt
# (We add django-cors-headers here explicitly to be safe)
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install django-cors-headers djangorestframework psycopg2-binary

# Copy the backend code into the container
COPY . /app/

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run the application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]