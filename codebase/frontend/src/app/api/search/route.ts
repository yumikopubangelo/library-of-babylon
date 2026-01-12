import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface SearchResult {
  id: string;
  creatorId: string;
  title: string;
  artist: string;
  type: string;
  release_date: string;
  thumbnail?: string;
  description?: string;
  source?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  const type = searchParams.get('type');
  const creator = searchParams.get('creator');
  const genre = searchParams.get('genre');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  try {
    const archivePath = path.join(process.cwd(), "..", "..", "archive", "creators");
    const results: SearchResult[] = [];

    // Get all creators
    const creators = fs
      .readdirSync(archivePath)
      .filter(name => !name.startsWith("_") && name !== "collections" && name !== "raw_backups");

    for (const creatorId of creators) {
      const creatorPath = path.join(archivePath, creatorId);

      // Search in Music/Singles
      const singlesPath = path.join(creatorPath, "Music", "Singles");
      if (fs.existsSync(singlesPath)) {
        const folders = fs.readdirSync(singlesPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);

        for (const folder of folders) {
          const folderPath = path.join(singlesPath, folder);
          const metadataPath = path.join(folderPath, "metadata.json");

          if (fs.existsSync(metadataPath)) {
            try {
              const metadataContent = fs.readFileSync(metadataPath, "utf-8");
              const metadata = JSON.parse(metadataContent) as any;

              // Extract fields
              const title = metadata.title || '';
              const artist = metadata.credits?.artist || metadata.artist || '';
              const workType = metadata.type || 'song';
              const releaseDate = metadata.release_date || metadata.Release_date || '';
              const description = metadata.preservation?.why_archived || metadata.description || '';
              const source = typeof metadata.source === 'string' ? metadata.source : metadata.source?.url;
              const thumbnail = metadata.files?.thumbnail ? `creators/${creatorId}/Music/Singles/${folder}/${metadata.files.thumbnail}` : undefined;

              // Apply filters
              if (type && workType !== type) continue;
              if (creator && !creatorId.toLowerCase().includes(creator.toLowerCase())) continue;
              if (genre && !JSON.stringify(metadata.classification?.genre || []).toLowerCase().includes(genre.toLowerCase())) continue;
              if (dateFrom && releaseDate < dateFrom) continue;
              if (dateTo && releaseDate > dateTo) continue;

              // Search in text fields
              const searchableText = `${title} ${artist} ${description} ${JSON.stringify(metadata.themes || [])} ${JSON.stringify(metadata.emotional_tags || [])}`.toLowerCase();
              if (query && !searchableText.includes(query)) continue;

              results.push({
                id: `${creatorId}/${folder}`,
                creatorId,
                title,
                artist,
                type: workType,
                release_date: releaseDate,
                thumbnail,
                description,
                source
              });
            } catch (error) {
              console.error(`Error parsing ${metadataPath}:`, error);
            }
          }
        }
      }
    }

    return NextResponse.json({ results, total: results.length });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}