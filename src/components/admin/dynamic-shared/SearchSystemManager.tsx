'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  TrendingUp, 
  Tag, 
  MapPin, 
  User, 
  Calendar,
  RefreshCw,
  Settings,
  Download,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface SearchSuggestion {
  id: string
  text: string
  type: 'content' | 'category' | 'author' | 'location' | 'tag'
  count: number
  module: 'newsletter' | 'portfolio' | 'careers'
}

interface SearchFilter {
  key: string
  label: string
  type: 'select' | 'range' | 'date' | 'multiselect'
  options?: { value: string; label: string; count?: number }[]
  min?: number
  max?: number
}

interface SearchResult {
  id: string
  title: string
  content: string
  module: 'newsletter' | 'portfolio' | 'careers'
  category: string
  author?: string
  location?: string
  date: string
  score: number
  highlighted: string
  metadata: Record<string, any>
}

interface SearchSystemManagerProps {
  modules: ('newsletter' | 'portfolio' | 'careers')[]
  onSearch: (query: string, filters: Record<string, any>, modules: string[]) => Promise<SearchResult[]>
  onGetSuggestions: (query: string) => Promise<SearchSuggestion[]>
  onGetFilters: (modules: string[]) => Promise<SearchFilter[]>
  recentSearches?: string[]
  popularSearches?: string[]
}

