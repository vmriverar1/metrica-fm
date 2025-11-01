'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Navigation,
  Eye,
  Users,
  Building,
  Coffee,
  Laptop,
  Briefcase,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Camera,
  MapPin,
  Headphones,
  Star,
  Target,
  BookOpen,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';

interface VirtualTourStop {
  id: string;
  title: string;
  description: string;
  location: { x: number; y: number }; // Percentage coordinates
  mediaUrl: string;
  mediaType: '360-image' | '360-video' | 'video' | 'image';
  duration?: number; // For videos in seconds
  interactivePoints?: Array<{
    id: string;
    position: { x: number; y: number };
    title: string;
    content: string;
    type: 'info' | 'person' | 'equipment' | 'process';
  }>;
  highlights: string[];
  nextStops: string[];
}

interface VirtualTour {
  id: string;
  title: string;
  description: string;
  category: 'office' | 'project-site' | 'facilities' | 'team';
  estimatedDuration: number; // Minutes
  stops: VirtualTourStop[];
  thumbnailUrl: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
}

interface AssessmentQuestion {
  id: string;
  type: 'multiple-choice' | 'scenario' | 'practical' | 'interactive';
  question: string;
  context?: string; // Background info or scenario
  mediaUrl?: string; // Image, video, or 3D model
  options?: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }>;
  scenarioData?: {
    situation: string;
    challenges: string[];
    resources: string[];
    constraints: string[];
  };
  correctAnswer?: string;
  points: number;
  timeLimit?: number; // Seconds
  hints?: string[];
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'leadership' | 'safety' | 'project-management';
  jobRole: string;
  level: 'entry' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: number; // Minutes
  passingScore: number; // Percentage
  questions: AssessmentQuestion[];
  certificateAwarded?: string;
}

interface AssessmentResult {
  assessmentId: string;
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  answers: Record<string, any>;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  completedAt: Date;
}

interface VirtualTourProps {
  tours: VirtualTour[];
  assessments: Assessment[];
  onTourComplete?: (tourId: string, timeSpent: number) => void;
  onAssessmentComplete?: (result: AssessmentResult) => void;
  className?: string;
}

const MEDIA_CONTROLS = {
  360: ['rotate', 'zoom', 'info'],
  video: ['play', 'pause', 'seek', 'volume', 'fullscreen'],
  image: ['zoom', 'pan', 'info']
};

