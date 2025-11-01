'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Target,
  Calendar,
  DollarSign,
  Users,
  BookOpen,
  Award,
  ChevronRight,
  ChevronDown,
  Star,
  Clock,
  MapPin,
  Briefcase,
  GraduationCap,
  Zap,
  LineChart,
  User,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface CareerStep {
  id: string;
  title: string;
  level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'director' | 'executive';
  department: string;
  timeframe: string;
  salaryRange: { min: number; max: number; currency: string };
  requiredSkills: string[];
  responsibilities: string[];
  growth: {
    probability: number;
    averageTime: string;
    successFactors: string[];
  };
  education?: {
    required: string;
    preferred?: string;
    certifications?: string[];
  };
  locations: string[];
  isCurrentPosition?: boolean;
  isTargetPosition?: boolean;
  connections: string[]; // IDs of connected career steps
}

interface CareerPathData {
  id: string;
  title: string;
  description: string;
  totalDuration: string;
  steps: CareerStep[];
  pathType: 'technical' | 'management' | 'hybrid' | 'specialized';
  industryFocus: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  marketDemand: number; // 0-100
  futureOutlook: 'growing' | 'stable' | 'declining';
}

interface CareerPathVisualizationProps {
  careerPaths: CareerPathData[];
  currentUserProfile?: {
    currentLevel: string;
    experience: number;
    skills: string[];
    interests: string[];
  };
  onPathSelect?: (pathId: string) => void;
  onStepDetails?: (stepId: string) => void;
  className?: string;
}

const LEVEL_COLORS = {
  entry: 'bg-green-100 text-green-700 border-green-200',
  junior: 'bg-blue-100 text-blue-700 border-blue-200',
  mid: 'bg-purple-100 text-purple-700 border-purple-200',
  senior: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  lead: 'bg-red-100 text-red-700 border-red-200',
  director: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  executive: 'bg-gray-100 text-gray-700 border-gray-200'
};

const LEVEL_HEIGHTS = {
  entry: 1,
  junior: 2,
  mid: 3,
  senior: 4,
  lead: 5,
  director: 6,
  executive: 7
};

const PATH_TYPE_ICONS = {
  technical: <BookOpen className="w-4 h-4" />,
  management: <Users className="w-4 h-4" />,
  hybrid: <Zap className="w-4 h-4" />,
  specialized: <Target className="w-4 h-4" />
};

