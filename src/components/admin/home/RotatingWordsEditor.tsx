'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, GripVertical, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RotatingWordsEditorProps {
  words: string[];
  onChange: (words: string[]) => void;
  maxWords?: number;
  placeholder?: string;
  preview?: boolean;
}

const RotatingWordsEditor: React.FC<RotatingWordsEditorProps> = ({
  words,
  onChange,
  maxWords = 8,
  placeholder = "Agregue palabra...",
  preview = true
}) => {
  const [newWord, setNewWord] = useState('');
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Preview animation
  useEffect(() => {
    if (!isPreviewPlaying || words.length === 0) return;

    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPreviewPlaying, words.length]);

  const handleAddWord = () => {
    const trimmedWord = newWord.trim();
    if (trimmedWord && words.length < maxWords && !words.includes(trimmedWord)) {
      const updatedWords = [...words, trimmedWord];
      onChange(updatedWords);
      setNewWord('');
    }
  };

  const handleRemoveWord = (index: number) => {
    const updatedWords = words.filter((_, i) => i !== index);
    onChange(updatedWords);
    
    // Reset preview if current word was removed
    if (currentWordIndex >= updatedWords.length) {
      setCurrentWordIndex(0);
    }
  };

  const handleUpdateWord = (index: number, newValue: string) => {
    const updatedWords = [...words];
    updatedWords[index] = newValue;
    onChange(updatedWords);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const updatedWords = [...words];
    const draggedWord = updatedWords[draggedIndex];
    
    // Remove dragged item
    updatedWords.splice(draggedIndex, 1);
    // Insert at new position
    updatedWords.splice(dropIndex, 0, draggedWord);
    
    onChange(updatedWords);
    setDraggedIndex(null);
  };

  const togglePreview = () => {
    setIsPreviewPlaying(!isPreviewPlaying);
    if (!isPreviewPlaying) {
      setCurrentWordIndex(0);
    }
  };

  const getWordColorClass = (word: string) => {
    const colors = [
      'text-blue-600', 'text-green-600', 'text-purple-600', 
      'text-orange-600', 'text-pink-600', 'text-indigo-600',
      'text-teal-600', 'text-red-600'
    ];
    return colors[word.length % colors.length] || 'text-gray-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Editor de Palabras Rotatorias</span>
              <Badge variant="outline">{words.length}/{maxWords}</Badge>
            </CardTitle>
            <CardDescription>
              Edite las palabras que rotan en la animación del hero. Arrastre para reordenar.
            </CardDescription>
          </div>
          {preview && words.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={togglePreview}
              className="flex items-center gap-2"
            >
              {isPreviewPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPreviewPlaying ? 'Pausar' : 'Preview'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Preview Section */}
        {preview && words.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Vista Previa de Animación:</p>
              <div className="text-3xl font-bold h-12 flex items-center justify-center">
                {isPreviewPlaying ? (
                  <span className={`transition-all duration-500 ${getWordColorClass(words[currentWordIndex])}`}>
                    {words[currentWordIndex]}
                  </span>
                ) : (
                  <span className="text-gray-400">
                    {words[0] || 'No hay palabras'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {isPreviewPlaying ? `Palabra ${currentWordIndex + 1} de ${words.length}` : 'Haga clic en Preview para ver la animación'}
              </p>
            </div>
          </div>
        )}

        {/* Add Word Section */}
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddWord();
              }
            }}
            className="flex-1"
            maxLength={15}
          />
          <Button
            type="button"
            onClick={handleAddWord}
            disabled={!newWord.trim() || words.length >= maxWords || words.includes(newWord.trim())}
            className="bg-[#E84E0F] hover:bg-[#E84E0F]/90"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Validation Messages */}
        {newWord.trim() && words.includes(newWord.trim()) && (
          <p className="text-sm text-amber-600">Esta palabra ya existe en la lista</p>
        )}
        {words.length >= maxWords && (
          <p className="text-sm text-amber-600">Máximo {maxWords} palabras permitidas</p>
        )}

        {/* Words List */}
        {words.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Palabras Actuales:</h3>
            {words.map((word, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`flex items-center gap-3 p-3 bg-white border rounded-lg transition-all duration-200 ${
                  draggedIndex === index 
                    ? 'opacity-50 border-blue-300' 
                    : 'hover:border-gray-300 hover:shadow-sm'
                } ${
                  isPreviewPlaying && currentWordIndex === index 
                    ? 'ring-2 ring-blue-200 border-blue-300' 
                    : ''
                }`}
              >
                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                
                <Badge variant="secondary" className="text-xs">
                  {index + 1}
                </Badge>
                
                <Input
                  value={word}
                  onChange={(e) => handleUpdateWord(index, e.target.value)}
                  className="flex-1 border-none shadow-none p-0 h-auto focus-visible:ring-0"
                  maxLength={15}
                />
                
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {word.length}/15
                  </Badge>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveWord(index)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No hay palabras configuradas.</p>
            <p className="text-sm">Agregue palabras para la animación del hero.</p>
          </div>
        )}

        {/* Statistics */}
        {words.length > 0 && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#003F6F]">{words.length}</p>
                <p className="text-xs text-gray-600">Palabras Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#E84E0F]">
                  {Math.round(words.reduce((acc, word) => acc + word.length, 0) / words.length)}
                </p>
                <p className="text-xs text-gray-600">Long. Promedio</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {words.every(word => word.length <= 12) ? '✓' : '!'}
                </p>
                <p className="text-xs text-gray-600">Longitud OK</p>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use verbos de acción cortos (máximo 12 caracteres)</li>
            <li>• Mantenga un tono consistente y profesional</li>
            <li>• El orden importa - las primeras palabras se ven más</li>
            <li>• Pruebe la animación con Preview antes de guardar</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default RotatingWordsEditor;