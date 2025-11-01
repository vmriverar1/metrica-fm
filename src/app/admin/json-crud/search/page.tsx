/**
 * Página de Búsqueda Global - Sistema JSON CRUD
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  FileText,
  Building2,
  Briefcase,
  PenTool,
  User,
  Clock,
  ExternalLink,
  Tag,
  ChevronDown,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'page' | 'portfolio-project' | 'portfolio-category' | 'career-job' | 'career-department' | 'newsletter-article' | 'newsletter-author' | 'newsletter-category';
  title: string;
  description: string;
  url: string;
  score: number;
  metadata: Record<string, any>;
  highlighted_fields: string[];
}

interface SearchStats {
  total_results: number;
  search_term: string;
  search_type: string;
  fuzzy_enabled: boolean;
  by_type: Record<string, number>;
  avg_score: number;
}

const typeLabels = {
  'page': 'Página',
  'portfolio-project': 'Proyecto',
  'portfolio-category': 'Categoría Portfolio',
  'career-job': 'Trabajo',
  'career-department': 'Departamento',
  'newsletter-article': 'Artículo',
  'newsletter-author': 'Autor',
  'newsletter-category': 'Categoría Newsletter'
};

const typeIcons = {
  'page': FileText,
  'portfolio-project': Building2,
  'portfolio-category': Building2,
  'career-job': Briefcase,
  'career-department': Briefcase,
  'newsletter-article': PenTool,
  'newsletter-author': User,
  'newsletter-category': PenTool
};

const typeColors = {
  'page': 'bg-gray-100 text-gray-800',
  'portfolio-project': 'bg-blue-100 text-blue-800',
  'portfolio-category': 'bg-blue-100 text-blue-800',
  'career-job': 'bg-green-100 text-green-800',
  'career-department': 'bg-green-100 text-green-800',
  'newsletter-article': 'bg-purple-100 text-purple-800',
  'newsletter-author': 'bg-cyan-100 text-cyan-800',
  'newsletter-category': 'bg-purple-100 text-purple-800'
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState(searchParams.get('type') || 'all');
  const [fuzzySearch, setFuzzySearch] = useState(searchParams.get('fuzzy') === 'true');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const performSearch = useCallback(async (term: string, type: string, fuzzy: boolean) => {
    if (!term.trim() || term.length < 2) {
      setResults([]);
      setStats(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: term,
        type,
        fuzzy: fuzzy.toString(),
        limit: '50'
      });

      const response = await fetch(`/api/admin/search?${params}`);
      
      if (!response.ok) {
        throw new Error('Error en la búsqueda');
      }

      const data = await response.json();
      
      if (data.success) {
        setResults(data.data.results);
        setStats(data.data.stats);
      } else {
        setError(data.message || 'Error desconocido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        performSearch(searchTerm, searchType, fuzzySearch);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, searchType, fuzzySearch, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      performSearch(searchTerm, searchType, fuzzySearch);
    }
  };

  const getTypeIcon = (type: string) => {
    const Icon = typeIcons[type as keyof typeof typeIcons] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    return typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === term.toLowerCase()) {
        return <mark key={index} className="bg-yellow-200 px-1">{part}</mark>;
      }
      return part;
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Búsqueda Global</h1>
        <p className="mt-2 text-gray-600">
          Busca en todo el contenido del sistema: páginas, portfolio, carreras y newsletter.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar en todo el contenido..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
              {loading && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Filters Toggle */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros avanzados
              <ChevronDown className={`w-4 h-4 ml-1 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Buscar
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de contenido
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todo el contenido</option>
                  <option value="pages">Páginas estáticas</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="careers">Carreras</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opciones de búsqueda
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={fuzzySearch}
                    onChange={(e) => setFuzzySearch(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Búsqueda aproximada (fuzzy)
                  </label>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error en la búsqueda</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Stats */}
      {stats && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{stats.total_results}</span> resultados para{' '}
                <span className="font-medium">"{stats.search_term}"</span>
                {stats.fuzzy_enabled && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">fuzzy</span>}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Score promedio: {stats.avg_score}
            </div>
          </div>

          {/* Type Distribution */}
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(stats.by_type).map(([type, count]) => (
              count > 0 && (
                <span key={type} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(type)}`}>
                  {getTypeIcon(type)}
                  <span className="ml-1">{getTypeLabel(type)}: {count}</span>
                </span>
              )
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {results.map((result) => (
          <div key={result.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                    {getTypeIcon(result.type)}
                    <span className="ml-1">{getTypeLabel(result.type)}</span>
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    Score: {result.score}
                  </span>
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {highlightText(result.title, searchTerm)}
                </h3>

                <p className="text-gray-600 mb-3">
                  {highlightText(result.description, searchTerm)}
                </p>

                {/* Metadata */}
                {result.metadata && Object.keys(result.metadata).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Object.entries(result.metadata).slice(0, 3).map(([key, value]) => (
                      <span key={key} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        <Tag className="w-3 h-3 mr-1" />
                        {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Highlighted Fields */}
                {result.highlighted_fields.length > 0 && (
                  <div className="text-xs text-blue-600 mb-2">
                    Coincidencias en: {result.highlighted_fields.join(', ')}
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {result.url}
                </div>
              </div>

              <div className="ml-4">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && searchTerm && results.length === 0 && !error && (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron resultados</h3>
          <p className="mt-1 text-sm text-gray-500">
            Intenta con otros términos de búsqueda o habilita la búsqueda aproximada.
          </p>
        </div>
      )}

      {/* Initial State */}
      {!searchTerm && (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Comienza a buscar</h3>
          <p className="mt-1 text-sm text-gray-500">
            Escribe al menos 2 caracteres para iniciar la búsqueda en todo el contenido.
          </p>
        </div>
      )}
    </div>
  );
}