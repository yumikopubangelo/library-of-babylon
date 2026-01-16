from fastapi import APIRouter, HTTPException
from typing import List, Optional
import os
import json
from pathlib import Path

from models import Creator, Song, SearchResponse, SearchResult

router = APIRouter()

# Get the archive root path
ARCHIVE_ROOT = Path(os.getenv("ARCHIVE_ROOT", "/archive"))  # Mounted volume in Docker

def get_creators_from_archive() -> List[Creator]:
    """Get list of creators from archive directory"""
    creators = []
    creators_dir = ARCHIVE_ROOT / "creators"

    if not creators_dir.exists():
        return creators

    for creator_dir in creators_dir.iterdir():
        if creator_dir.is_dir() and not creator_dir.name.startswith('_'):
            # Count works (simplified - count music singles for now)
            music_dir = creator_dir / "Music" / "Singles"
            works_count = len(list(music_dir.glob("*/metadata.json"))) if music_dir.exists() else 0

            creator = Creator(
                id=creator_dir.name,
                name=creator_dir.name.replace('_', ' '),
                worksCount=works_count,
                completeness=0.5  # Placeholder
            )
            creators.append(creator)

    return creators

def get_songs_for_creator(creator_id: str) -> List[Song]:
    """Get songs for a specific creator"""
    songs = []
    creator_dir = ARCHIVE_ROOT / "creators" / creator_id / "Music" / "Singles"

    if not creator_dir.exists():
        return songs

    for song_dir in creator_dir.iterdir():
        if song_dir.is_dir():
            metadata_file = song_dir / "metadata.json"
            if metadata_file.exists():
                try:
                    with open(metadata_file, 'r', encoding='utf-8') as f:
                        metadata = json.load(f)

                    song = Song(
                        title=metadata.get('title', ''),
                        artist=metadata.get('artist', ''),
                        Release_date=metadata.get('release_date', ''),
                        source=metadata.get('source', {}).get('url', ''),
                        description=metadata.get('description', ''),
                        archived_by=metadata.get('archived_by', ''),
                        archived_date=metadata.get('archived_date', ''),
                        audio=metadata.get('files', {}).get('audio', ''),
                        thumbnail=metadata.get('files', {}).get('thumbnail', ''),
                        analysis=metadata.get('analysis', '')
                    )
                    songs.append(song)
                except (json.JSONDecodeError, KeyError):
                    continue

    return songs

@router.get("/creator", response_model=dict)
async def list_creators():
    """List all creators in the archive"""
    creators = get_creators_from_archive()
    return {"creators": [creator.dict() for creator in creators]}

@router.get("/creator/{creator_id}/songs", response_model=List[Song])
async def get_creator_songs(creator_id: str):
    """Get all songs for a specific creator"""
    songs = get_songs_for_creator(creator_id)
    return songs

@router.get("/search", response_model=SearchResponse)
async def search_works(
    q: Optional[str] = None,
    type: Optional[str] = None,
    creator: Optional[str] = None,
    genre: Optional[str] = None,
    dateFrom: Optional[str] = None,
    dateTo: Optional[str] = None
):
    """Search for works across all creators"""
    results = []

    # Simple implementation - search through all songs
    creators = get_creators_from_archive()

    for creator_obj in creators:
        if creator and creator_obj.id != creator:
            continue

        songs = get_songs_for_creator(creator_obj.id)
        for song in songs:
            # Simple text search
            if q:
                search_text = f"{song.title} {song.artist} {song.description}".lower()
                if q.lower() not in search_text:
                    continue

            # Type filter
            if type and type != "song":
                continue

            result = SearchResult(
                id=f"{creator_obj.id}/{song.title}",
                creatorId=creator_obj.id,
                title=song.title,
                artist=song.artist,
                type="song",
                release_date=song.Release_date,
                thumbnail=f"creators/{creator_obj.id}/Music/Singles/{song.title}/thumbnail.jpg",
                description=song.description,
                source=song.source
            )
            results.append(result)

    return SearchResponse(results=results, total=len(results))