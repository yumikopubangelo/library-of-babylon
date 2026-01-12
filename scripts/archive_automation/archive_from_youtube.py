# -*- coding: utf-8 -*-
"""
Interactive YouTube Archive Script
Downloads audio, thumbnail, extracts metadata (including release date), collects lyrics, and generates analysis.
"""

import os
import subprocess
import sys
from pathlib import Path
import shutil
import json
from datetime import datetime

from meta_data_generator import generate_metadata, save_metadata_json, validate_metadata
from analysis_generator import generate_ai_analysis, save_analysis
from lyrics_processor import extract_lyrics, save_lyrics, validate_lyrics


def safe_folder_name(name: str) -> str:
    """
    Make folder-name safe for Windows/Linux.
    """
    banned = r'\/:*?"<>|'
    cleaned = "".join(c for c in name if c not in banned)
    return cleaned.strip() or "Untitled"


def print_separator(char="=", length=70):
    """Print a visual separator."""
    print(char * length)


def get_multiline_input(prompt: str) -> str:
    """
    Get multiline input from user.
    User ends input with Ctrl+D (Unix) or Ctrl+Z (Windows).
    """
    print(f"\n{prompt}")
    print("(End input with Ctrl+D on Unix/Mac or Ctrl+Z then Enter on Windows)")
    print("-" * 70)
    
    lines = []
    try:
        while True:
            line = input()
            lines.append(line)
    except EOFError:
        pass
    
    return '\n'.join(lines).strip()


def get_optional_input(prompt: str, default: str = "") -> str:
    """Get optional input with a default value."""
    user_input = input(f"{prompt} [{default}]: ").strip()
    return user_input if user_input else default


