from pydantic import BaseModel
from typing import Optional, List

class Creator(BaseModel):
    id: str
    name: str
    worksCount: int
    completeness: float

class Song(BaseModel):
    title: str
    artist: str
    Release_date: str
    source: str
    description: str
    archived_by: str
    archived_date: str
    audio: str
    thumbnail: str
    analysis: str

class SearchResult(BaseModel):
    id: str
    creatorId: str
    title: str
    artist: str
    type: str
    release_date: str
    thumbnail: str
    description: str
    source: str

class SearchResponse(BaseModel):
    results: List[SearchResult]
    total: int