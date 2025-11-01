'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  Award, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  Star,
  Brain,
  Zap,
  BarChart3,
  ArrowRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import { JobPosting } from '@/types/careers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified?: boolean;
}

interface UserProfile {
  skills: Skill[];
  experience: number;
  location: string;
  preferences: {
    remote: boolean;
    salaryMin: number;
    categories: string[];
    jobTypes: string[];
  };
  cv?: {
    education: string[];
    certifications: string[];
    previousJobs: string[];
  };
}

interface JobMatch {
  job: JobPosting;
  score: number;
  reasons: string[];
  gaps: string[];
  strengths: string[];
}

interface JobMatchingProps {
  jobs: JobPosting[];
  userProfile?: UserProfile;
  onProfileUpdate?: (profile: UserProfile) => void;
  className?: string;
}

export default function JobMatching({ 
  jobs, 
  userProfile: initialProfile,
  onProfileUpdate,
  className 
}: JobMatchingProps) {
  const [userProfile, setUserProfile] = useState<UserProfile>(initialProfile || {
    skills: [],
    experience: 0,
    location: '',
    preferences: {
      remote: false,
      salaryMin: 0,
      categories: [],
      jobTypes: []
    }
  });

  const [isEditingProfile, setIsEditingProfile] = useState(!initialProfile);
  const [newSkill, setNewSkill] = useState('');
  const [selectedTab, setSelectedTab] = useState('matches');

  // Load user profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('metrica-user-profile');
    if (saved && !initialProfile) {
      try {
        const parsed = JSON.parse(saved);
        setUserProfile(parsed);
        setIsEditingProfile(false);
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    }
  }, [initialProfile]);

  // Save profile changes
  useEffect(() => {
    localStorage.setItem('metrica-user-profile', JSON.stringify(userProfile));
    onProfileUpdate?.(userProfile);
  }, [userProfile, onProfileUpdate]);

  // Calculate job matches
  const jobMatches = useMemo(() => {
    if (!userProfile.skills.length && !userProfile.experience) {
      return jobs.map(job => ({
        job,
        score: Math.random() * 60 + 20, // Random baseline score
        reasons: ['Posición disponible', 'Empresa líder'],
        gaps: ['Completa tu perfil para un mejor análisis'],
        strengths: ['Oportunidad de crecimiento']
      }));
    }

    return jobs.map(job => {
      let score = 0;
      const reasons: string[] = [];
      const gaps: string[] = [];
      const strengths: string[] = [];

      // Skill matching
      const userSkillNames = userProfile.skills.map(s => s.name.toLowerCase());
      const jobRequirements = job.requirements.map(r => r.title.toLowerCase());
      
      const skillMatches = jobRequirements.filter(req => 
        userSkillNames.some(skill => 
          skill.includes(req) || req.includes(skill)
        )
      ).length;

      const skillMatchPercentage = jobRequirements.length > 0 
        ? (skillMatches / jobRequirements.length) * 100 
        : 50;
      
      score += skillMatchPercentage * 0.4;

      if (skillMatchPercentage > 70) {
        strengths.push(`${skillMatches} de ${jobRequirements.length} skills requeridas`);
        reasons.push('Alta compatibilidad de habilidades');
      } else if (skillMatchPercentage < 30) {
        gaps.push(`Te faltan ${jobRequirements.length - skillMatches} skills clave`);
      }

      // Experience matching
      const expMatch = Math.max(0, 100 - Math.abs(userProfile.experience - job.experience) * 10);
      score += expMatch * 0.25;

      if (userProfile.experience >= job.experience) {
        strengths.push('Experiencia suficiente');
        reasons.push('Cumples con la experiencia requerida');
      } else {
        const yearsDiff = job.experience - userProfile.experience;
        if (yearsDiff <= 1) {
          reasons.push('Experiencia casi suficiente');
        } else {
          gaps.push(`Te faltan ${yearsDiff} años de experiencia`);
        }
      }

      // Location matching
      if (userProfile.location) {
        const jobLocation = typeof job.location === 'string' 
          ? job.location 
          : job.location.city;
        
        if (jobLocation.toLowerCase().includes(userProfile.location.toLowerCase()) ||
            userProfile.location.toLowerCase().includes(jobLocation.toLowerCase())) {
          score += 15;
          strengths.push('Ubicación compatible');
        } else if (job.location && typeof job.location === 'object' && job.location.remote) {
          score += 10;
          reasons.push('Trabajo remoto disponible');
        } else {
          gaps.push('Ubicación diferente');
        }
      }

      // Preferences matching
      if (userProfile.preferences.categories.includes(job.category)) {
        score += 10;
        reasons.push('Categoría de tu interés');
      }

      if (userProfile.preferences.jobTypes.includes(job.type)) {
        score += 5;
        reasons.push('Tipo de contrato preferido');
      }

      if (userProfile.preferences.remote && job.location && 
          typeof job.location === 'object' && job.location.remote) {
        score += 10;
        reasons.push('Trabajo remoto disponible');
      }

      // Salary matching
      if (job.salary && userProfile.preferences.salaryMin > 0) {
        const avgSalary = (job.salary.min + job.salary.max) / 2;
        if (avgSalary >= userProfile.preferences.salaryMin) {
          score += 10;
          reasons.push('Salario acorde a expectativas');
        } else {
          gaps.push('Salario por debajo de expectativas');
        }
      }

      // Job features bonus
      if (job.featured) {
        score += 5;
        reasons.push('Posición destacada');
      }

      if (job.urgent) {
        score += 3;
        reasons.push('Contratación urgente');
      }

      // Ensure score is within bounds
      score = Math.max(0, Math.min(100, score));

      return {
        job,
        score: Math.round(score),
        reasons,
        gaps,
        strengths
      };
    }).sort((a, b) => b.score - a.score);
  }, [jobs, userProfile]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente Match';
    if (score >= 60) return 'Buen Match';
    if (score >= 40) return 'Match Parcial';
    return 'Match Bajo';
  };

  const addSkill = () => {
    if (newSkill.trim() && !userProfile.skills.some(s => 
      s.name.toLowerCase() === newSkill.toLowerCase()
    )) {
      setUserProfile(prev => ({
        ...prev,
        skills: [...prev.skills, {
          name: newSkill.trim(),
          level: 'intermediate'
        }]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillName: string) => {
    setUserProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.name !== skillName)
    }));
  };

  const topMatches = jobMatches.slice(0, 3);
  const averageScore = jobMatches.length > 0 
    ? jobMatches.reduce((acc, match) => acc + match.score, 0) / jobMatches.length 
    : 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Job Matching Inteligente
            </h2>
            <p className="text-muted-foreground">
              Encuentra las oportunidades perfectas para ti
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setIsEditingProfile(true)}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar Perfil
        </Button>
      </div>

      {/* Profile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Match Promedio</p>
                <p className="text-xl font-bold">{Math.round(averageScore)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Top Matches</p>
                <p className="text-xl font-bold">{jobMatches.filter(m => m.score >= 70).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Skills</p>
                <p className="text-xl font-bold">{userProfile.skills.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-600" />
              <div>
                <p className="text-sm text-muted-foreground">Experiencia</p>
                <p className="text-xl font-bold">{userProfile.experience} años</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matches">Matches ({jobMatches.length})</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-4">
          {jobMatches.length === 0 ? (
            <Card className="p-8 text-center">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Sin matches disponibles</h3>
              <p className="text-muted-foreground mb-4">
                Completa tu perfil para encontrar mejores oportunidades
              </p>
              <Button onClick={() => setSelectedTab('profile')}>
                Completar Perfil
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobMatches.map((match, index) => (
                <motion.div
                  key={match.job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    "hover:shadow-lg transition-all duration-300",
                    match.score >= 80 && "border-green-200 bg-green-50/50",
                    match.score >= 60 && match.score < 80 && "border-yellow-200 bg-yellow-50/50"
                  )}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{match.job.title}</h3>
                            {match.job.featured && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            {match.job.urgent && (
                              <Badge variant="destructive" className="text-xs">
                                Urgente
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {match.job.department} • {typeof match.job.location === 'string' 
                              ? match.job.location 
                              : match.job.location.city}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className={cn("text-2xl font-bold mb-1", getScoreColor(match.score))}>
                            {match.score}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getScoreLabel(match.score)}
                          </div>
                        </div>
                      </div>

                      <Progress value={match.score} className="mb-4" />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Strengths */}
                        {match.strengths.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Fortalezas
                            </h4>
                            <ul className="text-xs space-y-1">
                              {match.strengths.slice(0, 2).map((strength, i) => (
                                <li key={i} className="text-green-600">• {strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Reasons */}
                        {match.reasons.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-blue-600 mb-2 flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              Por qué encajas
                            </h4>
                            <ul className="text-xs space-y-1">
                              {match.reasons.slice(0, 2).map((reason, i) => (
                                <li key={i} className="text-blue-600">• {reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Gaps */}
                        {match.gaps.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-cyan-600 mb-2 flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Áreas a mejorar
                            </h4>
                            <ul className="text-xs space-y-1">
                              {match.gaps.slice(0, 2).map((gap, i) => (
                                <li key={i} className="text-cyan-600">• {gap}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {match.job.salary && (
                            <Badge variant="outline">
                              S/ {match.job.salary.min}K - {match.job.salary.max}K
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {match.job.experience} años exp.
                          </Badge>
                        </div>

                        <Link href={`/careers/job/${match.job.id}`}>
                          <Button size="sm" className="gap-2">
                            Ver Detalles
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Recomendaciones para Mejorar tu Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userProfile.skills.length < 5 && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">
                      Agrega más habilidades
                    </h4>
                    <p className="text-sm text-blue-700">
                      Tener al menos 5 habilidades mejora tus matches en un 40%
                    </p>
                  </div>
                </div>
              )}

              {!userProfile.location && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Target className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">
                      Especifica tu ubicación
                    </h4>
                    <p className="text-sm text-green-700">
                      Encontraremos oportunidades cerca de ti o remotas
                    </p>
                  </div>
                </div>
              )}

              {userProfile.preferences.categories.length === 0 && (
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <Filter className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900 mb-1">
                      Define tus preferencias
                    </h4>
                    <p className="text-sm text-purple-700">
                      Selecciona las áreas que más te interesan para mejores matches
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Skills in Demand */}
          <Card>
            <CardHeader>
              <CardTitle>Skills más Demandadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['React', 'Python', 'AWS', 'Docker', 'Node.js', 'PostgreSQL', 'Git', 'Agile'].map(skill => (
                  <div key={skill} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{skill}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setNewSkill(skill)}
                      className="h-6 px-2 text-xs"
                    >
                      +
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil Profesional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Años de Experiencia
                  </label>
                  <Input
                    type="number"
                    value={userProfile.experience}
                    onChange={(e) => setUserProfile(prev => ({
                      ...prev,
                      experience: parseInt(e.target.value) || 0
                    }))}
                    min="0"
                    max="50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Ubicación
                  </label>
                  <Input
                    value={userProfile.location}
                    onChange={(e) => setUserProfile(prev => ({
                      ...prev,
                      location: e.target.value
                    }))}
                    placeholder="Lima, Perú"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Habilidades Técnicas
                </label>
                
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Agregar habilidad..."
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill} disabled={!newSkill.trim()}>
                    Agregar
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {userProfile.skills.map(skill => (
                    <Badge
                      key={skill.name}
                      variant="secondary"
                      className="gap-2 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeSkill(skill.name)}
                    >
                      {skill.name}
                      <XCircle className="w-3 h-3" />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Salario Mínimo Esperado (Mensual)
                </label>
                <Input
                  type="number"
                  value={userProfile.preferences.salaryMin}
                  onChange={(e) => setUserProfile(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      salaryMin: parseInt(e.target.value) || 0
                    }
                  }))}
                  placeholder="5000"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remote"
                  checked={userProfile.preferences.remote}
                  onChange={(e) => setUserProfile(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      remote: e.target.checked
                    }
                  }))}
                />
                <label htmlFor="remote" className="text-sm font-medium">
                  Prefiero trabajo remoto
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}