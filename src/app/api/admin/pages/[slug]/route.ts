import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Try both src and public paths for JSON files
    let filePath = path.join(process.cwd(), 'src', 'json', 'pages', `${slug}.json`);
    
    // Check if file exists in src, fallback to public
    try {
      await fs.access(filePath);
    } catch {
      filePath = path.join(process.cwd(), 'public', 'json', 'pages', `${slug}.json`);
      try {
        await fs.access(filePath);
      } catch {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
    }
    
    // Read and parse the JSON file
    const fileContents = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(fileContents);
    
    return NextResponse.json({
      success: true,
      data: {
        content: jsonData
      }
    });
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { content } = await request.json();
    
    // Try to write to src first, fallback to public
    let filePath = path.join(process.cwd(), 'src', 'json', 'pages', `${slug}.json`);
    
    // Check if src directory structure exists, otherwise use public
    try {
      await fs.access(path.dirname(filePath));
    } catch {
      filePath = path.join(process.cwd(), 'public', 'json', 'pages', `${slug}.json`);
    }
    
    // Write the updated JSON file
    await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'File updated successfully' 
    });
  } catch (error) {
    console.error('Error writing JSON file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}