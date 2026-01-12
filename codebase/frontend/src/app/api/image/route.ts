import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pathParam = searchParams.get('path');

  if (!pathParam) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  const fullPath = path.join(process.cwd(), '..', '..', 'archive', pathParam);

  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const file = fs.readFileSync(fullPath);

  // Determine content type based on extension
  const ext = path.extname(fullPath).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.png') contentType = 'image/png';
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.gif') contentType = 'image/gif';

  return new Response(file, {
    headers: {
      'Content-Type': contentType,
    },
  });
}