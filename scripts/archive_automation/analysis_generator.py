# -*- coding: utf-8 -*-
"""
Analysis Generator for Library of Babylon
Generates comprehensive markdown analysis documents for archived works.
"""

from datetime import datetime
from typing import Dict, Any, Optional
import os

def generate_ai_analysis(
    metadata: Dict[str, Any],
    lyrics_data: Optional[Dict[str, Any]] = None,
    include_placeholders: bool = True
) -> str:
    """
    Generate comprehensive analysis markdown template.
    
    Args:
        metadata: Metadata dictionary from meta_data_generator
        lyrics_data: Optional lyrics data from lyrics_processor
        include_placeholders: If True, include detailed placeholder text
    
    Returns:
        Markdown formatted analysis document
    """
    
    # Extract data with fallbacks
    title = metadata.get("title", "Untitled")
    title_native = metadata.get("title_native", "")
    artist = metadata.get("credits", {}).get("artist", "Unknown Artist")
    release = metadata.get("release_date", "Unknown")
    duration = metadata.get("technical", {}).get("duration_human", 
               f"{metadata.get('technical', {}).get('duration_seconds', 0)} seconds")
    archived_date = metadata.get("archived_date", datetime.now().strftime("%Y-%m-%d"))
    source_url = metadata.get("source", {}).get("url", "")
    
    # Check if we have lyrics
    has_lyrics = lyrics_data is not None
    has_japanese = has_lyrics and lyrics_data.get("language_versions", {}).get("ja", "").strip()
    has_english = has_lyrics and lyrics_data.get("language_versions", {}).get("en", "").strip()
    
    # Build header
    header = "---\n"
    header += f'title: "{title} - Analysis"\n'
    header += "work_type: song\n"
    header += f"artist: {artist}\n"
    header += f"analyzed_on: {datetime.now().strftime('%Y-%m-%d')}\n"
    header += "schema_version: 1.0.0\n"
    header += "status: draft\n"
    header += "---\n\n"
    
    # Build title section
    title_section = f"# {title} - Analysis\n\n"
    if title_native and title_native != title:
        title_section += f"**{title_native}**\n\n"
    title_section += "---\n\n"
    
    # Build basic info table
    basic_info = "## Basic Information\n\n"
    basic_info += "| Field | Value |\n"
    basic_info += "|-------|-------|\n"
    basic_info += f"| **Artist** | {artist} |\n"
    basic_info += f"| **Release Date** | {release} |\n"
    basic_info += f"| **Duration** | {duration} |\n"
    basic_info += f"| **Archived On** | {archived_date} |\n"
    if source_url:
        basic_info += f"| **Source** | [{source_url}]({source_url}) |\n"
    basic_info += "\n---\n\n"
    
    # Overview section
    overview = "## Overview\n\n"
    overview += _get_placeholder(include_placeholders, """
Write a concise, high-level description of the song (2-4 sentences):
- What is the song about at its core?
- What is the dominant emotional tone? (melancholic, triumphant, introspective, energetic, etc.)
- What makes this song distinctive or memorable?

Example:
"Comet" is a powerful ballad about loneliness and perseverance, centered around the metaphor of a solitary comet traveling through the cosmos. The song captures the duality of isolation and determination, expressing both the pain of being alone and the beauty of pursuing one's path despite it. Suisei's passionate vocal delivery elevates the emotional weight of the lyrics, making it one of her most iconic original works.
""")
    overview += "\n\n---\n\n"
    
    # Themes section
    themes = "## Themes\n\n"
    themes += _get_placeholder(include_placeholders, """
Identify 3-6 core themes present in the work:
- Loneliness / Isolation
- Perseverance / Determination
- Self-discovery
- Cosmic imagery / Scale
- Hope despite hardship
- Individual vs. collective

Each theme should be 1-2 words, bullet-pointed.
""")
    themes += "\n\n---\n\n"
    
    # Lyrical Analysis section
    lyrical = "## Lyrical Analysis\n\n"
    lyrical += "### Narrative Arc\n\n"
    lyrical += _get_placeholder(include_placeholders, """
Describe the story or emotional journey of the song:
- What is the narrative structure? (beginning -> middle -> end)
- Who is the speaker/protagonist?
- What journey do they undergo?
- How does the mood shift throughout the song?

Consider verse 1 -> chorus -> verse 2 -> bridge -> final chorus progression.
""")
    lyrical += "\n\n"
    
    lyrical += "### Key Lines & Interpretation\n\n"
    lyrical += _get_placeholder(include_placeholders, """
Choose 3-5 significant lines that capture the essence of the work.
For each line:

> "Quoted lyric line here"

**Interpretation:** 
Explain the emotional or symbolic meaning of this line.

Example:

> "Like a comet"

**Interpretation:** 
The comet metaphor serves as the central image of the song. Comets are beautiful yet solitary, traveling vast distances through empty space. This reflects the speaker's sense of isolation while pursuing their dreams - beautiful and determined, but fundamentally alone.
""")
    lyrical += "\n\n"
    
    # Add lyrics if available
    if has_lyrics:
        lyrical += _generate_lyrics_section(has_japanese, has_english, lyrics_data)
    
    lyrical += "---\n\n"
    
    # Musical section
    musical = "## Musical & Vocal Characteristics\n\n"
    musical += "### Vocal Performance\n\n"
    musical += _get_placeholder(include_placeholders, """
Analyze the vocal delivery:
- Vocal range utilized
- Emotional expression techniques (breathiness, power, restraint)
- Key moments of vocal impact
- How vocals support the lyrical themes
""")
    musical += "\n\n"
    
    musical += "### Arrangement & Production\n\n"
    musical += _get_placeholder(include_placeholders, """
Describe the musical arrangement:
- Instrumentation (strings, piano, synths, etc.)
- Production style (intimate/sparse vs. grandiose/orchestral)
- Key musical moments (intro, build-ups, drops, bridge)
- How arrangement supports emotional narrative
""")
    musical += "\n\n"
    
    musical += "### Genre & Influences\n\n"
    musical += _get_placeholder(include_placeholders, """
Classify and contextualize:
- Primary genre (J-Pop ballad, rock, electronic, etc.)
- Subgenre elements
- Comparable artists or works
- Musical influences or references
""")
    musical += "\n\n---\n\n"
    
    # Cultural context
    cultural = "## Cultural Context\n\n"
    cultural += "### Creator's Career Context\n\n"
    cultural += _get_placeholder(include_placeholders, """
Situate the work within the artist's career:
- What phase of their career was this released in?
- How does it fit into their broader discography?
- Was this a breakthrough work, or continuation of their style?
- Personal significance to the creator
""")
    cultural += "\n\n"
    
    cultural += "### Historical & Fandom Context\n\n"
    cultural += _get_placeholder(include_placeholders, """
Understand the work's cultural moment:
- What was happening in the creator's community when this released?
- How was it received by fans and peers?
- Did it mark any milestones? (subscriber counts, achievements, collaborations)
- Cultural events or trends that contextualize the work
""")
    cultural += "\n\n"
    
    cultural += "### Reception & Legacy\n\n"
    cultural += _get_placeholder(include_placeholders, """
Document the work's impact:
- Initial reception (views, comments, covers)
- Long-term significance
- How fans interpret and use the work
- Cover versions, remixes, or references by other artists
- Why this work endures
""")
    cultural += "\n\n---\n\n"
    
    # Founder's notes
    founders = "## Founder's Notes\n\n"
    founders += _get_placeholder(include_placeholders, """
This is YOUR section. Write subjectively and personally.

Why does this song matter to YOU specifically?
- What emotions does it evoke?
- What memories or experiences does it connect to?
- Why did you choose to preserve it?
- What do you hope future archivists or listeners will understand?

This is the heart of why this archive exists. Be honest, be personal, be human.

Example:
"Comet" was the first original song by Suisei that made me truly understand the weight of her journey. The metaphor of isolation in pursuit of dreams resonated deeply with me - anyone who has worked on something alone, unseen, understands this pain. When I archive this song, I'm preserving not just audio data, but the crystallization of that very real human experience of loneliness, hope, and perseverance. This is why digital creators matter. This is why their stories deserve preservation.
""")
    founders += "\n\n---\n\n"
    
    # Preservation notes
    preservation = "## Preservation Notes\n\n"
    preservation += "### Source Quality\n\n"
    preservation += _get_placeholder(include_placeholders, """
Document the archival source:
- Source platform (YouTube, official streaming, CD rip, etc.)
- Audio quality (bitrate, format, lossy/lossless)
- Video quality (if applicable)
- Any quality concerns or limitations
""")
    preservation += "\n\n"
    
    preservation += "### Completeness Status\n\n"
    preservation += "| Element | Status | Notes |\n"
    preservation += "|---------|--------|-------|\n"
    preservation += f"| Audio | {_check_status(metadata, 'files', 'audio')} | {metadata.get('files', {}).get('audio', '')} |\n"
    preservation += f"| Lyrics (Japanese) | {_check_lyrics_status(has_japanese)} | {_lyrics_note(lyrics_data, 'ja')} |\n"
    preservation += f"| Lyrics (English) | {_check_lyrics_status(has_english)} | {_lyrics_note(lyrics_data, 'en')} |\n"
    preservation += f"| Cover Art | {_check_status(metadata, 'files', 'cover_art')} | |\n"
    preservation += f"| Music Video | {_check_status(metadata, 'files', 'video')} | |\n"
    preservation += "\n"
    
    preservation += "### Translation & Interpretation Confidence\n\n"
    preservation += _get_placeholder(include_placeholders, """
Rate confidence levels (if applicable):
- Lyrical translation: [High/Medium/Low/Machine-translated]
- Cultural references: [Fully understood / Partially understood / Requires research]
- Thematic interpretation: [Confident / Interpretive / Speculative]

Note any uncertainties for future researchers.
""")
    preservation += "\n\n"
    
    preservation += "### Missing Data\n\n"
    preservation += _get_placeholder(include_placeholders, """
Document what's missing:
- [ ] Official lyrics
- [ ] Composer credits
- [ ] Production credits
- [ ] Official translation
- [ ] Music video
- [ ] Release context (blog posts, tweets, etc.)

Be transparent about gaps in the archive.
""")
    preservation += "\n\n---\n\n"
    
    # References
    references = "## References\n\n"
    references += _get_placeholder(include_placeholders, """
Cite your sources:
- Original upload/release URL
- Lyrics sources
- Interview references
- Fan analyses or discussions
- Official statements or blog posts

Preserve the research trail for future archivists.
""")
    references += "\n\n---\n\n"
    
    # Footer
    footer = f"**Analysis Status:** {metadata.get('preservation', {}).get('verification_status', 'Draft - Pending Review')}\n"
    footer += f"**Last Updated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n"
    footer += "**Schema Version:** 1.0.0\n\n"
    footer += "---\n\n"
    footer += "*This analysis is part of the Library of Babylon archival project. It represents a subjective interpretation meant to preserve context and meaning, not objective truth. Future researchers should read critically and contribute their own interpretations.*\n"
    
    # Combine all sections
    analysis_md = (
        header + title_section + basic_info + overview + themes + 
        lyrical + musical + cultural + founders + preservation + 
        references + footer
    )
    
    return analysis_md


