# API Design

This document outlines the design of the API for the Library of Babylon project. The API is built using Next.js API Routes and is designed to be RESTful, returning JSON-formatted data.

## General Principles

-   **Base URL**: All API endpoints are relative to `/api`.
-   **Data Format**: The API exclusively uses JSON for requests and responses.
-   **Authentication**: Currently, all endpoints are public and do not require authentication.
-   **Error Handling**: The API uses standard HTTP status codes to indicate the success or failure of a request. Error responses include a JSON object with an `error` key.

## Data Models

### Creator

Represents a content creator in the archive.

```json
{
  "id": "Hoshimachi_Suisei",
  "name": "Hoshimachi Suisei",
  "worksCount": 5,
  "completeness": 0.03333333333333333
}
```

### Song

Represents a single musical work.

```json
{
  "title": "Stellar Stellar",
  "artist": "Hoshimachi Suisei",
  "Release_date": "2021-09-29",
  "source": "https://www.youtube.com/watch?v=a51_di-xI_w",
  "description": "The lead track from Suisei's first album, 'Still Still Stellar'.",
  "archived_by": "Vanguard",
  "archived_date": "2023-10-27",
  "audio": "Stellar_Stellar/audio.mp3",
  "thumbnail": "Stellar_Stellar/thumbnail.jpg",
  "analysis": "# Analysis of Stellar Stellar..."
}
```

### SearchResult

A condensed object representing a work found via the search endpoint.

```json
{
  "id": "Hoshimachi_Suisei/Stellar_Stellar",
  "creatorId": "Hoshimachi_Suisei",
  "title": "Stellar Stellar",
  "artist": "Hoshimachi Suisei",
  "type": "song",
  "release_date": "2021-09-29",
  "thumbnail": "creators/Hoshimachi_Suisei/Music/Singles/Stellar_Stellar/thumbnail.jpg",
  "description": "The lead track from Suisei's first album, 'Still Still Stellar'.",
  "source": "https://www.youtube.com/watch?v=a51_di-xI_w"
}
```

## Endpoints

### 1. List Creators

-   **Endpoint**: `GET /api/creator`
-   **Description**: Retrieves a list of all creators in the archive.
-   **Response**: A JSON object containing a list of `Creator` objects.

**Example Response:**

```json
{
  "creators": [
    {
      "id": "Hoshimachi_Suisei",
      "name": "Hoshimachi Suisei",
      "worksCount": 5,
      "completeness": 0.03333333333333333
    }
  ]
}
```

### 2. Get Songs for a Creator

-   **Endpoint**: `GET /api/creator/[id]/songs`
-   **Description**: Retrieves a list of all songs for a specific creator, identified by their `id`.
-   **URL Parameters**:
    -   `id` (string): The ID of the creator (e.g., `Hoshimachi_Suisei`).
-   **Response**: A JSON array of `Song` objects.

**Example Response:** `GET /api/creator/Hoshimachi_Suisei/songs`

```json
[
  {
    "title": "3時12分",
    "artist": "TAKU INOUE & 星街すいせい",
    "Release_date": "2021-07-14",
    "source": "https://www.youtube.com/watch?v=zW_2a-ap-nI",
    "description": "...",
    "audio": "「3時12分  TAKU INOUE & 星街すいせい」MUSIC VIDEO/audio.mp3",
    "thumbnail": "「3時12分  TAKU INOUE & 星街すいせい」MUSIC VIDEO/thumbnail.jpg",
    "analysis": "..."
  },
  {
    "title": "みちづれ",
    "artist": "星街すいせい",
    "Release_date": "2023-01-25",
    "source": "https://www.youtube.com/watch?v=t2pr8_GoA1c",
    "description": "...",
    "audio": "星街すいせい - みちづれ  THE FIRST TAKE/audio.mp3",
    "thumbnail": "星街すいせい - みちづれ  THE FIRST TAKE/thumbnail.jpg",
    "analysis": "..."
  }
]
```

### 3. Search Works

-   **Endpoint**: `GET /api/search`
-   **Description**: Searches for works across all creators based on a query and filters.
-   **Query Parameters**:
    -   `q` (string): The search query text. Matches against title, artist, description, themes, and emotional tags.
    -   `type` (string): Filter by the type of work (e.g., `song`).
    -   `creator` (string): Filter by a creator's ID.
    -   `genre` (string): Filter by genre.
    -   `dateFrom` (string): Filter for works released after this date (YYYY-MM-DD).
    -   `dateTo` (string): Filter for works released before this date (YYYY-MM-DD).
-   **Response**: A JSON object containing a list of `SearchResult` objects and the total count.

**Example Request**: `GET /api/search?q=stellar&creator=Hoshimachi_Suisei`

**Example Response:**

```json
{
  "results": [
    {
      "id": "Hoshimachi_Suisei/Stellar_Stellar",
      "creatorId": "Hoshimachi_Suisei",
      "title": "Stellar Stellar",
      "artist": "Hoshimachi Suisei",
      "type": "song",
      "release_date": "2021-09-29",
      "thumbnail": "creators/Hoshimachi_Suisei/Music/Singles/Stellar_Stellar/thumbnail.jpg",
      "description": "The lead track from Suisei's first album, 'Still Still Stellar'.",
      "source": "https://www.youtube.com/watch?v=a51_di-xI_w"
    }
  ],
  "total": 1
}
```

## Static Assets (Audio and Images)

Audio and thumbnail files are not served directly through the API. They are treated as static assets. The API provides relative paths to these files. The frontend is responsible for constructing the full URL to serve these files from the `public` directory or a similar mechanism.

The API endpoints `api/audio/route.ts` and `api/image/route.ts` are likely intended to proxy these requests in the future, providing a layer of abstraction or authentication if needed.
