import os

# Paths
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
ARCHIVE_ROOT = os.path.join(PROJECT_ROOT, "archive")
CREATORS_PATH = os.path.join(ARCHIVE_ROOT, "creators")

# Supported formats
AUDIO_FORMATS = ['.flac', '.mp3', '.m4a', '.wav', '.opus']
VIDEO_FORMATS = ['.mp4', '.webm', '.mkv']

# Metadata defaults
DEFAULT_METADATA = {
    "type": "song",
    "archived_date": "",
    "cultural_significance": "Part of digital culture preservation project.",
    "why_archived": "Ephemeral content risk / Cultural significance."
}

# yt-dlp settings
YTDLP_AUDIO_FORMAT = "bestaudio[ext=webm]/bestaudio"
YTDLP_OUTPUT_FORMAT = "flac"  # lossless preferred