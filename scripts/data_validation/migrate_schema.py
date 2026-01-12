# -*- coding: utf-8 -*-
"""
Schema Migration Tool for Library of Babylon
Handles metadata schema upgrades safely with backups and rollback.

Usage:
    python migrate_schema.py --list                    # List available migrations
    python migrate_schema.py --version 1.0.0 --to 1.1.0  # Migrate specific version
    python migrate_schema.py --auto                    # Auto-migrate all outdated
    python migrate_schema.py --dry-run                 # Preview changes without applying
    python migrate_schema.py --rollback backup.json    # Rollback from backup
"""

import os
import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Callable, Optional
import argparse

# Schema version tracking
CURRENT_SCHEMA_VERSION = "1.0.0"

class SchemaMigration:
    """Represents a single schema migration."""
    
    def __init__(self, 
                 from_version: str,
                 to_version: str,
                 description: str,
                 migrate_func: Callable[[Dict], Dict]):
        self.from_version = from_version
        self.to_version = to_version
        self.description = description
        self.migrate_func = migrate_func
    
    def apply(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Apply migration to metadata."""
        print(f"  Applying: {self.description}")
        return self.migrate_func(metadata)


# ============================================================================
# MIGRATION DEFINITIONS
# ============================================================================

def migrate_0_9_to_1_0(metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Migration from 0.9.x to 1.0.0
    - Add schema_version field
    - Add completeness tracking
    - Standardize file references
    """
    # Add schema version
    metadata['schema_version'] = "1.0.0"
    
    # Add completeness tracking if missing
    if 'preservation' not in metadata:
        metadata['preservation'] = {}
    
    if 'completeness' not in metadata['preservation']:
        metadata['preservation']['completeness'] = {
            'has_lyrics': False,
            'has_translation': False,
            'has_analysis': False,
            'has_cover_art': False,
            'has_video': False
        }
    
    # Ensure files section exists
    if 'files' not in metadata:
        metadata['files'] = {
            'audio': '',
            'video': '',
            'thumbnail': '',
            'lyrics': '',
            'cover_art': ''
        }
    
    # Update last_updated
    metadata['last_updated'] = datetime.now().isoformat()
    
    return metadata


def migrate_legacy_naming(metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fix legacy field names and structure.
    - Rename Release_date → release_date
    - Convert source string to dict
    - Fix archived_by field location
    """
    # Fix Release_date → release_date
    if 'Release_date' in metadata:
        metadata['release_date'] = metadata.pop('Release_date')
    
    # Fix archived_by field location
    if 'archived_by' in metadata:
        if 'preservation' not in metadata:
            metadata['preservation'] = {}
        if 'archivist_notes' not in metadata['preservation']:
            metadata['preservation']['archivist_notes'] = f"Archived by: {metadata['archived_by']}"
        metadata.pop('archived_by', None)
    
    # Convert source from string to dict
    if 'source' in metadata and isinstance(metadata['source'], str):
        source_url = metadata['source']
        metadata['source'] = {
            'platform': detect_platform(source_url),
            'url': source_url,
            'upload_date': '',
            'availability': 'available'
        }
    
    return metadata


def detect_platform(url: str) -> str:
    """Detect platform from URL."""
    if not url:
        return ""
    
    url_lower = url.lower()
    if 'youtu.be' in url_lower or 'youtube.com' in url_lower:
        return "YouTube"
    elif 'spotify.com' in url_lower:
        return "Spotify"
    elif 'soundcloud.com' in url_lower:
        return "SoundCloud"
    elif 'niconico' in url_lower or 'nicovideo' in url_lower:
        return "Niconico"
    else:
        return "Other"


def add_missing_fields(metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Add any missing fields with default values.
    Ensures all metadata has complete structure.
    """
    # Default template
    template = {
        "schema_version": "1.0.0",
        "title": "",
        "title_native": "",
        "title_romanized": "",
        "type": "song",
        "release_date": "",
        "archived_date": "",
        "last_updated": datetime.now().isoformat(),
        "files": {
            "audio": "",
            "video": "",
            "thumbnail": "",
            "lyrics": "",
            "cover_art": ""
        },
        "technical": {
            "duration_seconds": 0,
            "duration_human": "",
            "file_size_bytes": 0,
            "file_size_human": "",
            "format": "",
            "sha256": "",
            "bitrate": None,
            "sample_rate": None,
            "channels": None
        },
        "credits": {
            "artist": "",
            "composer": "",
            "lyricist": "",
            "arranger": "",
            "producer": "",
            "mixing": "",
            "mastering": "",
            "illustration": "",
            "video_direction": ""
        },
        "classification": {
            "category": "singles",
            "genre": [],
            "themes": [],
            "emotional_tags": [],
            "language": "ja",
            "explicit": False
        },
        "source": {
            "platform": "",
            "url": "",
            "upload_date": "",
            "availability": "available"
        },
        "preservation": {
            "why_archived": "",
            "cultural_significance": "",
            "historical_context": "",
            "archivist_notes": "",
            "verification_status": "unverified",
            "completeness": {
                "has_lyrics": False,
                "has_translation": False,
                "has_analysis": False,
                "has_cover_art": False,
                "has_video": False
            }
        },
        "related_works": {
            "album": "",
            "era": "",
            "part_of_series": [],
            "inspired_by": [],
            "references": []
        }
    }
    
    # Deep merge - add missing fields but preserve existing values
    def deep_merge(template: Dict, data: Dict) -> Dict:
        result = template.copy()
        for key, value in data.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = deep_merge(result[key], value)
            else:
                result[key] = value
        return result
    
    return deep_merge(template, metadata)


# ============================================================================
# MIGRATION REGISTRY
# ============================================================================

MIGRATIONS = [
    SchemaMigration(
        from_version="0.9.0",
        to_version="1.0.0",
        description="Add schema_version and completeness tracking",
        migrate_func=migrate_0_9_to_1_0
    ),
    SchemaMigration(
        from_version="legacy",
        to_version="1.0.0",
        description="Fix legacy field naming and convert source string to dict",
        migrate_func=migrate_legacy_naming
    ),
    SchemaMigration(
        from_version="any",
        to_version="1.0.0",
        description="Add missing fields with defaults",
        migrate_func=add_missing_fields
    ),
]


# ============================================================================
# MIGRATION ENGINE
# ============================================================================

class MigrationEngine:
    """Handles schema migration operations."""
    
    def __init__(self, archive_root: Path, dry_run: bool = False):
        self.archive_root = archive_root
        self.dry_run = dry_run
        self.backup_dir = archive_root / "raw_backups" / "schema_migrations"
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
        self.migrated_count = 0
        self.skipped_count = 0
        self.error_count = 0
    
    def get_metadata_files(self) -> List[Path]:
        """Find all metadata.json files in archive."""
        creators_path = self.archive_root / "creators"
        metadata_files = []
        
        for metadata_file in creators_path.rglob("metadata.json"):
            metadata_files.append(metadata_file)
        
        # Also check for legacy naming
        for metadata_file in creators_path.rglob("*_metadata.json"):
            metadata_files.append(metadata_file)
        
        return metadata_files
    
    def detect_version(self, metadata: Dict[str, Any]) -> str:
        """Detect schema version of metadata."""
        # Check for explicit version field
        if 'schema_version' in metadata:
            return metadata['schema_version']
        
        # Detect legacy schemas
        if 'Release_date' in metadata or 'archived_by' in metadata:
            return "legacy"
        
        # Default to 0.9.0 if no version and not legacy
        return "0.9.0"
    
    def backup_metadata(self, metadata_path: Path) -> Path:
        """Create backup of metadata file."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"{metadata_path.stem}_{timestamp}.json"
        backup_path = self.backup_dir / backup_name
        
        shutil.copy2(metadata_path, backup_path)
        return backup_path
    
    def migrate_file(self, metadata_path: Path, 
                     target_version: str = CURRENT_SCHEMA_VERSION) -> bool:
        """
        Migrate a single metadata file.
        
        Returns:
            True if migrated, False if skipped
        """
        try:
            # Load metadata
            with open(metadata_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            # Detect current version
            current_version = self.detect_version(metadata)
            
            # Check if migration needed
            if current_version == target_version:
                self.skipped_count += 1
                return False
            
            print(f"\n📝 {metadata_path.relative_to(self.archive_root)}")
            print(f"   Current version: {current_version}")
            print(f"   Target version: {target_version}")
            
            # Create backup
            if not self.dry_run:
                backup_path = self.backup_metadata(metadata_path)
                print(f"   Backup: {backup_path.name}")
            
            # Apply applicable migrations
            migrated_metadata = metadata.copy()
            for migration in MIGRATIONS:
                # Apply if:
                # 1. from_version matches current version, OR
                # 2. from_version is "any" (universal migration), OR
                # 3. from_version is "legacy" and current is legacy
                if (migration.from_version == current_version or
                    migration.from_version == "any" or
                    (migration.from_version == "legacy" and current_version == "legacy")):
                    
                    migrated_metadata = migration.apply(migrated_metadata)
            
            # Update schema version
            migrated_metadata['schema_version'] = target_version
            migrated_metadata['last_updated'] = datetime.now().isoformat()
            
            # Save (if not dry-run)
            if not self.dry_run:
                with open(metadata_path, 'w', encoding='utf-8') as f:
                    json.dump(migrated_metadata, f, ensure_ascii=False, indent=2)
                print(f"   ✅ Migrated successfully")
            else:
                print(f"   [DRY RUN] Would migrate")
            
            self.migrated_count += 1
            return True
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            self.error_count += 1
            return False
    
    def migrate_all(self, target_version: str = CURRENT_SCHEMA_VERSION):
        """Migrate all metadata files in archive."""
        print("=" * 70)
        print("Library of Babylon - Schema Migration")
        print("=" * 70)
        print(f"Archive: {self.archive_root}")
        print(f"Target version: {target_version}")
        print(f"Mode: {'DRY RUN' if self.dry_run else 'LIVE'}")
        print()
        
        # Find all metadata files
        metadata_files = self.get_metadata_files()
        print(f"Found {len(metadata_files)} metadata file(s)\n")
        
        # Migrate each file
        for metadata_file in metadata_files:
            self.migrate_file(metadata_file, target_version)
        
        # Summary
        print("\n" + "=" * 70)
        print("MIGRATION SUMMARY")
        print("=" * 70)
        print(f"Total files: {len(metadata_files)}")
        print(f"Migrated: {self.migrated_count}")
        print(f"Skipped (already current): {self.skipped_count}")
        print(f"Errors: {self.error_count}")
        
        if self.dry_run:
            print("\nℹ️  This was a DRY RUN. No changes were made.")
            print("   Remove --dry-run to apply migrations.")
        else:
            print(f"\nℹ️  Backups saved to: {self.backup_dir}")
        
        print("=" * 70)


def list_migrations():
    """List all available migrations."""
    print("=" * 70)
    print("Available Migrations")
    print("=" * 70)
    print()
    
    for i, migration in enumerate(MIGRATIONS, 1):
        print(f"{i}. {migration.from_version} → {migration.to_version}")
        print(f"   {migration.description}")
        print()


def rollback(backup_file: Path, metadata_path: Path):
    """Rollback metadata from backup."""
    if not backup_file.exists():
        print(f"❌ Backup file not found: {backup_file}")
        return
    
    print(f"🔄 Rolling back: {metadata_path}")
    print(f"   From backup: {backup_file}")
    
    response = input("Confirm rollback? (y/n): ")
    if response.lower() != 'y':
        print("Cancelled.")
        return
    
    shutil.copy2(backup_file, metadata_path)
    print("✅ Rollback complete")


def main():
    parser = argparse.ArgumentParser(
        description="Schema migration tool for Library of Babylon"
    )
    
    parser.add_argument(
        "--list",
        action="store_true",
        help="List available migrations"
    )
    parser.add_argument(
        "--auto",
        action="store_true",
        help="Auto-migrate all outdated metadata"
    )
    parser.add_argument(
        "--version",
        type=str,
        help="Source schema version"
    )
    parser.add_argument(
        "--to",
        type=str,
        default=CURRENT_SCHEMA_VERSION,
        help="Target schema version"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without applying"
    )
    parser.add_argument(
        "--rollback",
        type=str,
        help="Rollback from backup file"
    )
    parser.add_argument(
        "--archive-path",
        type=str,
        help="Custom archive path"
    )
    
    args = parser.parse_args()
    
    # List migrations
    if args.list:
        list_migrations()
        return
    
    # Determine archive path
    if args.archive_path:
        archive_root = Path(args.archive_path)
    else:
        script_dir = Path(__file__).parent
        archive_root = script_dir.parent / "archive"
    
    if not archive_root.exists():
        print(f"❌ Archive not found: {archive_root}")
        return
    
    # Rollback
    if args.rollback:
        backup_file = Path(args.rollback)
        # Assume metadata.json in same directory
        metadata_path = backup_file.parent.parent.parent / "metadata.json"
        rollback(backup_file, metadata_path)
        return
    
    # Auto-migrate
    if args.auto:
        engine = MigrationEngine(archive_root, dry_run=args.dry_run)
        engine.migrate_all(target_version=args.to)
    else:
        print("Use --auto to migrate all files or --list to see migrations")


if __name__ == "__main__":
    main()