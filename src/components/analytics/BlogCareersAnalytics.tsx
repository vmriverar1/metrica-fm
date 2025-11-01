'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Clock, 
  Share2, 
  Heart, 
  MessageCircle,
  FileText,
  Briefcase,
  Target,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  Filter,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BlogPost } from '@/types/blog';
import { JobPosting } from '@/types/careers';

interface AnalyticsData {
  blog: {
    totalViews: number;
    totalArticles: number;
    totalComments: number;
    averageReadingTime: number;
    topArticles: (BlogPost & { views: number; engagement: number })[];
    categoryStats: { category: string; views: number; articles: number }[];
    monthlyGrowth: { month: string; views: number; articles: number }[];
    readerEngagement: {
      totalReaders: number;
      returningReaders: number;
      averageSessionTime: number;
      bounceRate: number;
    };
  };
  careers: {
    totalApplications: number;
    totalJobs: number;
    averageTimeToHire: number;
    applicationRate: number;
    topJobs: (JobPosting & { applications: number; views: number })[];
    departmentStats: { department: string; applications: number; jobs: number }[];
    monthlyStats: { month: string; applications: number; hires: number }[];
    candidateMetrics: {
      totalCandidates: number;
      qualifiedRate: number;
      averageExperience: number;
      topSkills: { skill: string; demand: number }[];
    };
  };
  shared: {
    totalTraffic: number;
    organicGrowth: number;
    socialShares: number;
    mobileTraffic: number;
  };
}

interface BlogCareersAnalyticsProps {
  data?: AnalyticsData;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
  className?: string;
}

// Mock data generator
const generateMockData = (): AnalyticsData => ({
  blog: {
    totalViews: 125430,
    totalArticles: 47,
    totalComments: 892,
    averageReadingTime: 4.2,
    topArticles: [
      {
        id: '1',
        title: 'El Futuro de la Construcción Sostenible en el Perú',
        views: 15420,
        engagement: 87,
        category: 'industria-tendencias'
      } as any,
      {
        id: '2', 
        title: 'Caso de Estudio: Modernización del Aeropuerto Jorge Chávez',
        views: 12850,
        engagement: 92,
        category: 'casos-estudio'
      } as any,
      {
        id: '3',
        title: 'Guía Técnica: BIM en Proyectos de Infraestructura',
        views: 10340,
        engagement: 78,
        category: 'guias-tecnicas'
      } as any
    ],
    categoryStats: [
      { category: 'Industria & Tendencias', views: 45230, articles: 12 },
      { category: 'Casos de Estudio', views: 38740, articles: 15 },
      { category: 'Guías Técnicas', views: 28560, articles: 13 },
      { category: 'Liderazgo & Visión', views: 12900, articles: 7 }
    ],
    monthlyGrowth: [
      { month: 'Ene', views: 8500, articles: 4 },
      { month: 'Feb', views: 12300, articles: 5 },
      { month: 'Mar', views: 15200, articles: 6 },
      { month: 'Abr', views: 18900, articles: 8 },
      { month: 'May', views: 22400, articles: 7 },
      { month: 'Jun', views: 25800, articles: 9 }
    ],
    readerEngagement: {
      totalReaders: 45230,
      returningReaders: 12450,
      averageSessionTime: 5.8,
      bounceRate: 32.4
    }
  },
  careers: {
    totalApplications: 1847,
    totalJobs: 23,
    averageTimeToHire: 28,
    applicationRate: 6.8,
    topJobs: [
      {
        id: '1',
        title: 'Ingeniero de Proyectos Senior',
        applications: 156,
        views: 2340,
        department: 'Ingeniería'
      } as any,
      {
        id: '2',
        title: 'Gerente de Construcción',
        applications: 134,
        views: 1980,
        department: 'Gestión'
      } as any,
      {
        id: '3',
        title: 'Arquitecto BIM',
        applications: 98,
        views: 1650,
        department: 'Arquitectura'
      } as any
    ],
    departmentStats: [
      { department: 'Ingeniería', applications: 678, jobs: 8 },
      { department: 'Gestión', applications: 445, jobs: 6 },
      { department: 'Arquitectura', applications: 389, jobs: 5 },
      { department: 'Operaciones', applications: 235, jobs: 3 },
      { department: 'Administración', applications: 100, jobs: 1 }
    ],
    monthlyStats: [
      { month: 'Ene', applications: 245, hires: 8 },
      { month: 'Feb', applications: 298, hires: 12 },
      { month: 'Mar', applications: 356, hires: 15 },
      { month: 'Abr', applications: 423, hires: 18 },
      { month: 'May', applications: 389, hires: 16 },
      { month: 'Jun', applications: 456, hires: 21 }
    ],
    candidateMetrics: {
      totalCandidates: 1234,
      qualifiedRate: 68.5,
      averageExperience: 5.8,
      topSkills: [
        { skill: 'Project Management', demand: 89 },
        { skill: 'AutoCAD', demand: 76 },
        { skill: 'BIM', demand: 67 },
        { skill: 'Gestión de Equipos', demand: 54 },
        { skill: 'Inglés Avanzado', demand: 48 }
      ]
    }
  },
  shared: {
    totalTraffic: 89450,
    organicGrowth: 34.7,
    socialShares: 2890,
    mobileTraffic: 67.8
  }
});

