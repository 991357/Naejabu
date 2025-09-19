import { NextResponse } from 'next/server';
import path from 'path';
import { writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ message: 'No image file provided' }, { status: 400 });
    }

    // Server-side validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(image.type)) {
        return NextResponse.json({ message: 'Unsupported file type' }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const filename = `${Date.now()}-${image.name}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    await writeFile(path.join(uploadDir, filename), buffer);

    const imageUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: imageUrl }, { status: 200 });

  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ message: 'Failed to upload image', error: error.message }, { status: 500 });
  }
}