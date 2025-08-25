import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const USERS_FILE_PATH = path.join(process.cwd(), 'private/data/users.json');

// Función helper para leer el archivo de usuarios
async function readUsersFile() {
  try {
    const fileContents = await fs.readFile(USERS_FILE_PATH, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading users file:', error);
    return { users: [], roles: [], departments: [] };
  }
}

// Función helper para escribir el archivo de usuarios
async function writeUsersFile(data: any) {
  try {
    await fs.writeFile(USERS_FILE_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users file:', error);
    return false;
  }
}

// GET - Obtener todos los usuarios
export async function GET(request: NextRequest) {
  try {
    const data = await readUsersFile();
    
    // Convertir strings de fecha a objetos Date para el frontend
    const usersWithDates = data.users.map((user: any) => ({
      ...user,
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    }));

    return NextResponse.json(usersWithDates);
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}

// POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await readUsersFile();

    // Validar campos requeridos
    const { email, firstName, lastName, roleId, department } = body;
    if (!email || !firstName || !lastName || !roleId || !department) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el email no exista
    const existingUser = data.users.find((user: any) => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Buscar el rol
    const role = data.roles.find((r: any) => r.id === roleId);
    if (!role) {
      return NextResponse.json(
        { error: 'Rol no válido' },
        { status: 400 }
      );
    }

    // Crear nuevo usuario
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      firstName,
      lastName,
      avatar: null,
      role: {
        id: role.id,
        name: role.name,
        level: role.level
      },
      department,
      isActive: true,
      lastLogin: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.users.push(newUser);
    
    const success = await writeUsersFile(data);
    if (!success) {
      return NextResponse.json(
        { error: 'Error al guardar usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}