def _get_placeholder(include: bool, text: str) -> str:
    """Return placeholder text if include=True, else return empty prompt."""
    if include:
        return text.strip()
    else:
        return "_[To be filled in]_"


def _check_status(metadata: Dict, *keys) -> str:
    """Check if a nested key exists and has a value."""
    value = metadata
    for key in keys:
        value = value.get(key, {})
    
    if isinstance(value, str) and value:
        return "Available"
    elif isinstance(value, dict):
        return "Missing"
    else:
        return "Missing"


def _check_lyrics_status(has_lyrics: bool) -> str:
    """Check lyrics availability."""
    return "Available" if has_lyrics else "Missing"


def _lyrics_note(lyrics_data: Optional[Dict], lang: str) -> str:
    """Get note about lyrics source."""
    if not lyrics_data:
        return ""
    source = lyrics_data.get("metadata", {}).get("source", "unknown")
    return f"Source: {source}"


def _generate_lyrics_section(has_japanese: bool, has_english: bool, lyrics_data: Dict) -> str:
    """Generate embedded lyrics section if lyrics are available."""
    if not (has_japanese or has_english):
        return ""
    
    section = "### Full Lyrics\n\n"
    
    if has_japanese:
        japanese = lyrics_data["language_versions"]["ja"]
        section += "<details>\n<summary><b>Japanese Original</b></summary>\n\n```\n"
        section += japanese
        section += "\n```\n</details>\n\n"
    
    if has_english:
        english = lyrics_data["language_versions"]["en"]
        section += "<details>\n<summary><b>English Translation</b></summary>\n\n```\n"
        section += english
        section += "\n```\n</details>\n\n"
    
    return section


