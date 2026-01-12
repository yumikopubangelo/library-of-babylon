# -*- coding: utf-8 -*-
"""
Lyrics Processor for Library of Babylon
Handles lyrics extraction, translation metadata, and annotations.
"""

import os
import json
from typing import Optional, Dict, Any
from datetime import datetime

def extract_lyrics(
    japanese: str = "",
    romaji: str = "",
    english: str = "",
    source: str = "manual",
    translator: str = "",
    notes: str = "",
    confidence: str = "high"
) -> Dict[str, Any]:
    """
    Create structured lyrics object with metadata.
    
    Args:
        japanese: Original Japanese lyrics
        romaji: Romanized lyrics
        english: English translation
        source: Source of lyrics (manual, official, community, ai)
        translator: Name/credit of translator
        notes: Any notes about the lyrics or translation
        confidence: Translation confidence (high, medium, low, machine)
    
    Returns:
        Structured lyrics dictionary
    """
    
    lyrics = {
        "schema_version": "1.0.0",
        "language_versions": {
            "ja": japanese.strip(),
            "ja_romaji": romaji.strip(),
            "en": english.strip()
        },
        "metadata": {
            "source": source,  # manual, official, community, genius, utanet, ai
            "translator": translator,
            "translation_date": datetime.now().strftime("%Y-%m-%d"),
            "confidence": confidence,  # high, medium, low, machine
            "notes": notes,
            "verified": False  # Manual verification flag
        },
        "timing": {
            "has_timestamps": False,
            "format": "",  # LRC, SRT, etc.
            "timestamps": []
        },
        "structure": {
            # Optional: Document song structure
            "sections": [],  # e.g., ["verse1", "chorus", "verse2", "bridge", "chorus"]
            "repeated_sections": {}  # Track which sections repeat
        },
        "annotations": {
            # For cultural references, wordplay, etc.
            "cultural_references": [],
            "wordplay": [],
            "difficult_translations": []
        }
    }
    
    return lyrics


def add_timestamps(
    lyrics_data: Dict[str, Any],
    timestamps: list,
    format: str = "LRC"
) -> Dict[str, Any]:
    """
    Add timing information to lyrics.
    
    Args:
        lyrics_data: Existing lyrics dictionary
        timestamps: List of timestamp objects
        format: Timestamp format (LRC, SRT, etc.)
    
    Returns:
        Updated lyrics dictionary
    """
    lyrics_data["timing"]["has_timestamps"] = True
    lyrics_data["timing"]["format"] = format
    lyrics_data["timing"]["timestamps"] = timestamps
    return lyrics_data


def add_annotation(
    lyrics_data: Dict[str, Any],
    annotation_type: str,
    line_number: int,
    text: str,
    explanation: str
) -> Dict[str, Any]:
    """
    Add cultural or linguistic annotation to specific lyrics.
    
    Args:
        lyrics_data: Existing lyrics dictionary
        annotation_type: Type of annotation (cultural_references, wordplay, difficult_translations)
        line_number: Line number being annotated
        text: The text being annotated
        explanation: Explanation of the reference/wordplay
    
    Returns:
        Updated lyrics dictionary
    """
    annotation = {
        "line_number": line_number,
        "text": text,
        "explanation": explanation
    }
    
    if annotation_type in lyrics_data["annotations"]:
        lyrics_data["annotations"][annotation_type].append(annotation)
    
    return lyrics_data


def split_by_structure(
    lyrics_text: str,
    structure_markers: Optional[Dict[str, str]] = None
) -> Dict[str, str]:
    """
    Split lyrics into structural sections (verse, chorus, bridge, etc.)
    
    Args:
        lyrics_text: Full lyrics text
        structure_markers: Dict mapping markers to section types
                          e.g., {"[Verse 1]": "verse1", "[Chorus]": "chorus"}
    
    Returns:
        Dictionary of section_name: section_text
    """
    if not structure_markers:
        # Default markers
        structure_markers = {
            "[Verse 1]": "verse1",
            "[Verse 2]": "verse2",
            "[Verse 3]": "verse3",
            "[Chorus]": "chorus",
            "[Pre-Chorus]": "pre_chorus",
            "[Bridge]": "bridge",
            "[Outro]": "outro",
            "[Intro]": "intro"
        }
    
    sections = {}
    current_section = "unlabeled"
    current_text = []
    
    for line in lyrics_text.split('\n'):
        # Check if line is a structure marker
        found_marker = False
        for marker, section_name in structure_markers.items():
            if marker.lower() in line.lower():
                # Save previous section
                if current_text:
                    sections[current_section] = '\n'.join(current_text).strip()
                # Start new section
                current_section = section_name
                current_text = []
                found_marker = True
                break
        
        if not found_marker:
            current_text.append(line)
    
    # Save final section
    if current_text:
        sections[current_section] = '\n'.join(current_text).strip()
    
    return sections


def validate_lyrics(lyrics_data: Dict[str, Any]) -> tuple[bool, list[str]]:
    """
    Validate lyrics data completeness.
    
    Returns:
        (is_valid, list_of_warnings)
    """
    warnings = []
    
    # Check if we have at least original language
    if not lyrics_data["language_versions"]["ja"].strip():
        warnings.append("Missing original Japanese lyrics")
    
    # Check if translation exists when marked as translated
    if lyrics_data["language_versions"]["en"].strip():
        if not lyrics_data["metadata"]["translator"]:
            warnings.append("Translation provided but translator not credited")
        if lyrics_data["metadata"]["confidence"] == "machine":
            warnings.append("Machine translation - requires human review")
    
    # Warn if no source documented
    if not lyrics_data["metadata"]["source"] or lyrics_data["metadata"]["source"] == "unknown":
        warnings.append("Lyrics source not documented")
    
    is_valid = len(warnings) == 0
    return is_valid, warnings


