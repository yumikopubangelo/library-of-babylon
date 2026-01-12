import os
import sys
from meta_data_generator import generate_metadata, save_metadata_json

def process_folder(folder_path, file_extensions=['.flac', '.mp3', '.m4a', '.webm']):
    """
    Process all audio/video files in folder.
    Generate metadata JSON for each.
    """
    
    if not os.path.exists(folder_path):
        print(f"Error: Folder not found: {folder_path}")
        return
    
    processed = 0
    skipped = 0
    
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            
            if ext not in file_extensions:
                continue
            
            file_path = os.path.join(root, file)
            json_path = os.path.splitext(file_path)[0] + "_metadata.json"
            
            # Skip if JSON already exists
            if os.path.exists(json_path):
                print(f"⊘ Skipped (already exists): {file}")
                skipped += 1
                continue
            
            try:
                metadata = generate_metadata(file_path)
                save_metadata_json(metadata, json_path)
                print(f"✓ Processed: {file}")
                processed += 1
            except Exception as e:
                print(f"✗ Failed: {file} - {str(e)}")
    
    print(f"\n=== Summary ===")
    print(f"Processed: {processed}")
    print(f"Skipped: {skipped}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python batch_processor.py <folder_path>")
        sys.exit(1)
    
    folder_path = sys.argv[1]
    process_folder(folder_path)