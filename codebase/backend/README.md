# Library of Babylon Backend

FastAPI backend for the Library of Babylon archival system.

## Features

- RESTful API for accessing archived content
- Creator and song management
- Search functionality
- File serving for audio and images

## API Endpoints

- `GET /api/creator` - List all creators
- `GET /api/creator/{id}/songs` - Get songs for a creator
- `GET /api/search` - Search works with filters

## Development

### Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set environment variables in `.env`

3. Run the server:
   ```bash
   uvicorn src.main:app --reload
   ```

### Docker

The backend is containerized and can be run via docker-compose:

```bash
docker-compose up backend
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `ARCHIVE_ROOT`: Path to archive directory
- `API_HOST`: Host for the API server
- `API_PORT`: Port for the API server

## Architecture

- `src/main.py`: FastAPI application entry point
- `src/models.py`: Pydantic data models
- `src/api/routes.py`: API route handlers