def save_lyrics(lyrics_data: Dict[str, Any], output_path: str) -> None:
    """
    Save lyrics to JSON file with proper formatting.
    
    Args:
        lyrics_data: Lyrics dictionary
        output_path: Path to save JSON file
    """
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(lyrics_data, f, ensure_ascii=False, indent=2)
    print(f"✓ Lyrics saved: {output_path}")


def load_lyrics(input_path: str) -> Dict[str, Any]:
    """
    Load lyrics from JSON file.
    
    Args:
        input_path: Path to lyrics JSON file
    
    Returns:
        Lyrics dictionary
    """
    with open(input_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def translate_lyrics_ai(
    text: str,
    source_lang: str = "ja",
    target_lang: str = "en",
    model: str = "gpt-4"
) -> str:
    """
    AI-assisted translation using Claude or GPT.
    
    THIS IS A PLACEHOLDER FOR FUTURE IMPLEMENTATION.
    
    When implemented, this should:
    1. Use Claude API or similar for context-aware translation
    2. Preserve poetic structure where possible
    3. Note cultural references that need explanation
    4. Mark confidence level for each section
    
    Args:
        text: Text to translate
        source_lang: Source language code
        target_lang: Target language code
        model: AI model to use
    
    Returns:
        Translated text
    """
    raise NotImplementedError(
        "AI translation not implemented yet.\n"
        "Planned features:\n"
        "  - Claude API integration for context-aware translation\n"
        "  - Preservation of poetic structure\n"
        "  - Cultural reference flagging\n"
        "  - Confidence scoring per line\n"
        "\n"
        "For now, use manual translation or external tools."
    )


def romanize_japanese(text: str, method: str = "hepburn") -> str:
    """
    Romanize Japanese text.
    
    THIS IS A PLACEHOLDER FOR FUTURE IMPLEMENTATION.
    
    When implemented, this should use libraries like:
    - pykakasi
    - romkan
    - cutlet
    
    Args:
        text: Japanese text to romanize
        method: Romanization method (hepburn, kunrei, nihon)
    
    Returns:
        Romanized text
    """
    raise NotImplementedError(
        "Automatic romanization not implemented yet.\n"
        "Planned: Use pykakasi or similar library.\n"
        "For now, add romaji manually."
    )


def format_lyrics_for_display(
    lyrics_data: Dict[str, Any],
    languages: list[str] = ["ja", "en"],
    side_by_side: bool = True
) -> str:
    """
    Format lyrics for readable display.
    
    Args:
        lyrics_data: Lyrics dictionary
        languages: Which language versions to include
        side_by_side: If True, display languages side by side
    
    Returns:
        Formatted lyrics string
    """
    versions = lyrics_data["language_versions"]
    
    if side_by_side and len(languages) == 2:
        # Split into lines
        lines1 = versions.get(languages[0], "").split('\n')
        lines2 = versions.get(languages[1], "").split('\n')
        
        # Pad shorter version
        max_len = max(len(lines1), len(lines2))
        lines1 += [''] * (max_len - len(lines1))
        lines2 += [''] * (max_len - len(lines2))
        
        # Format side by side
        formatted = []
        for l1, l2 in zip(lines1, lines2):
            formatted.append(f"{l1:<50} | {l2}")
        
        return '\n'.join(formatted)
    else:
        # Sequential display
        formatted = []
        for lang in languages:
            if lang in versions and versions[lang]:
                lang_name = {
                    "ja": "Japanese (Original)",
                    "ja_romaji": "Romaji",
                    "en": "English"
                }.get(lang, lang)
                formatted.append(f"\n=== {lang_name} ===\n")
                formatted.append(versions[lang])
        
        return '\n'.join(formatted)


# CLI usage
if __name__ == "__main__":
    import sys
    
    print("=" * 60)
    print("Lyrics Processor - Library of Babylon")
    print("=" * 60)
    print()
    
    # Interactive mode
    print("Enter Japanese lyrics (end with Ctrl+D on Unix or Ctrl+Z on Windows):")
    print()
    
    try:
        japanese_lines = []
        while True:
            line = input()
            japanese_lines.append(line)
    except EOFError:
        pass
    
    japanese = '\n'.join(japanese_lines)
    
    if not japanese.strip():
        print("\nNo lyrics entered. Exiting.")
        sys.exit(0)
    
    print("\n" + "=" * 60)
    print("Lyrics captured!")
    print("=" * 60)
    
    # Ask for additional metadata
    print("\nOptional metadata (press Enter to skip):")
    source = input("Source (manual/official/community/genius/utanet): ").strip() or "manual"
    translator = input("Translator name (if applicable): ").strip()
    confidence = input("Translation confidence (high/medium/low/machine): ").strip() or "high"
    notes = input("Any notes about these lyrics: ").strip()
    
    # Create lyrics object
    lyrics = extract_lyrics(
        japanese=japanese,
        source=source,
        translator=translator,
        confidence=confidence,
        notes=notes
    )
    
    # Validate
    is_valid, warnings = validate_lyrics(lyrics)
    
    if warnings:
        print("\n⚠️  Warnings:")
        for warning in warnings:
            print(f"  - {warning}")
    
    # Save
    output_file = "lyrics.json"
    save_lyrics(lyrics, output_file)
    
    print(f"\n✅ Lyrics saved to: {output_file}")
    print("\nNext steps:")
    print("  1. Add English translation to the JSON file")
    print("  2. Add romaji if needed")
    print("  3. Consider adding annotations for cultural references")
    print("  4. Use this file with analysis_generator.py")