export default function BlogCareersAnalytics({
  data: externalData,
  timeRange = '30d',
  onTimeRangeChange,
  className
}: BlogCareersAnalyticsProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [data, setData] = useState<AnalyticsData>(externalData || generateMockData());

  // Simulate real-time data updates
  useEffect(() => {
    if (!externalData) {
      const interval = setInterval(() => {
        setData(generateMockData());
      }, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [externalData]);

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="w-3 h-3 text-green-600" />;
    if (current < previous) return <ArrowDown className="w-3 h-3 text-red-600" />;
    return <Minus className="w-3 h-3 text-gray-600" />;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number) => `${num.toFixed(1)}%`;

  const timeRangeLabels = {
    '7d': 'Últimos 7 días',
    '30d': 'Últimos 30 días', 
    '90d': 'Últimos 3 meses',
    '1y': 'Último año'
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Métricas de rendimiento para Blog y Careers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(timeRangeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
              {getTrendIcon(data.shared.totalTraffic, 75000)}
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNumber(data.shared.totalTraffic)}</p>
              <p className="text-sm text-muted-foreground">Visitantes Totales</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              {getTrendIcon(data.shared.organicGrowth, 28.5)}
            </div>
            <div>
              <p className="text-2xl font-bold">{formatPercentage(data.shared.organicGrowth)}</p>
              <p className="text-sm text-muted-foreground">Crecimiento Orgánico</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Share2 className="w-4 h-4 text-purple-600" />
              </div>
              {getTrendIcon(data.shared.socialShares, 2100)}
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNumber(data.shared.socialShares)}</p>
              <p className="text-sm text-muted-foreground">Compartidos Sociales</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Users className="w-4 h-4 text-cyan-600" />
              </div>
              {getTrendIcon(data.shared.mobileTraffic, 62.3)}
            </div>
            <div>
              <p className="text-2xl font-bold">{formatPercentage(data.shared.mobileTraffic)}</p>
              <p className="text-sm text-muted-foreground">Tráfico Móvil</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="blog">Blog Analytics</TabsTrigger>
          <TabsTrigger value="careers">Careers Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blog Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Blog Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatNumber(data.blog.totalViews)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {data.blog.totalArticles}
                    </p>
                    <p className="text-sm text-muted-foreground">Artículos</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Tiempo promedio de lectura</span>
                    <span className="font-medium">{data.blog.averageReadingTime} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Comentarios totales</span>
                    <span className="font-medium">{data.blog.totalComments}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Lectores recurrentes</span>
                    <span className="font-medium">
                      {formatPercentage((data.blog.readerEngagement.returningReaders / data.blog.readerEngagement.totalReaders) * 100)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Careers Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-green-600" />
                  Careers Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatNumber(data.careers.totalApplications)}
                    </p>
                    <p className="text-sm text-muted-foreground">Aplicaciones</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {data.careers.totalJobs}
                    </p>
                    <p className="text-sm text-muted-foreground">Empleos Activos</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Tiempo promedio de contratación</span>
                    <span className="font-medium">{data.careers.averageTimeToHire} días</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Tasa de aplicación</span>
                    <span className="font-medium">{formatPercentage(data.careers.applicationRate)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Candidatos calificados</span>
                    <span className="font-medium">
                      {formatPercentage(data.careers.candidateMetrics.qualifiedRate)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Blog Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.blog.topArticles.slice(0, 5).map((article, index) => (
                    <div key={article.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">
                            {article.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(article.views)} views
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {article.engagement}% engagement
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Job Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.careers.topJobs.slice(0, 5).map((job, index) => (
                    <div key={job.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">
                            {job.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {job.department} • {formatNumber(job.views)} views
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {job.applications} aplicaciones
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blog" className="space-y-6">
          {/* Blog-specific metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Page Views</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(data.blog.totalViews)}</p>
                <p className="text-xs text-muted-foreground">+15.2% vs último mes</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Avg. Read Time</span>
                </div>
                <p className="text-2xl font-bold">{data.blog.averageReadingTime}m</p>
                <p className="text-xs text-muted-foreground">+0.3m vs último mes</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Comments</span>
                </div>
                <p className="text-2xl font-bold">{data.blog.totalComments}</p>
                <p className="text-xs text-muted-foreground">+8.7% vs último mes</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-cyan-600" />
                  <span className="font-medium">Unique Readers</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(data.blog.readerEngagement.totalReaders)}</p>
                <p className="text-xs text-muted-foreground">+12.4% vs último mes</p>
              </CardContent>
            </Card>
          </div>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.blog.categoryStats.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.category}</span>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{category.articles} artículos</span>
                        <span>{formatNumber(category.views)} views</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(category.views / data.blog.totalViews) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="careers" className="space-y-6">
          {/* Careers-specific metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Applications</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(data.careers.totalApplications)}</p>
                <p className="text-xs text-muted-foreground">+23.1% vs último mes</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Time to Hire</span>
                </div>
                <p className="text-2xl font-bold">{data.careers.averageTimeToHire}d</p>
                <p className="text-xs text-muted-foreground">-3.2d vs último mes</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Qualified Rate</span>
                </div>
                <p className="text-2xl font-bold">{formatPercentage(data.careers.candidateMetrics.qualifiedRate)}</p>
                <p className="text-xs text-muted-foreground">+2.3% vs último mes</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-cyan-600" />
                  <span className="font-medium">Avg Experience</span>
                </div>
                <p className="text-2xl font-bold">{data.careers.candidateMetrics.averageExperience}y</p>
                <p className="text-xs text-muted-foreground">+0.2y vs último mes</p>
              </CardContent>
            </Card>
          </div>

          {/* Department Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance por Departamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.careers.departmentStats.map((dept) => (
                    <div key={dept.department} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{dept.department}</span>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{dept.jobs} empleos</span>
                          <span>{dept.applications} aplicaciones</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(dept.applications / data.careers.totalApplications) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Skills en Demanda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.careers.candidateMetrics.topSkills.map((skill, index) => (
                    <div key={skill.skill} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium text-sm">{skill.skill}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-cyan-600 h-1.5 rounded-full"
                            style={{ width: `${skill.demand}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {skill.demand}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}