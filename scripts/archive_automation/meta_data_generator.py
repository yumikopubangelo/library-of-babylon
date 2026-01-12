# -*- coding: utf-8 -*-
"""
Metadata Generator for Library of Babylon
Auto-generates comprehensive metadata from audio files.

CHANGES from v1.0:
- Default output: metadata.json (not {title}_metadata.json)
- Folder structure awareness
- Overwrite protection
- Integration with safe_folder_name()
"""

import os
import json
from datetime import datetime
from mutagen.flac import FLAC
from mutagen.mp4 import MP4
import hashlib
from typing import Optional, Dict, Any
from pathlib import Path
import shutil

# Metadata schema version - CRITICAL for future migrations
METADATA_VERSION = "1.0.0"

def safe_folder_name(name: str) -> str:
    """
    Make folder-name safe for Windows/Linux.
    Removes filesystem-unsafe characters.
    """
    banned = r'\/:*?"<>|'
    cleaned = "".join(c for c in name if c not in banned)
    return cleaned.strip() or "Untitled"


def generate_metadata(file_path: str, creator_name: str = "Hoshimachi Suisei") -> Dict[str, Any]:
    """
    Auto-generate metadata JSON from audio/video file.
    Extracts: title, duration, file hash, etc.
    
    Args:
        file_path: Path to audio/video file
        creator_name: Name of the creator (for consistent attribution)
    
    Returns:
        Complete metadata dictionary
    """
    
    # Validate file exists
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    # Detect file type
    ext = os.path.splitext(file_path)[1].lower()
    
    metadata = {
        # === CORE IDENTIFICATION ===
        "schema_version": METADATA_VERSION,  # NEW: For future-proofing
        "title": "",
        "title_native": "",
        "title_romanized": "",  # NEW: For searchability
        "type": "song",
        
        # === TEMPORAL DATA ===
        "release_date": "",
        "archived_date": datetime.now().strftime("%Y-%m-%d"),
        "last_updated": datetime.now().isoformat(),  # NEW: Track updates
        
        # === FILE REFERENCES ===
        "files": {
            "audio": os.path.basename(file_path),
            "video": "",
            "thumbnail": "",
            "lyrics": "",
            "cover_art": ""  # NEW: For album art
        },
        
        # === TECHNICAL METADATA ===
        "technical": {
            "duration_seconds": 0,
            "duration_human": "",  # NEW: e.g., "3:45"
            "file_size_bytes": os.path.getsize(file_path),
            "file_size_human": format_file_size(os.path.getsize(file_path)),  # NEW
            "format": ext[1:],
            "sha256": calculate_hash(file_path),
            "bitrate": None,  # NEW: Audio quality info
            "sample_rate": None,  # NEW: For audio engineers
            "channels": None  # NEW: Mono/Stereo info
        },
        
        # === CREATIVE CREDITS ===
        "credits": {
            "artist": creator_name,
            "composer": "",
            "lyricist": "",
            "arranger": "",
            "producer": "",  # NEW
            "mixing": "",  # NEW
            "mastering": "",  # NEW
            "illustration": "",  # NEW: For cover art
            "video_direction": ""  # NEW: For MVs
        },
        
        # === CONTENT CLASSIFICATION ===
        "classification": {
            "category": "singles",  # singles, albums, covers, unarchived
            "genre": [],  # NEW: ["J-Pop", "Electronic"]
            "themes": [],
            "emotional_tags": [],
            "language": "ja",  # NEW: ISO 639-1 code
            "explicit": False  # NEW: Content rating
        },
        
        # === SOURCE & PROVENANCE ===
        "source": {
            "platform": "",  # NEW: YouTube, Streaming, etc.
            "url": "",  # NEW: Original source URL
            "upload_date": "",  # NEW: When it was originally published
            "availability": "available"  # NEW: available, limited, removed
        },
        
        # === PRESERVATION CONTEXT ===
        "preservation": {
            "why_archived": "Part of creator's complete discography preservation.",
            "cultural_significance": "",
            "historical_context": "",  # NEW: What was happening when released
            "archivist_notes": "",  # NEW: Personal observations
            "verification_status": "unverified",  # NEW: verified, unverified, disputed
            "completeness": {  # NEW: Track what's missing
                "has_lyrics": False,
                "has_translation": False,
                "has_analysis": False,
                "has_cover_art": False,
                "has_video": False
            }
        },
        
        # === RELATIONSHIPS ===
        "related_works": {  # NEW: Connect works together
            "album": "",  # Which album this belongs to
            "era": "",  # Creator's career phase
            "part_of_series": [],  # If part of a song series
            "inspired_by": [],  # Referenced works
            "references": []  # Cultural references in the work
        }
    }
    
    # Extract metadata from file
    try:
        if ext == '.flac':
            audio = FLAC(file_path)
            _extract_flac_metadata(audio, metadata)
        elif ext in ['.mp4', '.m4a']:
            audio = MP4(file_path)
            _extract_mp4_metadata(audio, metadata)
        elif ext == '.webm':
            # WebM metadata extraction is limited
            metadata['technical']['duration_seconds'] = 0
    except Exception as e:
        metadata['preservation']['archivist_notes'] = f"Metadata extraction warning: {str(e)}"
    
    # Calculate human-readable duration
    if metadata['technical']['duration_seconds'] > 0:
        metadata['technical']['duration_human'] = format_duration(
            metadata['technical']['duration_seconds']
        )
    
    return metadata