export default function SearchSystemManager({
  modules,
  onSearch,
  onGetSuggestions,
  onGetFilters,
  recentSearches = [],
  popularSearches = []
}: SearchSystemManagerProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [results, setResults] = useState<SearchResult[]>([])
  const [filters, setFilters] = useState<SearchFilter[]>([])
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [selectedModules, setSelectedModules] = useState<string[]>(modules)
  const [isSearching, setIsSearching] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchStats, setSearchStats] = useState({
    total: 0,
    time: 0,
    distribution: {} as Record<string, number>
  })

  // Module configurations
  const moduleConfig = {
    newsletter: { icon: '📰', label: 'Artículos', color: 'bg-blue-100 text-blue-800' },
    portfolio: { icon: '🏗️', label: 'Proyectos', color: 'bg-green-100 text-green-800' },
    careers: { icon: '💼', label: 'Ofertas', color: 'bg-purple-100 text-purple-800' }
  }

  // Load filters when modules change
  useEffect(() => {
    const loadFilters = async () => {
      const moduleFilters = await onGetFilters(selectedModules)
      setFilters(moduleFilters)
    }
    
    if (selectedModules.length > 0) {
      loadFilters()
    }
  }, [selectedModules, onGetFilters])

  // Handle search suggestions
  const handleQueryChange = useCallback(async (value: string) => {
    setQuery(value)
    
    if (value.length >= 2) {
      const newSuggestions = await onGetSuggestions(value)
      setSuggestions(newSuggestions)
    } else {
      setSuggestions([])
    }
  }, [onGetSuggestions])

  // Perform search
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return

    setIsSearching(true)
    const startTime = Date.now()
    
    try {
      const searchResults = await onSearch(query, activeFilters, selectedModules)
      const endTime = Date.now()
      
      setResults(searchResults)
      setSearchStats({
        total: searchResults.length,
        time: endTime - startTime,
        distribution: searchResults.reduce((acc, result) => {
          acc[result.module] = (acc[result.module] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      })
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }, [query, activeFilters, selectedModules, onSearch])

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    setSuggestions([])
    
    // Add filter based on suggestion type
    if (suggestion.type !== 'content') {
      const filterKey = suggestion.type === 'author' ? 'author' : 
                       suggestion.type === 'location' ? 'location' :
                       suggestion.type === 'category' ? 'category' : 'tags'
      
      setActiveFilters(prev => ({
        ...prev,
        [filterKey]: suggestion.text
      }))
    }
  }

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Remove filter
  const removeFilter = (key: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({})
  }

  // Toggle module selection
  const toggleModule = (module: string) => {
    setSelectedModules(prev => 
      prev.includes(module)
        ? prev.filter(m => m !== module)
        : [...prev, module]
    )
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'author': return <User className="h-3 w-3" />
      case 'location': return <MapPin className="h-3 w-3" />
      case 'category': return <Tag className="h-3 w-3" />
      case 'tag': return <Tag className="h-3 w-3" />
      default: return <Search className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema de Búsqueda Avanzada
          </h1>
          <p className="text-gray-600">
            Busca contenido en todos los módulos dinámicos
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar resultados
          </Button>
        </div>
      </div>

      {/* Search Interface */}
      <Card>
        <CardContent className="p-6">
          {/* Module Selection */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Buscar en:
            </label>
            <div className="flex gap-2">
              {modules.map(module => (
                <Badge
                  key={module}
                  variant={selectedModules.includes(module) ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => toggleModule(module)}
                >
                  <span className="mr-1">{moduleConfig[module].icon}</span>
                  {moduleConfig[module].label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Buscar contenido..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-12 h-12 text-lg"
            />
            <Button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              size="sm"
            >
              {isSearching ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.id}-${index}`}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <div className="flex items-center space-x-2">
                      {getSuggestionIcon(suggestion.type)}
                      <span>{suggestion.text}</span>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type}
                      </Badge>
                    </div>
                    <span className="text-gray-400 text-sm">
                      {suggestion.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-gray-600"
            >
              Filtros avanzados
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4 ml-1" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-1" />
              )}
            </Button>

            {Object.keys(activeFilters).length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600"
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="border-t pt-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filters.map(filter => (
                  <div key={filter.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {filter.label}
                    </label>
                    
                    {filter.type === 'select' && (
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={activeFilters[filter.key] || ''}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      >
                        <option value="">Todos</option>
                        {filter.options?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label} {option.count && `(${option.count})`}
                          </option>
                        ))}
                      </select>
                    )}

                    {filter.type === 'date' && (
                      <Input
                        type="date"
                        value={activeFilters[filter.key] || ''}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      />
                    )}

                    {filter.type === 'range' && (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          min={filter.min}
                          max={filter.max}
                          value={activeFilters[`${filter.key}_min`] || ''}
                          onChange={(e) => handleFilterChange(`${filter.key}_min`, e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          min={filter.min}
                          max={filter.max}
                          value={activeFilters[`${filter.key}_max`] || ''}
                          onChange={(e) => handleFilterChange(`${filter.key}_max`, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters */}
          {Object.keys(activeFilters).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(activeFilters).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="px-3 py-1">
                  {key}: {value}
                  <button
                    onClick={() => removeFilter(key)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Stats */}
      {results.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>
                  {searchStats.total} resultado{searchStats.total !== 1 ? 's' : ''}
                </span>
                <span>
                  {searchStats.time}ms
                </span>
                <div className="flex space-x-2">
                  {Object.entries(searchStats.distribution).map(([module, count]) => (
                    <Badge key={module} className={moduleConfig[module as keyof typeof moduleConfig].color}>
                      {moduleConfig[module as keyof typeof moduleConfig].icon} {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map(result => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={moduleConfig[result.module].color}>
                      {moduleConfig[result.module].icon} {moduleConfig[result.module].label}
                    </Badge>
                    <Badge variant="outline">{result.category}</Badge>
                    <span className="text-sm text-gray-500">
                      Score: {result.score.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(result.date).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {result.title}
                </h3>
                
                <div 
                  className="text-gray-600 mb-3"
                  dangerouslySetInnerHTML={{ __html: result.highlighted }}
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {result.author && (
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{result.author}</span>
                      </div>
                    )}
                    {result.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{result.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    Ver detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent & Popular Searches */}
      {!results.length && !isSearching && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recentSearches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Búsquedas recientes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <button
                      key={index}
                      className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-50"
                      onClick={() => setQuery(search)}
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {popularSearches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Búsquedas populares</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {popularSearches.slice(0, 5).map((search, index) => (
                    <button
                      key={index}
                      className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-50"
                      onClick={() => setQuery(search)}
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}