'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Importación dinámica para evitar problemas de SSR
const TiptapEditor = dynamic(() => import('./TiptapEditor'), {
  ssr: false,
  loading: () => (
    <div className="border rounded-lg">
      <div className="border-b p-2 bg-gray-50 h-12"></div>
      <div className="min-h-[300px] p-4 flex items-center justify-center text-gray-500">
        Cargando editor...
      </div>
    </div>
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor(props: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="border rounded-lg">
        <div className="border-b p-2 bg-gray-50 h-12"></div>
        <div className="min-h-[300px] p-4 flex items-center justify-center text-gray-500">
          Cargando editor...
        </div>
      </div>
    );
  }

  return <TiptapEditor {...props} />;
}