# Use a specific Python version for reproducibility
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the scripts from the archive_automation directory
COPY . .

# The scripts are meant to be run manually, so no CMD or ENTRYPOINT is needed by default.
# One could be added if a default script should run.
# For example:
# CMD ["python", "archive_from_youtube.py"]
