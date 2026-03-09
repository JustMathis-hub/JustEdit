import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';

const MIME: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const filePath = join(process.cwd(), 'public', ...path);

  try {
    const info = await stat(filePath);
    const ext = '.' + path[path.length - 1].split('.').pop()?.toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    const file = await readFile(filePath);

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(info.size),
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