def extract_youtube_metadata(url: str) -> dict:
    """
    Extract metadata from YouTube without downloading.
    Gets: title, upload_date, description, etc.
    
    Returns:
        Dictionary with YouTube metadata
    """
    print("   Extracting YouTube metadata...")
    
    cmd = [
        "yt-dlp",
        "--dump-json",
        "--no-playlist",
        url
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        yt_metadata = json.loads(result.stdout)
        
        return {
            'title': yt_metadata.get('title', ''),
            'upload_date': yt_metadata.get('upload_date', ''),  # YYYYMMDD format
            'uploader': yt_metadata.get('uploader', ''),
            'description': yt_metadata.get('description', ''),
            'duration': yt_metadata.get('duration', 0),
            'thumbnail': yt_metadata.get('thumbnail', ''),
        }
    except subprocess.CalledProcessError as e:
        print(f"   ⚠️  Could not extract YouTube metadata: {e}")
        return {}
    except json.JSONDecodeError as e:
        print(f"   ⚠️  Could not parse YouTube metadata: {e}")
        return {}


def format_youtube_date(yt_date: str) -> str:
    """
    Convert YouTube date from YYYYMMDD to YYYY-MM-DD.
    
    Args:
        yt_date: Date in YYYYMMDD format (e.g., '20230510')
    
    Returns:
        Date in YYYY-MM-DD format (e.g., '2023-05-10')
    """
    if not yt_date or len(yt_date) != 8:
        return ""
    
    try:
        year = yt_date[:4]
        month = yt_date[4:6]
        day = yt_date[6:8]
        return f"{year}-{month}-{day}"
    except:
        return ""


def download_thumbnail(url: str, output_dir: Path) -> Path:
    """
    Download thumbnail from YouTube video.
    
    Args:
        url: YouTube URL
        output_dir: Directory to save thumbnail
    
    Returns:
        Path to downloaded thumbnail, or None if failed
    """
    print("   Downloading thumbnail...")
    
    # Template for thumbnail filename
    output_template = str(output_dir / "%(title)s.%(ext)s")
    
    cmd = [
        "yt-dlp",
        "--write-thumbnail",
        "--skip-download",
        "--convert-thumbnails", "jpg",  # Convert to JPG for consistency
        "--restrict-filenames",
        "-o", output_template,
        url
    ]
    
    try:
        subprocess.run(cmd, capture_output=True, check=True)
        
        # Find downloaded thumbnail
        thumbnail_files = list(output_dir.glob("*.jpg")) + list(output_dir.glob("*.webp")) + list(output_dir.glob("*.png"))
        
        if thumbnail_files:
            # Get the most recently created thumbnail
            thumbnail_file = max(thumbnail_files, key=os.path.getctime)
            print(f"   ✓ Thumbnail downloaded: {thumbnail_file.name}")
            return thumbnail_file
        else:
            print("   ⚠️  Thumbnail not found after download")
            return None
            
    except subprocess.CalledProcessError as e:
        print(f"   ⚠️  Could not download thumbnail: {e}")
        return None


def collect_lyrics_interactive() -> dict:
    """
    Interactively collect lyrics from user.
    Returns lyrics data dictionary.
    """
    print_separator()
    print("LYRICS COLLECTION")
    print_separator()
    print()
    
    # Ask if user wants to add lyrics now
    add_lyrics = input("Do you want to add lyrics now? (y/n) [y]: ").strip().lower()
    if add_lyrics == 'n':
        print("Skipping lyrics. You can add them later by editing metadata.json")
        return None
    
    print("\n📝 Please provide the lyrics in the following order:")
    print("   1. Japanese (original)")
    print("   2. Romaji (optional)")
    print("   3. English translation (optional)")
    print()
    
    # Collect Japanese lyrics
    japanese = get_multiline_input("JAPANESE LYRICS (original):")
    
    if not japanese:
        print("\n⚠️  No Japanese lyrics provided. Skipping lyrics collection.")
        return None
    
    # Collect Romaji
    print()
    add_romaji = input("Add Romaji? (y/n) [n]: ").strip().lower()
    romaji = ""
    if add_romaji == 'y':
        romaji = get_multiline_input("ROMAJI LYRICS:")
    
    # Collect English translation
    print()
    add_english = input("Add English translation? (y/n) [n]: ").strip().lower()
    english = ""
    translator = ""
    confidence = "high"
    
    if add_english == 'y':
        english = get_multiline_input("ENGLISH TRANSLATION:")
        
        if english:
            translator = get_optional_input("Translator name", "Manual translation")
            confidence = get_optional_input(
                "Translation confidence (high/medium/low/machine)", 
                "high"
            )
    
    # Additional metadata
    print()
    source = get_optional_input(
        "Lyrics source (official/community/manual/genius/utanet)", 
        "manual"
    )
    notes = get_optional_input("Any notes about these lyrics", "")
    
    # Create lyrics object
    lyrics_data = extract_lyrics(
        japanese=japanese,
        romaji=romaji,
        english=english,
        source=source,
        translator=translator,
        notes=notes,
        confidence=confidence
    )
    
    # Validate
    is_valid, warnings = validate_lyrics(lyrics_data)
    if warnings:
        print("\n⚠️  Lyrics Warnings:")
        for warning in warnings:
            print(f"   - {warning}")
    
    print("\n✓ Lyrics collected successfully!")
    return lyrics_data


def collect_additional_metadata(metadata: dict, yt_metadata: dict = None) -> dict:
    """
    Collect additional metadata that couldn't be auto-extracted.
    Pre-fills with YouTube metadata if available.
    """
    print_separator()
    print("ADDITIONAL METADATA")
    print_separator()
    print()
    print("Let's fill in some additional information about this song.")
    print("(Press Enter to skip or accept suggested values)")
    print()
    
    # Release date - pre-fill from YouTube if available
    if not metadata.get('release_date'):
        suggested_date = ""
        if yt_metadata and yt_metadata.get('upload_date'):
            suggested_date = format_youtube_date(yt_metadata['upload_date'])
        
        if suggested_date:
            print(f"Auto-detected release date: {suggested_date}")
            use_detected = input("Use this date? (y/n) [y]: ").strip().lower()
            if use_detected != 'n':
                metadata['release_date'] = suggested_date
            else:
                release_date = input("Release date (YYYY-MM-DD): ").strip()
                if release_date:
                    metadata['release_date'] = release_date
        else:
            release_date = input("Release date (YYYY-MM-DD): ").strip()
            if release_date:
                metadata['release_date'] = release_date
    
    # Source URL (should already be set, but double check)
    if not metadata.get('source', {}).get('url'):
        print("\n⚠️  Source URL is missing!")
        source_url = input("Original source URL (important for provenance): ").strip()
        if source_url:
            if 'source' not in metadata:
                metadata['source'] = {}
            metadata['source']['url'] = source_url
            metadata['source']['platform'] = 'YouTube'
    
    # Add upload date to source if available
    if yt_metadata and yt_metadata.get('upload_date'):
        if 'source' not in metadata:
            metadata['source'] = {}
        metadata['source']['upload_date'] = format_youtube_date(yt_metadata['upload_date'])
    
    # Credits
    print("\n--- Credits ---")
    composer = get_optional_input("Composer", metadata['credits'].get('composer', ''))
    if composer:
        metadata['credits']['composer'] = composer
    
    lyricist = get_optional_input("Lyricist", metadata['credits'].get('lyricist', ''))
    if lyricist:
        metadata['credits']['lyricist'] = lyricist
    
    arranger = get_optional_input("Arranger", metadata['credits'].get('arranger', ''))
    if arranger:
        metadata['credits']['arranger'] = arranger
    
    # Classification
    print("\n--- Classification ---")
    genre = input("Genre (comma-separated, e.g. 'J-Pop, Ballad'): ").strip()
    if genre:
        if 'classification' not in metadata:
            metadata['classification'] = {}
        metadata['classification']['genre'] = [g.strip() for g in genre.split(',')]
    
    themes = input("Themes (comma-separated, e.g. 'loneliness, perseverance'): ").strip()
    if themes:
        if 'classification' not in metadata:
            metadata['classification'] = {}
        metadata['classification']['themes'] = [t.strip() for t in themes.split(',')]
    
    # Why archived
    print("\n--- Preservation Context ---")
    why = input("Why are you archiving this song? (brief reason): ").strip()
    if why:
        if 'preservation' not in metadata:
            metadata['preservation'] = {}
        metadata['preservation']['why_archived'] = why
    
    return metadata


def archive_from_youtube(url: str, creator_name: str, interactive: bool = True):
    """
    Complete one-command pipeline:
    1. Extract YouTube metadata (release date, thumbnail URL)
    2. Download YouTube audio
    3. Download thumbnail
    4. Convert to FLAC
    5. Generate metadata (with auto-filled release date)
    6. Collect lyrics (interactive)
    7. Generate analysis
    8. Create organized song folder
    
    Args:
        url: YouTube URL
        creator_name: Creator folder name (e.g., "Hoshimachi_Suisei")
        interactive: If True, prompt for lyrics and additional metadata
    """
    
    print_separator("=")
    print("LIBRARY OF BABYLON - YouTube Archive Pipeline")
    print_separator("=")
    print(f"\n📹 Source: {url}")
    print(f"👤 Creator: {creator_name}")
    print()
    
    # === BASE PATH ===
    project_root = Path(__file__).resolve().parents[2]
    archive_root = project_root / "archive" / "creators" / creator_name / "Music" / "Singles"
    archive_root.mkdir(parents=True, exist_ok=True)

    # === EXTRACT YOUTUBE METADATA ===
    print_separator("-")
    print("STEP 1: Extracting YouTube Metadata")
    print_separator("-")
    
    yt_metadata = extract_youtube_metadata(url)
    
    if yt_metadata:
        print(f"   ✓ Title: {yt_metadata.get('title', 'Unknown')}")
        if yt_metadata.get('upload_date'):
            formatted_date = format_youtube_date(yt_metadata['upload_date'])
            print(f"   ✓ Upload Date: {formatted_date}")
        print(f"   ✓ Duration: {yt_metadata.get('duration', 0)}s")
    
    # === DOWNLOAD THUMBNAIL ===
    print("\n")
    print_separator("-")
    print("STEP 2: Downloading Thumbnail")
    print_separator("-")
    
    thumbnail_file = download_thumbnail(url, archive_root)

    # === DOWNLOAD AUDIO ===
    print("\n")
    print_separator("-")
    print("STEP 3: Downloading Audio")
    print_separator("-")
    
    output_template = str(archive_root / "%(title)s.%(ext)s")

    cmd = [
        "yt-dlp",
        "-f", "bestaudio/best",
        "--extract-audio",
        "--audio-format", "flac",
        "--add-metadata",
        "--embed-thumbnail",
        "--restrict-filenames",
        "-o", output_template,
        url
    ]

    subprocess.run(cmd, check=True)

    # === FIND DOWNLOADED FILE ===
    flac_files = list(archive_root.glob("*.flac"))
    if not flac_files:
        raise FileNotFoundError("No FLAC file found after download.")

    audio_file = max(flac_files, key=os.path.getctime)
    print(f"\n✓ Audio downloaded: {audio_file.name}")

    # === GENERATE METADATA ===
    print("\n")
    print_separator("-")
    print("STEP 4: Generating Metadata")
    print_separator("-")
    
    metadata = generate_metadata(str(audio_file), creator_name)
    
    # Add source URL and platform to metadata
    if 'source' not in metadata:
        metadata['source'] = {}
    metadata['source']['url'] = url
    metadata['source']['platform'] = 'YouTube'
    
    # Auto-fill release date from YouTube metadata
    if yt_metadata and yt_metadata.get('upload_date') and not metadata.get('release_date'):
        metadata['release_date'] = format_youtube_date(yt_metadata['upload_date'])
        metadata['source']['upload_date'] = metadata['release_date']
        print(f"   ✓ Auto-filled release date: {metadata['release_date']}")
    
    # Validate metadata
    is_valid, warnings = validate_metadata(metadata)
    if warnings:
        print("\n⚠️  Metadata Warnings:")
        for warning in warnings:
            print(f"   - {warning}")
    
    print(f"\n✓ Metadata generated")
    print(f"   Title: {metadata.get('title', 'Unknown')}")
    print(f"   Duration: {metadata.get('technical', {}).get('duration_human', 'Unknown')}")
    
    # === COLLECT ADDITIONAL METADATA (Interactive) ===
    if interactive:
        metadata = collect_additional_metadata(metadata, yt_metadata)
    
    # === COLLECT LYRICS (Interactive) ===
    lyrics_data = None
    if interactive:
        lyrics_data = collect_lyrics_interactive()
    
    # === CREATE SONG FOLDER ===
    print("\n")
    print_separator("-")
    print("STEP 5: Organizing Files")
    print_separator("-")
    
    raw_title = metadata.get("title") or audio_file.stem
    song_title = safe_folder_name(raw_title)

    song_folder = archive_root / song_title
    song_folder.mkdir(parents=True, exist_ok=True)

    # === MOVE AUDIO ===
    final_audio_path = song_folder / audio_file.name
    shutil.move(str(audio_file), final_audio_path)
    print(f"✓ Moved audio to: {song_folder.name}/")

    # === MOVE THUMBNAIL ===
    if thumbnail_file and thumbnail_file.exists():
        # Rename to standard format: thumbnail.jpg
        thumbnail_dest = song_folder / "thumbnail.jpg"
        shutil.move(str(thumbnail_file), thumbnail_dest)
        metadata['files']['thumbnail'] = "thumbnail.jpg"
        metadata['preservation']['completeness']['has_cover_art'] = True
        print(f"✓ Moved thumbnail to: {song_folder.name}/thumbnail.jpg")

    # === UPDATE METADATA with final paths ===
    metadata["files"]["audio"] = final_audio_path.name
    
    # Update completeness tracking
    if 'preservation' not in metadata:
        metadata['preservation'] = {}
    if 'completeness' not in metadata['preservation']:
        metadata['preservation']['completeness'] = {}
    
    metadata['preservation']['completeness']['has_lyrics'] = lyrics_data is not None
    metadata['preservation']['completeness']['has_translation'] = (
        lyrics_data is not None and 
        bool(lyrics_data.get('language_versions', {}).get('en', '').strip())
    )
    
    # === SAVE METADATA ===
    metadata_path = song_folder / "metadata.json"
    save_metadata_json(metadata, str(metadata_path))
    
    # === SAVE LYRICS ===
    if lyrics_data:
        lyrics_path = song_folder / "lyrics.json"
        save_lyrics(lyrics_data, str(lyrics_path))
        metadata['files']['lyrics'] = "lyrics.json"
        # Re-save metadata with lyrics reference
        save_metadata_json(metadata, str(metadata_path))

    # === GENERATE ANALYSIS ===
    print("\n")
    print_separator("-")
    print("STEP 6: Generating Analysis Template")
    print_separator("-")
    
    analysis_md = generate_ai_analysis(metadata, lyrics_data, include_placeholders=True)
    analysis_path = song_folder / "analysis.md"
    save_analysis(analysis_md, str(analysis_path))
    
    metadata['preservation']['completeness']['has_analysis'] = True
    # Final save with analysis reference
    save_metadata_json(metadata, str(metadata_path))

    # === COMPLETION SUMMARY ===
    print("\n")
    print_separator("=")
    print("✅ ARCHIVE COMPLETE")
    print_separator("=")
    print(f"\n📁 Location: {song_folder}")
    print(f"\n📊 Completeness Status:")
    completeness = metadata['preservation']['completeness']
    print(f"   Audio:       ✓")
    print(f"   Metadata:    ✓")
    print(f"   Thumbnail:   {'✓' if completeness.get('has_cover_art') else '✗ (not found)'}")
    print(f"   Release Date: {'✓ (auto-detected)' if metadata.get('release_date') else '✗ (add manually)'}")
    print(f"   Lyrics:      {'✓' if completeness['has_lyrics'] else '✗ (add manually later)'}")
    print(f"   Translation: {'✓' if completeness['has_translation'] else '✗ (add manually later)'}")
    print(f"   Analysis:    ✓ (template - needs manual filling)")
    
    print(f"\n📝 Next Steps:")
    print(f"   1. Review metadata: {metadata_path.name}")
    if lyrics_data:
        print(f"   2. Review lyrics: lyrics.json")
    print(f"   3. Fill in analysis: {analysis_path.name}")
    if not completeness.get('has_cover_art'):
        print(f"   4. Add cover art manually if thumbnail download failed")
    print(f"   5. Update completeness status as you add more content")
    
    print(f"\n🎉 {metadata.get('title', 'Song')} has been preserved!")
    print()


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage:")
        print("  python archive_from_youtube.py <youtube_url> <creator_name> [--no-interactive]")
        print()
        print("Examples:")
        print("  python archive_from_youtube.py 'https://youtu.be/...' 'Hoshimachi_Suisei'")
        print("  python archive_from_youtube.py 'https://youtu.be/...' 'Hoshimachi_Suisei' --no-interactive")
        print()
        print("Interactive mode (default):")
        print("  - Prompts for lyrics (Japanese, Romaji, English)")
        print("  - Prompts for additional metadata (composer, genre, etc.)")
        print("  - Recommended for complete archiving")
        print()
        print("Non-interactive mode (--no-interactive):")
        print("  - Only auto-extracts metadata from file")
        print("  - Faster, but requires manual editing later")
        print()
        print("Features:")
        print("  ✓ Auto-downloads thumbnail")
        print("  ✓ Auto-detects release date from YouTube")
        print("  ✓ Extracts complete metadata")
        print("  ✓ Generates analysis template")
        sys.exit(1)

    url = sys.argv[1]
    creator = sys.argv[2]
    interactive = "--no-interactive" not in sys.argv

    try:
        archive_from_youtube(url, creator, interactive=interactive)
    except KeyboardInterrupt:
        print("\n\n⚠️  Process interrupted by user.")
        print("Partial files may have been created. Check the Singles folder.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)