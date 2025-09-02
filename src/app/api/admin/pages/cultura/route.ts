import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'json', 'pages', 'cultura.json');
    const data = await readFile(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error loading cultura data:', error);
    if ((error as any)?.code === 'ENOENT') {
      return NextResponse.json({}, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to load cultura data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    const filePath = path.join(process.cwd(), 'public', 'json', 'pages', 'cultura.json');
    
    await writeFile(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ message: 'Cultura data saved successfully' });
  } catch (error) {
    console.error('Error saving cultura data:', error);
    return NextResponse.json(
      { error: 'Failed to save cultura data' },
      { status: 500 }
    );
  }
}