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

// GET - Obtener usuario específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await readUsersFile();
    const user = data.users.find((u: any) => u.id === (await params).id);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Convertir strings de fecha a objetos Date
    const userWithDates = {
      ...user,
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    };

    return NextResponse.json(userWithDates);
  } catch (error) {
    console.error('Error in GET /api/admin/users/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar usuario específico
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const data = await readUsersFile();

    const userIndex = data.users.findIndex((u: any) => u.id === (await params).id);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const existingUser = data.users[userIndex];

    // Si se está actualizando el email, verificar que no exista
    if (body.email && body.email !== existingUser.email) {
      const emailExists = data.users.some((u: any) => 
        u.email === body.email && u.id !== (await params).id
      );
      if (emailExists) {
        return NextResponse.json(
          { error: 'El email ya está registrado' },
          { status: 400 }
        );
      }
    }

    // Si se está actualizando el rol, buscar la información completa
    if (body.roleId) {
      const role = data.roles.find((r: any) => r.id === body.roleId);
      if (!role) {
        return NextResponse.json(
          { error: 'Rol no válido' },
          { status: 400 }
        );
      }
      body.role = {
        id: role.id,
        name: role.name,
        level: role.level
      };
      delete body.roleId;
    }

    // Actualizar usuario
    const updatedUser = {
      ...existingUser,
      ...body,
      updatedAt: new Date().toISOString()
    };

    data.users[userIndex] = updatedUser;

    const success = await writeUsersFile(data);
    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar usuario' },
        { status: 500 }
      );
    }

    // Convertir fechas para respuesta
    const responseUser = {
      ...updatedUser,
      lastLogin: updatedUser.lastLogin ? new Date(updatedUser.lastLogin) : null,
      createdAt: new Date(updatedUser.createdAt),
      updatedAt: new Date(updatedUser.updatedAt)
    };

    return NextResponse.json(responseUser);
  } catch (error) {
    console.error('Error in PATCH /api/admin/users/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar usuario específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await readUsersFile();

    const userIndex = data.users.findIndex((u: any) => u.id === (await params).id);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // No permitir eliminar el último admin
    const user = data.users[userIndex];
    if (user.role.id === 'admin') {
      const adminCount = data.users.filter((u: any) => u.role.id === 'admin').length;
      if (adminCount === 1) {
        return NextResponse.json(
          { error: 'No se puede eliminar el último administrador' },
          { status: 400 }
        );
      }
    }

    // Eliminar usuario
    data.users.splice(userIndex, 1);

    const success = await writeUsersFile(data);
    if (!success) {
      return NextResponse.json(
        { error: 'Error al eliminar usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/users/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}