def save_analysis(markdown_text: str, output_path: str) -> None:
    """
    Save analysis markdown to file.
    
    Args:
        markdown_text: The markdown content
        output_path: Path to save the file
    """
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(markdown_text)
    print(f"✓ Analysis saved: {output_path}")


# CLI Usage
if __name__ == "__main__":
    import sys
    import json
    
    if len(sys.argv) < 2:
        print("Usage: python analysis_generator.py <metadata.json> [lyrics.json]")
        print("\nExample:")
        print("  python analysis_generator.py comet_metadata.json")
        print("  python analysis_generator.py comet_metadata.json lyrics.json")
        sys.exit(1)
    
    metadata_path = sys.argv[1]
    lyrics_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Load metadata
    if not os.path.exists(metadata_path):
        print(f"Error: Metadata file not found: {metadata_path}")
        sys.exit(1)
    
    with open(metadata_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)
    
    # Load lyrics if provided
    lyrics_data = None
    if lyrics_path and os.path.exists(lyrics_path):
        with open(lyrics_path, 'r', encoding='utf-8') as f:
            lyrics_data = json.load(f)
        print(f"✓ Loaded lyrics from: {lyrics_path}")
    
    # Generate analysis
    print(f"Generating analysis for: {metadata.get('title', 'Unknown')}\n")
    analysis = generate_ai_analysis(metadata, lyrics_data, include_placeholders=True)
    
    # Save to file
    base_name = os.path.splitext(metadata_path)[0].replace('_metadata', '')
    output_path = f"{base_name}_analysis.md"
    
    save_analysis(analysis, output_path)
    
    print("\nNext steps:")
    print(f"  1. Open and review: {output_path}")
    print(f"  2. Fill in placeholder sections with actual analysis")
    print(f"  3. Add personal Founder's Notes")
    print(f"  4. Update preservation notes with source info")