export default function VirtualOfficeToursAndAssessments({
  tours,
  assessments,
  onTourComplete,
  onAssessmentComplete,
  className
}: VirtualTourProps) {
  // Tour State
  const [activeMode, setActiveMode] = useState<'tours' | 'assessments' | null>(null);
  const [selectedTour, setSelectedTour] = useState<VirtualTour | null>(null);
  const [currentStop, setCurrentStop] = useState<number>(0);
  const [tourStartTime, setTourStartTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedInteractivePoint, setSelectedInteractivePoint] = useState<string | null>(null);

  // Assessment State
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [assessmentStartTime, setAssessmentStartTime] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const analytics = useAdvancedAnalytics('careers');

  // Tour Functions
  const startTour = useCallback((tour: VirtualTour) => {
    setSelectedTour(tour);
    setCurrentStop(0);
    setTourStartTime(Date.now());
    setActiveMode('tours');

    analytics.trackEvent('virtual_tour_started', {
      tourId: tour.id,
      category: tour.category,
      estimatedDuration: tour.estimatedDuration
    });
  }, [analytics]);

  const navigateToStop = useCallback((stopIndex: number) => {
    if (!selectedTour || stopIndex < 0 || stopIndex >= selectedTour.stops.length) return;
    
    setCurrentStop(stopIndex);
    setSelectedInteractivePoint(null);

    analytics.trackEvent('tour_stop_visited', {
      tourId: selectedTour.id,
      stopId: selectedTour.stops[stopIndex].id,
      stopIndex
    });
  }, [selectedTour, analytics]);

  const completeTour = useCallback(() => {
    if (!selectedTour) return;

    const timeSpent = Math.round((Date.now() - tourStartTime) / 1000);
    
    analytics.trackEvent('virtual_tour_completed', {
      tourId: selectedTour.id,
      timeSpent,
      stopsVisited: currentStop + 1,
      totalStops: selectedTour.stops.length
    });

    onTourComplete?.(selectedTour.id, timeSpent);
    setSelectedTour(null);
    setActiveMode(null);
  }, [selectedTour, tourStartTime, currentStop, onTourComplete, analytics]);

  // Assessment Functions
  const startAssessment = useCallback((assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setCurrentQuestion(0);
    setAssessmentStartTime(Date.now());
    setUserAnswers({});
    setShowResults(false);
    setActiveMode('assessments');

    analytics.trackEvent('assessment_started', {
      assessmentId: assessment.id,
      category: assessment.category,
      level: assessment.level
    });
  }, [analytics]);

  const submitAnswer = useCallback((questionId: string, answer: any) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    analytics.trackEvent('assessment_question_answered', {
      assessmentId: selectedAssessment?.id,
      questionId,
      questionIndex: currentQuestion
    });
  }, [selectedAssessment, currentQuestion, analytics]);

  const completeAssessment = useCallback(() => {
    if (!selectedAssessment) return;

    const timeSpent = Math.round((Date.now() - assessmentStartTime) / 1000 / 60); // Minutes
    let totalScore = 0;
    let maxScore = 0;

    const answersWithResults = selectedAssessment.questions.map(question => {
      const userAnswer = userAnswers[question.id];
      let isCorrect = false;
      let earnedPoints = 0;

      maxScore += question.points;

      if (question.type === 'multiple-choice' && question.options) {
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = userAnswer === correctOption?.id;
        earnedPoints = isCorrect ? question.points : 0;
      } else if (question.type === 'practical') {
        // Simplified scoring for practical questions
        earnedPoints = question.points * 0.7; // Assume 70% for demo
        isCorrect = true;
      }

      totalScore += earnedPoints;
      return { questionId: question.id, userAnswer, isCorrect, earnedPoints };
    });

    const percentage = Math.round((totalScore / maxScore) * 100);
    const passed = percentage >= selectedAssessment.passingScore;

    // Generate feedback
    const strengths: string[] = [];
    const improvements: string[] = [];
    const recommendations: string[] = [];

    if (percentage >= 90) {
      strengths.push('Excelente dominio técnico');
      recommendations.push('Considera roles de liderazgo técnico');
    } else if (percentage >= 75) {
      strengths.push('Buena comprensión de conceptos');
      improvements.push('Refinar habilidades específicas');
    } else if (percentage >= 60) {
      improvements.push('Revisar fundamentos teóricos');
      recommendations.push('Práctica adicional recomendada');
    } else {
      improvements.push('Capacitación intensiva necesaria');
      recommendations.push('Considerar cursos preparatorios');
    }

    const result: AssessmentResult = {
      assessmentId: selectedAssessment.id,
      score: totalScore,
      percentage,
      passed,
      timeSpent,
      answers: userAnswers,
      strengths,
      improvements,
      recommendations,
      completedAt: new Date()
    };

    setAssessmentResult(result);
    setShowResults(true);

    analytics.trackEvent('assessment_completed', {
      assessmentId: selectedAssessment.id,
      score: totalScore,
      percentage,
      passed,
      timeSpent
    });

    onAssessmentComplete?.(result);
  }, [selectedAssessment, assessmentStartTime, userAnswers, onAssessmentComplete, analytics]);

  // Media Controls
  const togglePlayPause = useCallback(() => {
    if (mediaRef.current && 'play' in mediaRef.current) {
      const video = mediaRef.current as HTMLVideoElement;
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Main Render
  if (!activeMode) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Experiencia Virtual Métrica FM</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explora nuestras oficinas y proyectos a través de tours virtuales inmersivos, 
            y evalúa tus habilidades con assessments interactivos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Virtual Tours Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Tours Virtuales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {tours.slice(0, 3).map(tour => (
                  <div
                    key={tour.id}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => startTour(tour)}
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <img
                        src={tour.thumbnailUrl}
                        alt={tour.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{tour.title}</h4>
                      <p className="text-sm text-muted-foreground">{tour.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {tour.estimatedDuration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {tour.stops.length} paradas
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setActiveMode('tours')}
              >
                Ver todos los tours
              </Button>
            </CardContent>
          </Card>

          {/* Assessments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Evaluaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {assessments.slice(0, 3).map(assessment => (
                  <div
                    key={assessment.id}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => startAssessment(assessment)}
                  >
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      {assessment.category === 'technical' && <BookOpen className="w-6 h-6 text-primary" />}
                      {assessment.category === 'leadership' && <Users className="w-6 h-6 text-primary" />}
                      {assessment.category === 'safety' && <Award className="w-6 h-6 text-primary" />}
                      {assessment.category === 'project-management' && <Briefcase className="w-6 h-6 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{assessment.title}</h4>
                      <p className="text-sm text-muted-foreground">{assessment.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {assessment.estimatedTime} min
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {assessment.level}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setActiveMode('assessments')}
              >
                Ver todas las evaluaciones
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Tour Mode
  if (activeMode === 'tours' && selectedTour) {
    const currentStopData = selectedTour.stops[currentStop];
    
    return (
      <div ref={containerRef} className={cn("space-y-4", className)}>
        {/* Tour Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{selectedTour.title}</h2>
            <p className="text-muted-foreground">{currentStopData.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentStop + 1} de {selectedTour.stops.length}
            </span>
            <Button variant="outline" size="sm" onClick={() => setSelectedTour(null)}>
              Salir del tour
            </Button>
          </div>
        </div>

        {/* Media Viewer */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {currentStopData.mediaType === 'video' ? (
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={currentStopData.mediaUrl}
              className="w-full h-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : (
            <img
              ref={mediaRef as React.RefObject<HTMLImageElement>}
              src={currentStopData.mediaUrl}
              alt={currentStopData.title}
              className="w-full h-full object-cover"
            />
          )}

          {/* Interactive Points */}
          {currentStopData.interactivePoints?.map(point => (
            <div
              key={point.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: `${point.position.x}%`,
                top: `${point.position.y}%`
              }}
              onClick={() => setSelectedInteractivePoint(
                selectedInteractivePoint === point.id ? null : point.id
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full border-2 border-white bg-primary animate-pulse",
                selectedInteractivePoint === point.id && "bg-primary/80 animate-none scale-110"
              )}>
                <div className="w-full h-full rounded-full bg-white/30"></div>
              </div>
              
              <AnimatePresence>
                {selectedInteractivePoint === point.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg p-3 shadow-lg max-w-xs z-10"
                  >
                    <h4 className="font-medium mb-1">{point.title}</h4>
                    <p className="text-sm text-muted-foreground">{point.content}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Media Controls */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between bg-black/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                {currentStopData.mediaType === 'video' && (
                  <>
                    <Button size="sm" variant="ghost" onClick={togglePlayPause}>
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setVolume(volume > 0 ? 0 : 1)}
                    >
                      {volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </Button>
                  </>
                )}
                <Button size="sm" variant="ghost">
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tour Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigateToStop(currentStop - 1)}
            disabled={currentStop === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          
          <div className="flex items-center gap-2">
            {selectedTour.stops.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  index === currentStop ? "bg-primary" : "bg-muted",
                  index < currentStop && "bg-green-500"
                )}
                onClick={() => navigateToStop(index)}
              />
            ))}
          </div>

          {currentStop === selectedTour.stops.length - 1 ? (
            <Button onClick={completeTour}>
              Completar tour
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => navigateToStop(currentStop + 1)}>
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Stop Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">{currentStopData.title}</h3>
            <p className="text-muted-foreground mb-4">{currentStopData.description}</p>
            
            {currentStopData.highlights.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Puntos destacados:</h4>
                <ul className="space-y-1">
                  {currentStopData.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Assessment Mode
  if (activeMode === 'assessments' && selectedAssessment && !showResults) {
    const currentQuestionData = selectedAssessment.questions[currentQuestion];
    
    return (
      <div className={cn("space-y-6", className)}>
        {/* Assessment Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{selectedAssessment.title}</h2>
            <p className="text-muted-foreground">
              Pregunta {currentQuestion + 1} de {selectedAssessment.questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Progress 
              value={((currentQuestion + 1) / selectedAssessment.questions.length) * 100} 
              className="w-32"
            />
            <Button variant="outline" size="sm" onClick={() => setSelectedAssessment(null)}>
              Salir
            </Button>
          </div>
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pregunta {currentQuestion + 1}</span>
              <Badge variant="outline">
                {currentQuestionData.points} {currentQuestionData.points === 1 ? 'punto' : 'puntos'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestionData.context && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm">{currentQuestionData.context}</p>
              </div>
            )}
            
            <h3 className="text-lg font-medium">{currentQuestionData.question}</h3>
            
            {currentQuestionData.mediaUrl && (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={currentQuestionData.mediaUrl}
                  alt="Question media"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Multiple Choice Options */}
            {currentQuestionData.type === 'multiple-choice' && currentQuestionData.options && (
              <div className="space-y-2">
                {currentQuestionData.options.map((option) => (
                  <button
                    key={option.id}
                    className={cn(
                      "w-full text-left p-4 border rounded-lg transition-colors",
                      userAnswers[currentQuestionData.id] === option.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-muted/50"
                    )}
                    onClick={() => submitAnswer(currentQuestionData.id, option.id)}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            )}

            {/* Scenario Question */}
            {currentQuestionData.type === 'scenario' && currentQuestionData.scenarioData && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Situación:</h4>
                  <p className="text-sm mb-3">{currentQuestionData.scenarioData.situation}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-medium text-sm mb-1">Desafíos:</h5>
                      <ul className="text-sm space-y-1">
                        {currentQuestionData.scenarioData.challenges.map((challenge, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <XCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-sm mb-1">Recursos:</h5>
                      <ul className="text-sm space-y-1">
                        {currentQuestionData.scenarioData.resources.map((resource, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {resource}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-sm mb-1">Restricciones:</h5>
                      <ul className="text-sm space-y-1">
                        {currentQuestionData.scenarioData.constraints.map((constraint, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <Clock className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                            {constraint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <textarea
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={4}
                  placeholder="Describe tu enfoque para resolver esta situación..."
                  onChange={(e) => submitAnswer(currentQuestionData.id, e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {currentQuestion === selectedAssessment.questions.length - 1 ? (
            <Button onClick={completeAssessment}>
              Completar evaluación
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={!userAnswers[currentQuestionData.id]}
            >
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Assessment Results
  if (showResults && assessmentResult) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="text-center space-y-4">
          <div className={cn(
            "w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-bold text-white",
            assessmentResult.passed ? "bg-green-500" : "bg-red-500"
          )}>
            {assessmentResult.percentage}%
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {assessmentResult.passed ? '¡Felicitaciones!' : 'Sigue practicando'}
            </h2>
            <p className="text-muted-foreground">
              {assessmentResult.passed 
                ? 'Has aprobado la evaluación exitosamente'
                : 'No alcanzaste el puntaje mínimo, pero puedes intentarlo nuevamente'
              }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Fortalezas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {assessmentResult.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-cyan-600">Áreas de mejora</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {assessmentResult.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                    {improvement}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assessmentResult.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  {recommendation}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button onClick={() => setActiveMode(null)}>
            Regresar al inicio
          </Button>
          {!assessmentResult.passed && (
            <Button variant="outline" onClick={() => startAssessment(selectedAssessment!)}>
              Intentar nuevamente
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
}