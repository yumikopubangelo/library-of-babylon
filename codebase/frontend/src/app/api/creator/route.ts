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

        // Metadata folder
        const metadataFolder = path.join(creatorPath, "Music", "Singles");

        let jsonCount = 0;

        if (fs.existsSync(metadataFolder)) {
          // Count subdirectories (each represents a work)
          jsonCount = fs
            .readdirSync(metadataFolder, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory()).length;
        }

        return {
          id: name,
          name: name.replace(/_/g, " "),
          worksCount: jsonCount,
          completeness: jsonCount / 150, // Example total works for Suisei
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