def _extract_flac_metadata(audio: FLAC, metadata: Dict[str, Any]) -> None:
    """Extract metadata from FLAC file."""
    metadata['title'] = audio.get('title', [''])[0]
    metadata['title_native'] = audio.get('title', [''])[0]
    metadata['technical']['duration_seconds'] = int(audio.info.length)
    metadata['technical']['bitrate'] = audio.info.bitrate
    metadata['technical']['sample_rate'] = audio.info.sample_rate
    metadata['technical']['channels'] = audio.info.channels
    metadata['credits']['composer'] = audio.get('composer', [''])[0]
    metadata['credits']['lyricist'] = audio.get('lyricist', [''])[0]
    metadata['credits']['artist'] = audio.get('artist', [metadata['credits']['artist']])[0]
    
    # Extract album info if present
    album = audio.get('album', [''])[0]
    if album:
        metadata['related_works']['album'] = album


def _extract_mp4_metadata(audio: MP4, metadata: Dict[str, Any]) -> None:
    """Extract metadata from MP4/M4A file."""
    metadata['title'] = audio.get('\xa9nam', [''])[0]
    metadata['title_native'] = audio.get('\xa9nam', [''])[0]
    metadata['technical']['duration_seconds'] = int(audio.info.length)
    metadata['technical']['bitrate'] = audio.info.bitrate
    metadata['technical']['sample_rate'] = audio.info.sample_rate
    metadata['technical']['channels'] = audio.info.channels
    metadata['credits']['artist'] = audio.get('\xa9ART', [metadata['credits']['artist']])[0]
    metadata['credits']['composer'] = audio.get('\xa9wrt', [''])[0]
    
    # Extract album info
    album = audio.get('\xa9alb', [''])[0]
    if album:
        metadata['related_works']['album'] = album


def calculate_hash(file_path: str) -> str:
    """
    Calculate SHA256 hash for file integrity verification.
    This ensures the file hasn't been corrupted or modified.
    """
    sha256 = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b""):  # Increased chunk size
            sha256.update(chunk)
    return sha256.hexdigest()


def format_file_size(size_bytes: int) -> str:
    """Convert bytes to human-readable format."""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} PB"


def format_duration(seconds: int) -> str:
    """Convert seconds to MM:SS or HH:MM:SS format."""
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    
    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    else:
        return f"{minutes}:{secs:02d}"


def save_metadata_json(metadata: Dict[str, Any], output_path: str, 
                       overwrite: bool = False) -> None:
    """
    Save metadata to JSON file with proper formatting.
    
    Args:
        metadata: Metadata dictionary
        output_path: Path to save JSON file
        overwrite: If False, will prompt before overwriting
    """
    # Check if file exists
    if os.path.exists(output_path) and not overwrite:
        response = input(f"⚠️  {output_path} already exists. Overwrite? (y/n): ")
        if response.lower() != 'y':
            print("❌ Cancelled. Metadata not saved.")
            return
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    print(f"✓ Metadata saved: {output_path}")