export default function CareerPathVisualization({
  careerPaths,
  currentUserProfile,
  onPathSelect,
  onStepDetails,
  className
}: CareerPathVisualizationProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // Auto-select most relevant path for user
  useEffect(() => {
    if (currentUserProfile && careerPaths.length > 0 && !selectedPath) {
      const recommendedPath = findBestPathForUser(currentUserProfile, careerPaths);
      if (recommendedPath) {
        setSelectedPath(recommendedPath.id);
      }
    }
  }, [currentUserProfile, careerPaths, selectedPath]);

  const findBestPathForUser = (profile: NonNullable<typeof currentUserProfile>, paths: CareerPathData[]) => {
    return paths.reduce((best, path) => {
      const score = calculatePathRelevanceScore(profile, path);
      const bestScore = best ? calculatePathRelevanceScore(profile, best) : 0;
      return score > bestScore ? path : best;
    }, null as CareerPathData | null);
  };

  const calculatePathRelevanceScore = (profile: NonNullable<typeof currentUserProfile>, path: CareerPathData): number => {
    let score = 0;
    
    // Experience level match
    const userLevel = profile.experience < 2 ? 'entry' : 
                     profile.experience < 5 ? 'junior' : 
                     profile.experience < 10 ? 'mid' : 'senior';
    
    const hasMatchingLevel = path.steps.some(step => step.level === userLevel);
    if (hasMatchingLevel) score += 30;
    
    // Skills match
    const skillMatches = profile.skills.filter(skill =>
      path.steps.some(step => step.requiredSkills.some(reqSkill =>
        reqSkill.toLowerCase().includes(skill.toLowerCase())
      ))
    ).length;
    score += (skillMatches / Math.max(profile.skills.length, 1)) * 40;
    
    // Interest alignment
    const interestMatches = profile.interests.filter(interest =>
      path.industryFocus.some(focus => focus.toLowerCase().includes(interest.toLowerCase())) ||
      path.title.toLowerCase().includes(interest.toLowerCase())
    ).length;
    score += (interestMatches / Math.max(profile.interests.length, 1)) * 30;
    
    return score;
  };

  const selectedPathData = useMemo(() => 
    careerPaths.find(path => path.id === selectedPath),
    [careerPaths, selectedPath]
  );

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const formatSalary = (range: { min: number; max: number; currency: string }) => {
    const formatter = new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: range.currency || 'PEN'
    });
    return `${formatter.format(range.min)} - ${formatter.format(range.max)}`;
  };

  const PathOverviewCard = ({ path }: { path: CareerPathData }) => (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg",
        selectedPath === path.id && "ring-2 ring-primary border-primary",
        "group"
      )}
      onClick={() => {
        setSelectedPath(path.id);
        onPathSelect?.(path.id);
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {PATH_TYPE_ICONS[path.pathType]}
            <CardTitle className="text-lg">{path.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn(
              path.marketDemand > 70 ? "bg-green-50 text-green-700" :
              path.marketDemand > 40 ? "bg-yellow-50 text-yellow-700" :
              "bg-red-50 text-red-700"
            )}>
              {path.marketDemand}% demanda
            </Badge>
            <TrendingUp className={cn(
              "w-4 h-4",
              path.futureOutlook === 'growing' ? "text-green-600" :
              path.futureOutlook === 'stable' ? "text-yellow-600" :
              "text-red-600"
            )} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{path.description}</p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Duración: {path.totalDuration}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>{path.steps.length} etapas</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {path.industryFocus.slice(0, 3).map(industry => (
              <Badge key={industry} variant="secondary" className="text-xs">
                {industry}
              </Badge>
            ))}
            {path.industryFocus.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{path.industryFocus.length - 3}
              </Badge>
            )}
          </div>

          {currentUserProfile && (
            <div className="mt-3 p-2 bg-muted/30 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Relevancia para ti:</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={calculatePathRelevanceScore(currentUserProfile, path)} 
                    className="w-20 h-2" 
                  />
                  <span className="text-xs font-medium">
                    {Math.round(calculatePathRelevanceScore(currentUserProfile, path))}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const PathTimelineView = ({ path }: { path: CareerPathData }) => (
    <div className="space-y-6">
      {/* Path Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {PATH_TYPE_ICONS[path.pathType]}
                {path.title}
              </CardTitle>
              <p className="text-muted-foreground mt-2">{path.description}</p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm text-muted-foreground">Duración total</div>
              <div className="text-xl font-semibold">{path.totalDuration}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Career Steps Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-border"></div>
        
        {path.steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative mb-6"
          >
            {/* Timeline Node */}
            <div className="absolute left-6 w-4 h-4 bg-background border-2 border-primary rounded-full z-10">
              {step.isCurrentPosition && (
                <div className="absolute inset-1 bg-primary rounded-full"></div>
              )}
            </div>
            
            {/* Step Card */}
            <Card className={cn(
              "ml-16 transition-all duration-200",
              expandedSteps.has(step.id) && "shadow-lg",
              step.isCurrentPosition && "ring-2 ring-primary",
              step.isTargetPosition && "ring-2 ring-orange-400"
            )}>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleStepExpansion(step.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{step.title}</CardTitle>
                      <Badge className={LEVEL_COLORS[step.level]}>
                        {step.level}
                      </Badge>
                      {step.isCurrentPosition && (
                        <Badge variant="default" className="bg-primary text-primary-foreground">
                          Posición actual
                        </Badge>
                      )}
                      {step.isTargetPosition && (
                        <Badge variant="default" className="bg-cyan-500 text-white">
                          Meta
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {step.department}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {step.timeframe}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatSalary(step.salaryRange)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Probabilidad</div>
                      <div className="text-sm font-medium text-green-600">
                        {Math.round(step.growth.probability * 100)}%
                      </div>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform",
                      expandedSteps.has(step.id) && "rotate-180"
                    )} />
                  </div>
                </div>
              </CardHeader>

              <AnimatePresence>
                {expandedSteps.has(step.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <CardContent className="pt-0">
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="skills">Skills</TabsTrigger>
                          <TabsTrigger value="growth">Crecimiento</TabsTrigger>
                          <TabsTrigger value="education">Educación</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview" className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Responsabilidades principales</h4>
                            <ul className="space-y-1">
                              {step.responsibilities.map((resp, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  {resp}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {step.locations.map(location => (
                              <Badge key={location} variant="outline" className="text-xs">
                                <MapPin className="w-3 h-3 mr-1" />
                                {location}
                              </Badge>
                            ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="skills" className="space-y-3">
                          <div>
                            <h4 className="font-medium mb-2">Habilidades requeridas</h4>
                            <div className="flex flex-wrap gap-2">
                              {step.requiredSkills.map(skill => (
                                <Badge 
                                  key={skill} 
                                  variant="outline"
                                  className={cn(
                                    currentUserProfile?.skills.includes(skill) && 
                                    "bg-green-50 text-green-700 border-green-200"
                                  )}
                                >
                                  {skill}
                                  {currentUserProfile?.skills.includes(skill) && (
                                    <Star className="w-3 h-3 ml-1 fill-current" />
                                  )}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {currentUserProfile && (
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Compatibilidad de skills</span>
                                <span className="text-sm text-muted-foreground">
                                  {Math.round((currentUserProfile.skills.filter(skill => 
                                    step.requiredSkills.includes(skill)
                                  ).length / step.requiredSkills.length) * 100)}%
                                </span>
                              </div>
                              <Progress 
                                value={(currentUserProfile.skills.filter(skill => 
                                  step.requiredSkills.includes(skill)
                                ).length / step.requiredSkills.length) * 100}
                                className="h-2"
                              />
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="growth" className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Tiempo promedio</div>
                              <div className="font-medium">{step.growth.averageTime}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Probabilidad de éxito</div>
                              <div className="font-medium text-green-600">
                                {Math.round(step.growth.probability * 100)}%
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Factores de éxito</h4>
                            <ul className="space-y-1">
                              {step.growth.successFactors.map((factor, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <Award className="w-3 h-3 mt-0.5 flex-shrink-0 text-yellow-500" />
                                  {factor}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="education" className="space-y-3">
                          {step.education && (
                            <>
                              <div>
                                <div className="text-sm text-muted-foreground">Educación requerida</div>
                                <div className="font-medium">{step.education.required}</div>
                              </div>
                              
                              {step.education.preferred && (
                                <div>
                                  <div className="text-sm text-muted-foreground">Preferida</div>
                                  <div className="font-medium">{step.education.preferred}</div>
                                </div>
                              )}
                              
                              {step.education.certifications && (
                                <div>
                                  <div className="text-sm text-muted-foreground mb-2">Certificaciones</div>
                                  <div className="flex flex-wrap gap-2">
                                    {step.education.certifications.map(cert => (
                                      <Badge key={cert} variant="outline">
                                        <GraduationCap className="w-3 h-3 mr-1" />
                                        {cert}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </TabsContent>
                      </Tabs>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          onClick={() => onStepDetails?.(step.id)}
                        >
                          Ver detalles completos
                        </Button>
                        {step.connections.length > 0 && (
                          <Button size="sm" variant="outline">
                            Ver rutas alternativas ({step.connections.length})
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* View Mode Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rutas de Carrera</h2>
          <p className="text-muted-foreground">
            Explora diferentes caminos profesionales en construcción e infraestructura
          </p>
        </div>
        
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as typeof viewMode)}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detallado</TabsTrigger>
            <TabsTrigger value="comparison">Comparar</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {careerPaths.map(path => (
              <PathOverviewCard key={path.id} path={path} />
            ))}
          </motion.div>
        )}

        {viewMode === 'detailed' && selectedPathData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PathTimelineView path={selectedPathData} />
          </motion.div>
        )}

        {viewMode === 'comparison' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <LineChart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Comparación de Rutas</h3>
            <p className="text-muted-foreground mb-4">
              Selecciona hasta 3 rutas de carrera para compararlas lado a lado
            </p>
            <Button variant="outline">
              Próximamente
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}