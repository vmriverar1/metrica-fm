'use client';

import React, { useState, useCallback } from 'react';
import { Search, BookOpen, Calendar, User, Tag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BlogCategory, 
  getBlogCategoryLabel
} from '@/types/blog';
import { useBlog } from '@/contexts/BlogContext';
import { cn } from '@/lib/utils';

interface BlogFiltersProps {
  className?: string;
}

export default function BlogFilters({ className }: BlogFiltersProps) {
  const { 
    filters, 
    setFilters, 
    postCount, 
    uniqueCategories,
    uniqueAuthors,
    uniqueTags
  } = useBlog();
  
  const [searchTerm, setSearchTerm] = useState(filters.searchQuery || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || []);

  const handleCategoryChange = useCallback((category: BlogCategory | 'all') => {
    setFilters({
      ...filters,
      category: category === 'all' ? undefined : category
    });
  }, [filters, setFilters]);

  const handleAuthorChange = useCallback((authorId: string) => {
    setFilters({
      ...filters,
      author: authorId === 'all' ? undefined : authorId
    });
  }, [filters, setFilters]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    // Debounce search
    const timeoutId = setTimeout(() => {
      setFilters({
        ...filters,
        searchQuery: term
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, setFilters]);

  const handleTagToggle = useCallback((tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newSelectedTags);
    setFilters({
      ...filters,
      tags: newSelectedTags.length > 0 ? newSelectedTags : undefined
    });
  }, [selectedTags, filters, setFilters]);

  const toggleFeatured = useCallback(() => {
    setFilters({
      ...filters,
      featured: filters.featured ? undefined : true
    });
  }, [filters, setFilters]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedTags([]);
    setFilters({
      searchQuery: ''
    });
  }, [setFilters]);

  const hasActiveFilters = filters.category ||
                          filters.author ||
                          filters.featured ||
                          filters.tags?.length ||
                          filters.searchQuery;

  return (
    <div className="bg-background/95 backdrop-blur-sm sticky top-20 z-40">
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Main Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select 
              value={filters.category || 'all'} 
              onValueChange={(value) => handleCategoryChange(value as BlogCategory | 'all')}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <SelectValue placeholder="Categoría" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {getBlogCategoryLabel(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Author Filter */}
            <Select 
              value={filters.author || 'all'} 
              onValueChange={(value) => handleAuthorChange(value)}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <SelectValue placeholder="Autor" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los autores</SelectItem>
                {uniqueAuthors?.map((author) => (
                  <SelectItem key={author.id} value={author.id}>
                    {author.name}
                  </SelectItem>
                )) || null}
              </SelectContent>
            </Select>

            {/* Featured Toggle */}
            <Button
              variant={filters.featured ? "default" : "outline"}
              onClick={toggleFeatured}
              className="justify-start"
            >
              <Star className={cn(
                "w-4 h-4 mr-2",
                filters.featured ? "fill-current" : ""
              )} />
              Destacados
            </Button>
          </div>

          {/* Tags Section */}
          {uniqueTags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Etiquetas:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueTags.slice(0, 12).map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
                {uniqueTags.length > 12 && (
                  <Badge variant="secondary" className="cursor-default">
                    +{uniqueTags.length - 12} más
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          <div className="flex justify-end">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  {getBlogCategoryLabel(filters.category)}
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {filters.author && (
                <Badge variant="secondary" className="gap-1">
                  {uniqueAuthors?.find(a => a.id === filters.author)?.name || 'Autor desconocido'}
                  <button
                    onClick={() => handleAuthorChange('all')}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}

              {filters.featured && (
                <Badge variant="secondary" className="gap-1">
                  Destacados
                  <button
                    onClick={toggleFeatured}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}

              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    onClick={() => handleTagToggle(tag)}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}