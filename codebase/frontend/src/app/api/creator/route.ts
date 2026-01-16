import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs"; // <-- IMPORTANT

export async function GET() {
  try {
    // Safe path (always correct in Next.js)
    const archivePath = path.join(process.cwd(), "..", "..", "archive", "creators");

    const creators = fs
      .readdirSync(archivePath)
      .filter(
        (name) =>
          !name.startsWith("_") &&
          name !== "collections" &&
          name !== "raw_backups"
      )
      .map((name) => {
        const creatorPath = path.join(archivePath, name);

        // --- NEW: Find creator image ---
        const outfitPath = path.join(creatorPath, "outfit");
        let creatorImage = "creators/Hoshimachi_Suisei/outfit/suisei.png"; // Default placeholder
        
        if (fs.existsSync(outfitPath)) {
          try {
            const files = fs.readdirSync(outfitPath);
            const imageFile = files.find(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file));
            if (imageFile) {
              creatorImage = `creators/${name}/outfit/${imageFile}`;
            }
          } catch (e) {
            console.error(`Could not read outfit directory for ${name}:`, e);
          }
        }

        // Metadata folder
        const metadataFolder = path.join(creatorPath, "Music", "Singles");
        let jsonCount = 0;
        if (fs.existsSync(metadataFolder)) {
          jsonCount = fs
            .readdirSync(metadataFolder, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory()).length;
        }

        return {
          id: name,
          name: name.replace(/_/g, " "),
          worksCount: jsonCount,
          completeness: jsonCount / 150, // Example total works for Suisei
          imagePath: creatorImage,
        };
      });

    return NextResponse.json({ creators });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to read archive" },
      { status: 500 }
    );
  }
}
