import os
import json
import sys
from meta_data_generator import generate_metadata
from lyrics_processor import extract_lyrics, translate_lyrics
from analysis_generator import generate_ai_analysis

def process_song_complete(audio_file, creator_name):
    """
    Complete workflow:
    1. Generate metadata JSON
    2. Extract lyrics (if embedded, or manual input)
    3. Generate analysis (AI-assisted or manual template)
    4. Organize into folder structure
    """
    
    # Step 1: Basic metadata
    metadata = generate_metadata(audio_file)
    
    # Step 2: Lyrics (manual for now, AI OCR from video later)
    print("Lyrics extraction: Manual input required")
    print("Paste Japanese lyrics, then Romanized, then English translation")
    # (Interactive input or read from separate files)
    
    # Step 3: Analysis template
    analysis_template = f"""
# {metadata['title']} - Analysis

## Basic Information
- Artist: {metadata['credits']['artist']}
- Release: {metadata['release_date']}
- Duration: {metadata['technical']['duration_seconds']}s

## Themes
(To be filled manually)

## Lyrical Analysis
(To be filled manually—use template from "Mou Dou Natte mo Ii ya" analysis)

## Cultural Significance
(To be filled manually)

## Founder's Notes
(Your personal connection to this song)
"""
    
    # Save everything
    song_folder = f"archive/creators/{creator_name}/Music/Singles/{metadata['title']}/"
    os.makedirs(song_folder, exist_ok=True)
    
    # Save files
    with open(f"{song_folder}/metadata.json", 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    with open(f"{song_folder}/analysis.md", 'w', encoding='utf-8') as f:
        f.write(analysis_template)
    
    print(f"✓ Processed: {metadata['title']}")
    print(f"✓ Location: {song_folder}")
    print("Next: Fill in lyrics and analysis manually.")

if __name__ == "__main__":
    process_song_complete(sys.argv[1], sys.argv[2])