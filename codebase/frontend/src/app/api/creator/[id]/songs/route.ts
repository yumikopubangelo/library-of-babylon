import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

interface SongMetadata {
  title?: string;
  artist?: string;
  Release_date?: string;
  source?: string;
  description?: string;
  archived_by?: string;
  archived_date?: string;
  audio?: string;
  thumbnail?: string;
  analysis?: string;
  files?: {
    audio?: string;
    thumbnail?: string;
  };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Missing ID" },
      { status: 400 }
    );
  }

  // Path ke folder Singles
  const singlesPath = path.join(
    process.cwd(),
    "..",
    "..",
    "archive",
    "creators",
    id,
    "Music",
    "Singles"
  );

  // Check if Singles folder exists
  if (!fs.existsSync(singlesPath)) {
    return NextResponse.json(
      { error: "Singles folder not found" },
      { status: 404 }
    );
  }

  const songs: SongMetadata[] = [];

  try {
    // Read all folders in Singles
    const folders = fs.readdirSync(singlesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // Read metadata.json from each folder
    for (const folder of folders) {
      const folderPath = path.join(singlesPath, folder);
      const metadataPath = path.join(folderPath, "metadata.json");

      // Check if metadata.json exists
      if (fs.existsSync(metadataPath)) {
        try {
          const metadataContent = fs.readFileSync(metadataPath, "utf-8");
          const metadata = JSON.parse(metadataContent) as any;

          // Construct full audio path
          const audioPath = metadata.files?.audio
            ? `${folder}/${metadata.files.audio}`
            : undefined;

          // Check for analysis.md
          const analysisPath = path.join(folderPath, "analysis.md");
          let analysisContent: string | undefined;
          if (fs.existsSync(analysisPath)) {
            try {
              analysisContent = fs.readFileSync(analysisPath, "utf-8");
            } catch (error) {
              console.error(`Error reading analysis for ${folder}:`, error);
            }
          }

          // Add to songs array with proper structure
          songs.push({
            title: metadata.title,
            artist: metadata.credits?.artist || metadata.artist,
            Release_date: metadata.release_date || metadata.Release_date,
            source: typeof metadata.source === 'string' ? metadata.source : metadata.source?.url,
            description: metadata.preservation?.why_archived || metadata.description,
            archived_by: metadata.archived_by,
            archived_date: metadata.archived_date,
            audio: audioPath,
            thumbnail: metadata.files?.thumbnail ? `${folder}/${metadata.files.thumbnail}` : undefined,
            analysis: analysisContent
          });
        } catch (error) {
          console.error(`Error reading metadata for ${folder}:`, error);
        }
      } else {
        // Fallback: look for old naming convention
        const oldMetadataPath = path.join(folderPath, `${folder}_metadata.json`);
        if (fs.existsSync(oldMetadataPath)) {
          try {
            const metadataContent = fs.readFileSync(oldMetadataPath, "utf-8");
            const metadata = JSON.parse(metadataContent) as any;

            // Check for analysis.md
            const analysisPath = path.join(folderPath, "analysis.md");
            let analysisContent: string | undefined;
            if (fs.existsSync(analysisPath)) {
              try {
                analysisContent = fs.readFileSync(analysisPath, "utf-8");
              } catch (error) {
                console.error(`Error reading analysis for ${folder}:`, error);
              }
            }

            songs.push({
              title: metadata.title,
              artist: metadata.credits?.artist || metadata.artist,
              Release_date: metadata.release_date || metadata.Release_date,
              source: typeof metadata.source === 'string' ? metadata.source : metadata.source?.url,
              description: metadata.preservation?.why_archived || metadata.description,
              archived_by: metadata.archived_by,
              archived_date: metadata.archived_date,
              audio: metadata.files?.audio
                ? `${folder}/${metadata.files.audio}`
                : undefined,
              thumbnail: metadata.files?.thumbnail ? `${folder}/${metadata.files.thumbnail}` : undefined,
              analysis: analysisContent
            });
          } catch (error) {
            console.error(`Error reading old metadata for ${folder}:`, error);
          }
        }
      }
    }

    return NextResponse.json(songs, { status: 200 });
  } catch (error) {
    console.error("Error reading Singles folder:", error);
    return NextResponse.json(
      { error: "Failed to read songs" },
      { status: 500 }
    );
  }
}