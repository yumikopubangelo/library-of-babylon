# -*- coding: utf-8 -*-
"""
Archive Validation Script for Library of Babylon
Validates metadata integrity, file existence, and archive structure.

Usage:
    python validate_archive.py                    # Validate entire archive
    python validate_archive.py --creator Hoshimachi_Suisei  # Validate one creator
    python validate_archive.py --fix              # Auto-fix minor issues
    python validate_archive.py --report validation_report.json  # Save report
"""

import os
import json
import sys
import hashlib
from pathlib import Path
from typing import Dict, List, Tuple, Any
from datetime import datetime
import argparse

# Schema version we expect
CURRENT_SCHEMA_VERSION = "1.0.0"

# Required fields by priority
CRITICAL_FIELDS = ["title", "files"]
IMPORTANT_FIELDS = ["release_date", "credits", "source", "archived_date"]
OPTIONAL_FIELDS = ["classification", "preservation", "related_works"]

class ArchiveValidator:
    def __init__(self, archive_root: Path, auto_fix: bool = False):
        self.archive_root = archive_root
        self.auto_fix = auto_fix
        self.errors = []
        self.warnings = []
        self.info = []
        self.fixed = []
        
    def validate_all(self) -> Dict[str, Any]:
        """Validate entire archive and return report."""
        print("=" * 70)
        print("Library of Babylon - Archive Validation")
        print("=" * 70)
        print(f"Archive Root: {self.archive_root}")
        print(f"Auto-fix: {'Enabled' if self.auto_fix else 'Disabled'}")
        print()
        
        creators_path = self.archive_root / "creators"
        
        if not creators_path.exists():
            self.errors.append({
                "type": "structure",
                "severity": "critical",
                "message": "Creators folder not found",
                "path": str(creators_path)
            })
            return self._generate_report()
        
        # Get all creator folders
        creators = [
            d for d in creators_path.iterdir()
            if d.is_dir() and not d.name.startswith("_") 
            and d.name not in ["collections", "raw_backups"]
        ]
        
        print(f"Found {len(creators)} creator(s) to validate\n")
        
        for creator_path in creators:
            self._validate_creator(creator_path)
        
        return self._generate_report()
    
    def _validate_creator(self, creator_path: Path):
        """Validate a single creator's archive."""
        creator_name = creator_path.name
        print(f"📁 Validating: {creator_name}")
        print("-" * 70)
        
        # Check structure
        singles_path = creator_path / "Music" / "Singles"
        if not singles_path.exists():
            self.warnings.append({
                "type": "structure",
                "severity": "warning",
                "message": "Singles folder not found",
                "creator": creator_name,
                "path": str(singles_path)
            })
            print("  ⚠️  Singles folder missing")
            return
        
        # Get all song folders
        song_folders = [
            d for d in singles_path.iterdir()
            if d.is_dir()
        ]
        
        print(f"  Found {len(song_folders)} work(s)\n")
        
        for song_folder in song_folders:
            self._validate_work(creator_name, song_folder)
        
        print()
    
    def _validate_work(self, creator_name: str, work_path: Path):
        """Validate a single work (song/video)."""
        work_name = work_path.name
        metadata_path = work_path / "metadata.json"
        
        # Check metadata exists
        if not metadata_path.exists():
            # Check for old naming convention
            old_metadata = work_path / f"{work_name}_metadata.json"
            if old_metadata.exists():
                self.warnings.append({
                    "type": "naming",
                    "severity": "warning",
                    "message": "Old metadata naming convention detected",
                    "creator": creator_name,
                    "work": work_name,
                    "path": str(old_metadata),
                    "suggestion": "Rename to metadata.json"
                })
                print(f"    ⚠️  {work_name}: Old naming convention")
                
                if self.auto_fix:
                    old_metadata.rename(metadata_path)
                    self.fixed.append({
                        "type": "naming",
                        "action": "Renamed metadata file",
                        "path": str(old_metadata),
                        "new_path": str(metadata_path)
                    })
                    print(f"       ✅ Fixed: Renamed to metadata.json")
                
                metadata_path = old_metadata if not self.auto_fix else metadata_path
            else:
                self.errors.append({
                    "type": "missing_file",
                    "severity": "error",
                    "message": "Metadata file not found",
                    "creator": creator_name,
                    "work": work_name,
                    "path": str(metadata_path)
                })
                print(f"    ❌ {work_name}: Metadata missing")
                return
        
        # Validate metadata content
        try:
            with open(metadata_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            self._validate_metadata_structure(creator_name, work_name, metadata, work_path)
            self._validate_files_exist(creator_name, work_name, metadata, work_path)
            
            print(f"    ✅ {work_name}")
            
        except json.JSONDecodeError as e:
            self.errors.append({
                "type": "corrupt_metadata",
                "severity": "critical",
                "message": f"Invalid JSON: {str(e)}",
                "creator": creator_name,
                "work": work_name,
                "path": str(metadata_path)
            })
            print(f"    ❌ {work_name}: Corrupt metadata JSON")
        except Exception as e:
            self.errors.append({
                "type": "validation_error",
                "severity": "critical",
                "message": str(e),
                "creator": creator_name,
                "work": work_name,
                "path": str(metadata_path)
            })
            print(f"    ❌ {work_name}: Validation error - {str(e)}")
    
    def _validate_metadata_structure(self, creator: str, work: str, 
                                     metadata: Dict, work_path: Path):
        """Validate metadata has required fields."""
        
        # Check schema version
        schema_version = metadata.get("schema_version", "unknown")
        if schema_version == "unknown":
            self.info.append({
                "type": "schema",
                "severity": "info",
                "message": "No schema version (legacy format)",
                "creator": creator,
                "work": work,
                "suggestion": "Run migrate_schema.py"
            })
        elif schema_version != CURRENT_SCHEMA_VERSION:
            self.warnings.append({
                "type": "schema",
                "severity": "warning",
                "message": f"Schema version mismatch: {schema_version} != {CURRENT_SCHEMA_VERSION}",
                "creator": creator,
                "work": work,
                "suggestion": "Run migrate_schema.py"
            })
        
        # Check critical fields
        for field in CRITICAL_FIELDS:
            if field not in metadata or not metadata[field]:
                self.errors.append({
                    "type": "missing_field",
                    "severity": "critical",
                    "message": f"Missing critical field: {field}",
                    "creator": creator,
                    "work": work,
                    "field": field
                })
        
        # Check important fields
        for field in IMPORTANT_FIELDS:
            if field not in metadata or not metadata[field]:
                self.warnings.append({
                    "type": "missing_field",
                    "severity": "warning",
                    "message": f"Missing important field: {field}",
                    "creator": creator,
                    "work": work,
                    "field": field
                })
        
        # Validate files section
        if "files" in metadata:
            # Handle both dict and non-dict files sections
            if isinstance(metadata["files"], dict):
                if "audio" not in metadata["files"] or not metadata["files"]["audio"]:
                    self.errors.append({
                        "type": "missing_field",
                        "severity": "critical",
                        "message": "No audio file specified in metadata",
                        "creator": creator,
                        "work": work
                    })
            else:
                self.warnings.append({
                    "type": "structure",
                    "severity": "warning",
                    "message": "Files section is not a dict (legacy format)",
                    "creator": creator,
                    "work": work,
                    "suggestion": "Run migrate_schema.py"
                })
        
        # Validate source URL - HANDLE BOTH FORMATS
        if "source" in metadata:
            source = metadata["source"]
            
            # Legacy format: source is a string
            if isinstance(source, str):
                if not source:
                    self.warnings.append({
                        "type": "missing_field",
                        "severity": "warning",
                        "message": "Source URL empty (legacy format)",
                        "creator": creator,
                        "work": work,
                        "suggestion": "Run migrate_schema.py to convert to new format"
                    })
                else:
                    self.info.append({
                        "type": "legacy_format",
                        "severity": "info",
                        "message": "Source is string (legacy format)",
                        "creator": creator,
                        "work": work,
                        "suggestion": "Run migrate_schema.py"
                    })
            
            # New format: source is a dict
            elif isinstance(source, dict):
                if not source.get("url"):
                    self.warnings.append({
                        "type": "missing_field",
                        "severity": "warning",
                        "message": "Source URL missing (important for provenance)",
                        "creator": creator,
                        "work": work
                    })
            else:
                self.warnings.append({
                    "type": "invalid_type",
                    "severity": "warning",
                    "message": f"Source field has unexpected type: {type(source)}",
                    "creator": creator,
                    "work": work
                })
    
    def _validate_files_exist(self, creator: str, work: str, 
                             metadata: Dict, work_path: Path):
        """Validate that referenced files actually exist."""
        
        files_section = metadata.get("files", {})
        
        # Handle legacy format where files might not be a dict
        if not isinstance(files_section, dict):
            return
        
        # Check audio file
        audio_file = files_section.get("audio")
        if audio_file:
            audio_path = work_path / audio_file
            if not audio_path.exists():
                self.errors.append({
                    "type": "missing_file",
                    "severity": "critical",
                    "message": "Audio file referenced but not found",
                    "creator": creator,
                    "work": work,
                    "file": audio_file,
                    "expected_path": str(audio_path)
                })
        
        # Check other files (non-critical)
        for file_type in ["video", "thumbnail", "lyrics", "cover_art"]:
            file_name = files_section.get(file_type)
            if file_name:
                file_path = work_path / file_name
                if not file_path.exists():
                    self.info.append({
                        "type": "missing_file",
                        "severity": "info",
                        "message": f"{file_type.title()} file referenced but not found",
                        "creator": creator,
                        "work": work,
                        "file": file_name,
                        "expected_path": str(file_path)
                    })
        
        # Check for orphaned files (files in folder not in metadata)
        for file in work_path.iterdir():
            if file.is_file() and file.suffix.lower() in ['.flac', '.mp3', '.m4a', '.wav']:
                if file.name != audio_file:
                    self.info.append({
                        "type": "orphaned_file",
                        "severity": "info",
                        "message": "Audio file exists but not referenced in metadata",
                        "creator": creator,
                        "work": work,
                        "file": file.name
                    })
    
    def _generate_report(self) -> Dict[str, Any]:
        """Generate validation report."""
        print("\n")
        print("=" * 70)
        print("VALIDATION REPORT")
        print("=" * 70)
        
        # Summary
        total_issues = len(self.errors) + len(self.warnings)
        print(f"\n📊 Summary:")
        print(f"   Critical Errors: {len(self.errors)}")
        print(f"   Warnings: {len(self.warnings)}")
        print(f"   Info: {len(self.info)}")
        if self.auto_fix:
            print(f"   Fixed: {len(self.fixed)}")
        
        # Critical errors
        if self.errors:
            print(f"\n❌ Critical Errors ({len(self.errors)}):")
            for err in self.errors[:10]:  # Show first 10
                print(f"   • {err['message']}")
                print(f"     Creator: {err.get('creator', 'N/A')}")
                print(f"     Work: {err.get('work', 'N/A')}")
            if len(self.errors) > 10:
                print(f"   ... and {len(self.errors) - 10} more")
        
        # Warnings
        if self.warnings:
            print(f"\n⚠️  Warnings ({len(self.warnings)}):")
            for warn in self.warnings[:5]:  # Show first 5
                print(f"   • {warn['message']}")
                print(f"     Creator: {warn.get('creator', 'N/A')}")
                print(f"     Work: {warn.get('work', 'N/A')}")
            if len(self.warnings) > 5:
                print(f"   ... and {len(self.warnings) - 5} more")
        
        # Info messages (migration suggestions)
        if self.info:
            print(f"\nℹ️  Info ({len(self.info)}):")
            legacy_count = sum(1 for i in self.info if i.get('type') == 'legacy_format')
            if legacy_count > 0:
                print(f"   • {legacy_count} work(s) using legacy format")
                print(f"     Suggestion: Run 'python migrate_schema.py --auto' to update")
        
        # Status
        print("\n" + "=" * 70)
        if len(self.errors) == 0:
            print("✅ VALIDATION PASSED")
            if len(self.warnings) > 0:
                print(f"⚠️  {len(self.warnings)} warning(s) found - consider fixing")
            if len(self.info) > 0:
                print(f"ℹ️  {len(self.info)} legacy format(s) detected - migration recommended")
            else:
                print("Archive integrity is excellent!")
        else:
            print("❌ VALIDATION FAILED")
            print(f"Please fix {len(self.errors)} critical error(s)")
        print("=" * 70)
        
        # Generate structured report
        report = {
            "timestamp": datetime.now().isoformat(),
            "archive_root": str(self.archive_root),
            "schema_version": CURRENT_SCHEMA_VERSION,
            "summary": {
                "total_issues": total_issues,
                "critical_errors": len(self.errors),
                "warnings": len(self.warnings),
                "info": len(self.info),
                "fixed": len(self.fixed) if self.auto_fix else 0
            },
            "errors": self.errors,
            "warnings": self.warnings,
            "info": self.info,
            "fixed": self.fixed if self.auto_fix else [],
            "status": "PASSED" if len(self.errors) == 0 else "FAILED"
        }
        
        return report


def main():
    parser = argparse.ArgumentParser(
        description="Validate Library of Babylon archive integrity"
    )
    parser.add_argument(
        "--creator",
        type=str,
        help="Validate specific creator only"
    )
    parser.add_argument(
        "--fix",
        action="store_true",
        help="Auto-fix minor issues (e.g., rename files)"
    )
    parser.add_argument(
        "--report",
        type=str,
        help="Save detailed report to JSON file"
    )
    parser.add_argument(
        "--archive-path",
        type=str,
        help="Custom archive path (default: ../../archive from script location)"
    )
    
    args = parser.parse_args()
    
    # Determine archive root
    if args.archive_path:
        archive_root = Path(args.archive_path)
    else:
        script_dir = Path(__file__).parent
        archive_root = script_dir.parent / "archive"
    
    if not archive_root.exists():
        print(f"❌ Error: Archive not found at {archive_root}")
        print("Use --archive-path to specify custom location")
        sys.exit(1)
    
    # Run validation
    validator = ArchiveValidator(archive_root, auto_fix=args.fix)
    
    if args.creator:
        # Validate single creator
        creator_path = archive_root / "creators" / args.creator
        if not creator_path.exists():
            print(f"❌ Error: Creator not found: {args.creator}")
            sys.exit(1)
        validator._validate_creator(creator_path)
        report = validator._generate_report()
    else:
        # Validate all
        report = validator.validate_all()
    
    # Save report if requested
    if args.report:
        report_path = Path(args.report)
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        print(f"\n📄 Detailed report saved: {report_path}")
    
    # Exit code based on validation status
    sys.exit(0 if report["status"] == "PASSED" else 1)


if __name__ == "__main__":
    main()