import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const USERS_FILE_PATH = path.join(process.cwd(), 'private/data/users.json');

// GET - Obtener todos los roles y departamentos
export async function GET() {
  try {
    const fileContents = await fs.readFile(USERS_FILE_PATH, 'utf8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json({
      roles: data.roles,
      departments: data.departments
    });
  } catch (error) {
    console.error('Error reading users file:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}