def organize_into_structure(
    audio_file: str,
    metadata: Dict[str, Any],
    creator_name: str,
    archive_root: Optional[Path] = None,
    move_file: bool = True
) -> Path:
    """
    Organize audio file into proper archive structure.
    Creates: archive/creators/{Creator}/Music/Singles/{Title}/
    
    Args:
        audio_file: Path to audio file
        metadata: Generated metadata
        creator_name: Creator name for folder structure
        archive_root: Root archive path (default: ../../archive from script)
        move_file: If True, move audio file; if False, copy
    
    Returns:
        Path to created song folder
    """
    # Determine archive root
    if archive_root is None:
        script_dir = Path(__file__).parent
        archive_root = script_dir.parent / "archive"
    
    # Get safe title for folder name
    title = metadata.get('title') or Path(audio_file).stem
    safe_title = safe_folder_name(title)
    
    # Create folder structure
    song_folder = archive_root / "creators" / creator_name / "Music" / "Singles" / safe_title
    song_folder.mkdir(parents=True, exist_ok=True)
    
    # Move/copy audio file
    audio_dest = song_folder / Path(audio_file).name
    
    if move_file:
        shutil.move(audio_file, audio_dest)
        print(f"✓ Moved audio to: {song_folder.name}/")
    else:
        shutil.copy2(audio_file, audio_dest)
        print(f"✓ Copied audio to: {song_folder.name}/")
    
    # Update metadata with relative audio path
    metadata['files']['audio'] = Path(audio_file).name
    
    # Save metadata
    metadata_path = song_folder / "metadata.json"
    save_metadata_json(metadata, str(metadata_path), overwrite=True)
    
    return song_folder


def validate_metadata(metadata: Dict[str, Any]) -> tuple[bool, list[str]]:
    """
    Validate metadata completeness and flag missing critical fields.
    
    Returns:
        (is_valid, list_of_warnings)
    """
    warnings = []
    
    # Critical fields that should always be present
    if not metadata.get('title'):
        warnings.append("Missing title")
    if not metadata.get('release_date'):
        warnings.append("Missing release date - please add manually")
    if not metadata['credits'].get('artist'):
        warnings.append("Missing artist name")
    if not metadata['source'].get('url'):
        warnings.append("Missing source URL - recommended for provenance")
    
    # Check file references
    if not metadata['files'].get('audio'):
        warnings.append("No audio file referenced")
    
    is_valid = len(warnings) == 0
    return is_valid, warnings


# Usage
if __name__ == "__main__":
    import sys
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Generate metadata for Library of Babylon archive"
    )
    parser.add_argument("audio_file", help="Path to audio file")
    parser.add_argument("--creator", default="Hoshimachi Suisei", 
                       help="Creator name")
    parser.add_argument("--organize", action="store_true",
                       help="Organize file into proper archive structure")
    parser.add_argument("--copy", action="store_true",
                       help="Copy file instead of moving (with --organize)")
    parser.add_argument("--output", help="Custom output path for metadata")
    parser.add_argument("--legacy-naming", action="store_true",
                       help="Use old naming convention ({title}_metadata.json)")
    
    args = parser.parse_args()
    
    file_path = args.audio_file
    creator_name = args.creator
    
    if not os.path.exists(file_path):
        print(f"❌ Error: File not found: {file_path}")
        sys.exit(1)
    
    print(f"📝 Generating metadata for: {file_path}")
    print(f"👤 Creator: {creator_name}\n")
    
    # Generate metadata
    metadata = generate_metadata(file_path, creator_name)
    
    # Validate
    is_valid, warnings = validate_metadata(metadata)
    
    if warnings:
        print("⚠️  Warnings:")
        for warning in warnings:
            print(f"  - {warning}")
        print()
    
    # Save or organize
    if args.organize:
        # Organize into proper structure
        song_folder = organize_into_structure(
            file_path,
            metadata,
            creator_name,
            move_file=not args.copy
        )
        print(f"\n✅ Work organized in: {song_folder}")
        
    else:
        # Just save metadata in current location
        if args.output:
            output_path = args.output
        elif args.legacy_naming:
            base_name = os.path.splitext(file_path)[0]
            output_path = f"{base_name}_metadata.json"
        else:
            # NEW DEFAULT: metadata.json in same folder
            file_dir = os.path.dirname(file_path) or "."
            output_path = os.path.join(file_dir, "metadata.json")
        
        save_metadata_json(metadata, output_path)
    
    # Show completeness status
    completeness = metadata['preservation']['completeness']
    print("\n📊 Completeness Status:")
    print(f"  Lyrics: {'✓' if completeness['has_lyrics'] else '✗'}")
    print(f"  Translation: {'✓' if completeness['has_translation'] else '✗'}")
    print(f"  Analysis: {'✓' if completeness['has_analysis'] else '✗'}")
    print(f"  Cover Art: {'✓' if completeness['has_cover_art'] else '✗'}")
    print(f"  Video: {'✓' if completeness['has_video'] else '✗'}")
    
    print(f"\n✅ Next steps:")
    if not args.organize:
        print(f"  1. Move to proper folder structure (use --organize)")
        print(f"  2. Review and edit metadata")
    else:
        print(f"  1. Review metadata in folder")
    print(f"  2. Add missing fields (release_date, source URL, etc.)")
    print(f"  3. Run analysis generator")
    print(f"  4. Extract lyrics if available")