FROM python:3.11-slim

# Set up the app directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the backend source code
COPY . .

# Set the working directory to the source root
WORKDIR /app/src

# Add the source root to the python path for clarity, although WORKDIR is usually on path
ENV PYTHONPATH=/app/src

EXPOSE 8000

# Run uvicorn from the src directory
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
