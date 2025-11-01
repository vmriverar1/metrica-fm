'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function clearServerCache() {
  try {
    // Limpiar TODAS las rutas del cache
    const paths = [
      '/',
      '/about',
      '/about/historia',
      '/about/cultura',
      '/about/clientes',
      '/services',
      '/portfolio',
      '/blog',
      '/contact',
      '/careers',
    ];

    // Revalidar cada ruta
    paths.forEach(path => {
      revalidatePath(path, 'page');
      revalidatePath(path, 'layout');
    });

    // Revalidar tags comunes
    revalidateTag('pages');
    revalidateTag('home');
    revalidateTag('blog');
    revalidateTag('portfolio');

    // Limpiar cache de fetch global
    revalidatePath('/', 'layout');

    return {
      success: true,
      message: '✅ Cache limpiado completamente',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error clearing cache:', error);
    return {
      success: false,
      error: 'Error al limpiar cache'
    };
  }
}