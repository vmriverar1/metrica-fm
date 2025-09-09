'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar,
  MapPin,
  DollarSign,
  Building2,
  Users
} from 'lucide-react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Project, ProjectCategory, getCategoryLabel } from '@/types/portfolio';
import { cn } from '@/lib/utils';

// Note: Recharts removed for server optimization

interface ChartData {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

export default function DataVisualization() {
  const { allProjects } = usePortfolio();
  const [selectedView, setSelectedView] = useState<'category' | 'year' | 'location' | 'investment'>('category');
  const [animatedValues, setAnimatedValues] = useState<{ [key: string]: number }>({});
  const chartRef = useRef<HTMLDivElement>(null);

  // Calculate statistics
  const stats = {
    totalProjects: allProjects.length,
    totalArea: allProjects.reduce((sum, p) => {
      const area = parseInt(p.details.area.replace(/[^0-9]/g, '')) || 0;
      return sum + area;
    }, 0),
    averageInvestment: allProjects.reduce((sum, p) => {
      const inv = p.details.investment ? parseInt(p.details.investment.replace(/[^0-9]/g, '')) : 0;
      return sum + inv;
    }, 0) / allProjects.filter(p => p.details.investment).length,
    citiesCount: new Set(allProjects.map(p => p.location.city)).size
  };

  // Get data by category
  const getCategoryData = (): ChartData[] => {
    const categoryCount: { [key: string]: number } = {};
    allProjects.forEach(project => {
      categoryCount[project.category] = (categoryCount[project.category] || 0) + 1;
    });

    const colors = {
      [ProjectCategory.OFICINA]: '#3B82F6',
      [ProjectCategory.RETAIL]: '#10B981',
      [ProjectCategory.INDUSTRIA]: '#F59E0B',
      [ProjectCategory.HOTELERIA]: '#EF4444',
      [ProjectCategory.EDUCACION]: '#8B5CF6',
      [ProjectCategory.VIVIENDA]: '#EC4899',
      [ProjectCategory.SALUD]: '#06B6D4'
    };

    return Object.entries(categoryCount).map(([category, count]) => ({
      label: getCategoryLabel(category as ProjectCategory),
      value: count,
      color: colors[category as ProjectCategory] || '#6B7280',
      percentage: (count / allProjects.length) * 100
    }));
  };

  // Get data by year
  const getYearData = (): ChartData[] => {
    const yearCount: { [key: string]: number } = {};
    allProjects.forEach(project => {
      const year = project.completedAt.getFullYear();
      yearCount[year] = (yearCount[year] || 0) + 1;
    });

    const sortedYears = Object.entries(yearCount)
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .slice(0, 10);

    return sortedYears.map(([year, count], index) => ({
      label: year,
      value: count,
      color: `hsl(${200 + index * 10}, 70%, 50%)`,
      percentage: (count / allProjects.length) * 100
    }));
  };

  // Get data by location
  const getLocationData = (): ChartData[] => {
    const locationCount: { [key: string]: number } = {};
    allProjects.forEach(project => {
      locationCount[project.location.city] = (locationCount[project.location.city] || 0) + 1;
    });

    const sortedLocations = Object.entries(locationCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);

    return sortedLocations.map(([city, count], index) => ({
      label: city,
      value: count,
      color: `hsl(${120 + index * 20}, 60%, 50%)`,
      percentage: (count / allProjects.length) * 100
    }));
  };

  // Get investment ranges
  const getInvestmentData = (): ChartData[] => {
    const ranges = [
      { label: '< $5M', min: 0, max: 5 },
      { label: '$5M - $10M', min: 5, max: 10 },
      { label: '$10M - $20M', min: 10, max: 20 },
      { label: '$20M - $50M', min: 20, max: 50 },
      { label: '> $50M', min: 50, max: Infinity }
    ];

    return ranges.map((range, index) => {
      const count = allProjects.filter(p => {
        if (!p.details.investment) return false;
        const inv = parseInt(p.details.investment.replace(/[^0-9]/g, ''));
        return inv >= range.min && inv < range.max;
      }).length;

      return {
        label: range.label,
        value: count,
        color: `hsl(${30 + index * 30}, 70%, 50%)`,
        percentage: (count / allProjects.length) * 100
      };
    });
  };

  // Get current data based on selected view
  const getCurrentData = () => {
    switch (selectedView) {
      case 'category': return getCategoryData();
      case 'year': return getYearData();
      case 'location': return getLocationData();
      case 'investment': return getInvestmentData();
      default: return [];
    }
  };

  const currentData = getCurrentData();
  const maxValue = Math.max(...currentData.map(d => d.value));

  // Animate values on mount and view change
  useEffect(() => {
    const animateValues = () => {
      currentData.forEach((item, index) => {
        setTimeout(() => {
          setAnimatedValues(prev => ({
            ...prev,
            [item.label]: item.value
          }));
        }, index * 100);
      });
    };

    setAnimatedValues({});
    animateValues();
  }, [selectedView]);

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <span className="text-2xl font-bold">{stats.totalProjects}</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Proyectos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold">{(stats.totalArea / 1000).toFixed(0)}k</span>
          </div>
          <p className="text-sm text-muted-foreground">m² Construidos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-amber-500" />
            <span className="text-2xl font-bold">${stats.averageInvestment.toFixed(0)}M</span>
          </div>
          <p className="text-sm text-muted-foreground">Inversión Promedio</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-5 h-5 text-purple-500" />
            <span className="text-2xl font-bold">{stats.citiesCount}</span>
          </div>
          <p className="text-sm text-muted-foreground">Ciudades</p>
        </motion.div>
      </div>

      {/* Chart Section */}
      <div className="bg-card border rounded-xl p-6">
        {/* View Selector */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Análisis de Proyectos</h3>
          <div className="flex gap-2">
            {[
              { id: 'category', label: 'Categoría', icon: <PieChart className="w-4 h-4" /> },
              { id: 'year', label: 'Año', icon: <Calendar className="w-4 h-4" /> },
              { id: 'location', label: 'Ubicación', icon: <MapPin className="w-4 h-4" /> },
              { id: 'investment', label: 'Inversión', icon: <DollarSign className="w-4 h-4" /> }
            ].map(view => (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id as any)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  selectedView === view.id
                    ? "bg-accent text-white"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {view.icon}
                <span className="hidden md:inline">{view.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div ref={chartRef} className="space-y-4">
          {currentData.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {animatedValues[item.label] || 0}
                  </span>
                  {item.percentage && (
                    <span className="text-xs text-muted-foreground">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="h-8 bg-muted rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${((animatedValues[item.label] || 0) / maxValue) * 100}%` 
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  className="h-full rounded-lg relative overflow-hidden"
                  style={{ backgroundColor: item.color }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart Legend */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Total en vista: {currentData.reduce((sum, d) => sum + d.value, 0)} proyectos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-muted-foreground">
                Crecimiento anual: +15%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500/5 to-blue-600/5 border border-blue-500/10 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">
            Categoría Líder
          </h4>
          <p className="text-sm text-muted-foreground">
            {getCategoryData()[0]?.label} representa el {getCategoryData()[0]?.percentage?.toFixed(0)}% 
            de todos los proyectos
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500/5 to-green-600/5 border border-green-500/10 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">
            Mayor Concentración
          </h4>
          <p className="text-sm text-muted-foreground">
            {getLocationData()[0]?.label} tiene {getLocationData()[0]?.value} proyectos completados
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/5 to-amber-600/5 border border-amber-500/10 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-amber-600 dark:text-amber-400">
            Año Récord
          </h4>
          <p className="text-sm text-muted-foreground">
            {getYearData()[0]?.label} con {getYearData()[0]?.value} proyectos finalizados
          </p>
        </div>
      </div>
    </div>
  );
}