# Use the official Python image from the Docker Hub
FROM python:3.9-slim

# Set environment variables for Flask
ENV FLASK_APP=app.py
ENV FLASK_ENV=production  

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port the app will run on
EXPOSE 6000

# Use Gunicorn to run the Flask app in production
CMD ["gunicorn", "--bind", "0.0.0.0:6000", "app:app", "--workers=4", "--threads=4"]
