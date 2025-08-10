'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { JobPosting } from '@/types/careers';
import { useAdvancedAnalytics } from './useAdvancedAnalytics';
import { useSmartRecommendations } from './useSmartRecommendations';

interface CandidateProfile {
  id: string;
  email: string;
  name?: string;
  experience: number; // Years of experience
  skills: string[];
  location: string;
  preferredSalary?: {
    min: number;
    max: number;
    currency: string;
  };
  workPreferences: {
    remote: boolean;
    hybrid: boolean;
    onsite: boolean;
    partTime: boolean;
    fullTime: boolean;
    contract: boolean;
  };
  education: {
    level: 'bachelors' | 'masters' | 'doctorate' | 'technical' | 'other';
    field: string;
    institution?: string;
  };
  certifications: string[];
  languages: Array<{
    language: string;
    level: 'basic' | 'intermediate' | 'advanced' | 'native';
  }>;
  availability: {
    startDate: Date;
    noticePeriod: number; // Days
  };
  careerGoals: string[];
  industries: string[];
}

interface JobMatch {
  job: JobPosting;
  candidate: CandidateProfile;
  overallScore: number;
  matchBreakdown: {
    skills: { score: number; matches: string[]; gaps: string[] };
    experience: { score: number; required: string; candidate: number };
    location: { score: number; matches: boolean; distance?: number };
    salary: { score: number; inRange: boolean; difference?: number };
    workStyle: { score: number; preferences: string[] };
    education: { score: number; meets: boolean; level: string };
    culture: { score: number; factors: string[] };
  };
  recommendations: string[];
  confidence: number;
  fitLevel: 'poor' | 'fair' | 'good' | 'excellent' | 'perfect';
}

interface SkillGapAnalysis {
  candidateId: string;
  jobId: string;
  missingSkills: Array<{
    skill: string;
    importance: 'high' | 'medium' | 'low';
    learningPath: string[];
    estimatedTime: string;
  }>;
  strengthAreas: string[];
  developmentPlan: Array<{
    skill: string;
    action: string;
    timeline: string;
    resources: string[];
  }>;
}

interface CareerPath {
  currentRole: string;
  nextRoles: Array<{
    title: string;
    timeframe: string;
    requiredSkills: string[];
    salaryRange: { min: number; max: number };
    probability: number;
  }>;
  longTermGoals: Array<{
    role: string;
    timeframe: string;
    pathSteps: string[];
  }>;
}

const SKILL_CATEGORIES = {
  technical: ['AutoCAD', 'BIM', 'Revit', 'Civil 3D', 'Project Management', 'Cost Estimation'],
  soft: ['Leadership', 'Communication', 'Problem Solving', 'Team Management', 'Negotiation'],
  industry: ['Construction', 'Architecture', 'Engineering', 'Real Estate', 'Infrastructure'],
  certifications: ['PMP', 'LEED AP', 'P.Eng', 'Architect License', 'Safety Certification']
};

export function useSmartJobMatching() {
  const [candidates, setCandidates] = useState<Map<string, CandidateProfile>>(new Map());
  const [jobMatches, setJobMatches] = useState<Map<string, JobMatch[]>>(new Map());
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analytics = useAdvancedAnalytics('careers');
  const recommendations = useSmartRecommendations('careers');

  // Load candidate data from storage
  useEffect(() => {
    loadCandidatesFromStorage();
  }, []);

  const loadCandidatesFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('candidate_profiles');
      if (stored) {
        const candidatesData = JSON.parse(stored);
        const candidatesMap = new Map<string, CandidateProfile>();
        
        Object.entries(candidatesData).forEach(([id, candidate]: [string, any]) => {
          candidatesMap.set(id, {
            ...candidate,
            availability: {
              ...candidate.availability,
              startDate: new Date(candidate.availability.startDate)
            }
          });
        });
        
        setCandidates(candidatesMap);
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  }, []);

  const saveCandidatesToStorage = useCallback((candidatesData: Map<string, CandidateProfile>) => {
    try {
      const candidatesObject = Object.fromEntries(candidatesData);
      localStorage.setItem('candidate_profiles', JSON.stringify(candidatesObject));
    } catch (error) {
      console.error('Error saving candidates:', error);
    }
  }, []);

  // Calculate skill match score
  const calculateSkillMatch = useCallback((
    jobRequirements: string[],
    candidateSkills: string[]
  ): { score: number; matches: string[]; gaps: string[] } => {
    const normalizedJobSkills = jobRequirements.map(skill => skill.toLowerCase().trim());
    const normalizedCandidateSkills = candidateSkills.map(skill => skill.toLowerCase().trim());

    const matches: string[] = [];
    const gaps: string[] = [];

    normalizedJobSkills.forEach(jobSkill => {
      const hasSkill = normalizedCandidateSkills.some(candidateSkill => 
        candidateSkill.includes(jobSkill) || jobSkill.includes(candidateSkill)
      );
      
      if (hasSkill) {
        matches.push(jobSkill);
      } else {
        gaps.push(jobSkill);
      }
    });

    const score = normalizedJobSkills.length > 0 ? matches.length / normalizedJobSkills.length : 0;

    return { score, matches, gaps };
  }, []);

  // Calculate experience match score
  const calculateExperienceMatch = useCallback((
    jobExperience: string,
    candidateExperience: number
  ): { score: number; required: string; candidate: number } => {
    // Parse job experience requirements
    const experienceMatch = jobExperience.match(/(\d+)/);
    const requiredYears = experienceMatch ? parseInt(experienceMatch[1]) : 0;

    let score = 0;
    
    if (candidateExperience >= requiredYears) {
      score = 1; // Perfect match or overqualified
      if (candidateExperience > requiredYears * 2) {
        score = 0.8; // Significantly overqualified
      }
    } else {
      score = candidateExperience / requiredYears; // Underqualified
    }

    return {
      score: Math.min(score, 1),
      required: jobExperience,
      candidate: candidateExperience
    };
  }, []);

  // Calculate location match score
  const calculateLocationMatch = useCallback((
    jobLocation: string,
    candidateLocation: string,
    remote: boolean = false
  ): { score: number; matches: boolean; distance?: number } => {
    if (remote) {
      return { score: 1, matches: true };
    }

    const jobCity = jobLocation.toLowerCase().trim();
    const candidateCity = candidateLocation.toLowerCase().trim();

    if (jobCity === candidateCity) {
      return { score: 1, matches: true };
    }

    // Simple distance calculation based on major Peruvian cities
    const distances: Record<string, Record<string, number>> = {
      'lima': { 'callao': 15, 'arequipa': 1000, 'cusco': 1150, 'trujillo': 560 },
      'arequipa': { 'lima': 1000, 'cusco': 320, 'tacna': 250 },
      'cusco': { 'lima': 1150, 'arequipa': 320 },
      'trujillo': { 'lima': 560, 'chiclayo': 200 }
    };

    const distance = distances[jobCity]?.[candidateCity] || 1000; // Default high distance
    const score = Math.max(0, 1 - distance / 1000); // Decrease score based on distance

    return {
      score,
      matches: score > 0.5,
      distance
    };
  }, []);

  // Calculate salary match score
  const calculateSalaryMatch = useCallback((
    jobSalaryRange: { min: number; max: number },
    candidatePreference?: { min: number; max: number; currency: string }
  ): { score: number; inRange: boolean; difference?: number } => {
    if (!candidatePreference) {
      return { score: 0.5, inRange: true }; // Neutral if no preference
    }

    const jobMidpoint = (jobSalaryRange.min + jobSalaryRange.max) / 2;
    const candidateMidpoint = (candidatePreference.min + candidatePreference.max) / 2;

    const inRange = 
      candidatePreference.min <= jobSalaryRange.max && 
      candidatePreference.max >= jobSalaryRange.min;

    let score = 0;
    if (inRange) {
      score = 1;
    } else {
      // Calculate how far off the ranges are
      const difference = candidatePreference.min > jobSalaryRange.max ? 
        candidatePreference.min - jobSalaryRange.max :
        jobSalaryRange.min - candidatePreference.max;
      
      score = Math.max(0, 1 - difference / jobMidpoint);
    }

    return {
      score,
      inRange,
      difference: Math.abs(jobMidpoint - candidateMidpoint)
    };
  }, []);

  // Calculate work style match
  const calculateWorkStyleMatch = useCallback((
    jobType: string,
    jobRemote: boolean,
    candidatePreferences: CandidateProfile['workPreferences']
  ): { score: number; preferences: string[] } => {
    let score = 0;
    const matchingPreferences: string[] = [];

    // Job type match
    if (jobType === 'full-time' && candidatePreferences.fullTime) {
      score += 0.4;
      matchingPreferences.push('full-time');
    }
    if (jobType === 'part-time' && candidatePreferences.partTime) {
      score += 0.4;
      matchingPreferences.push('part-time');
    }
    if (jobType === 'contract' && candidatePreferences.contract) {
      score += 0.4;
      matchingPreferences.push('contract');
    }

    // Remote work match
    if (jobRemote && candidatePreferences.remote) {
      score += 0.3;
      matchingPreferences.push('remote work');
    } else if (!jobRemote && candidatePreferences.onsite) {
      score += 0.3;
      matchingPreferences.push('on-site work');
    } else if (candidatePreferences.hybrid) {
      score += 0.2;
      matchingPreferences.push('flexible work');
    }

    return { score: Math.min(score, 1), preferences: matchingPreferences };
  }, []);

  // Calculate education match
  const calculateEducationMatch = useCallback((
    jobEducationRequirements: string,
    candidateEducation: CandidateProfile['education']
  ): { score: number; meets: boolean; level: string } => {
    const educationLevels = {
      'technical': 1,
      'bachelors': 2,
      'masters': 3,
      'doctorate': 4
    };

    // Parse job requirements (simplified)
    let requiredLevel = 'bachelors'; // Default
    if (jobEducationRequirements.toLowerCase().includes('master')) requiredLevel = 'masters';
    if (jobEducationRequirements.toLowerCase().includes('phd') || jobEducationRequirements.toLowerCase().includes('doctorate')) requiredLevel = 'doctorate';
    if (jobEducationRequirements.toLowerCase().includes('technical') || jobEducationRequirements.toLowerCase().includes('diploma')) requiredLevel = 'technical';

    const candidateLevel = educationLevels[candidateEducation.level] || 2;
    const requiredLevelNum = educationLevels[requiredLevel as keyof typeof educationLevels] || 2;

    const meets = candidateLevel >= requiredLevelNum;
    let score = 0;

    if (meets) {
      score = 1;
      if (candidateLevel > requiredLevelNum + 1) {
        score = 0.9; // Slight penalty for being overqualified
      }
    } else {
      score = candidateLevel / requiredLevelNum;
    }

    return { score, meets, level: candidateEducation.level };
  }, []);

  // Calculate cultural fit score
  const calculateCultureFit = useCallback((
    job: JobPosting,
    candidate: CandidateProfile
  ): { score: number; factors: string[] } => {
    let score = 0;
    const factors: string[] = [];

    // Industry alignment
    const jobIndustries = ['construction', 'architecture', 'engineering', 'real estate'];
    const hasIndustryExperience = candidate.industries.some(industry =>
      jobIndustries.some(jobInd => industry.toLowerCase().includes(jobInd))
    );

    if (hasIndustryExperience) {
      score += 0.3;
      factors.push('Industry experience');
    }

    // Career goals alignment
    const jobTitle = job.title.toLowerCase();
    const hasAlignedGoals = candidate.careerGoals.some(goal =>
      goal.toLowerCase().includes('construction') || 
      goal.toLowerCase().includes('architecture') ||
      job.department.toLowerCase().includes(goal.toLowerCase())
    );

    if (hasAlignedGoals) {
      score += 0.3;
      factors.push('Career goals alignment');
    }

    // Language requirements (Spanish assumed for Peru)
    const hasSpanish = candidate.languages.some(lang => 
      lang.language.toLowerCase().includes('spanish') && 
      ['intermediate', 'advanced', 'native'].includes(lang.level)
    );

    if (hasSpanish) {
      score += 0.2;
      factors.push('Language proficiency');
    }

    // Certifications bonus
    if (candidate.certifications.length > 0) {
      score += 0.2;
      factors.push('Professional certifications');
    }

    return { score: Math.min(score, 1), factors };
  }, []);

  // Main matching algorithm
  const calculateJobMatch = useCallback((
    job: JobPosting,
    candidate: CandidateProfile
  ): JobMatch => {
    // Calculate individual match components
    const skillsMatch = calculateSkillMatch(job.requirements, candidate.skills);
    const experienceMatch = calculateExperienceMatch(job.experience, candidate.experience);
    const locationMatch = calculateLocationMatch(job.location, candidate.location, job.remote);
    const salaryMatch = calculateSalaryMatch(
      { min: job.salaryRange.min, max: job.salaryRange.max },
      candidate.preferredSalary
    );
    const workStyleMatch = calculateWorkStyleMatch(job.type, job.remote, candidate.workPreferences);
    const educationMatch = calculateEducationMatch(job.requirements.join(', '), candidate.education);
    const cultureMatch = calculateCultureFit(job, candidate);

    // Weight the different factors
    const weights = {
      skills: 0.25,
      experience: 0.20,
      location: 0.15,
      salary: 0.15,
      workStyle: 0.10,
      education: 0.08,
      culture: 0.07
    };

    const overallScore = 
      skillsMatch.score * weights.skills +
      experienceMatch.score * weights.experience +
      locationMatch.score * weights.location +
      salaryMatch.score * weights.salary +
      workStyleMatch.score * weights.workStyle +
      educationMatch.score * weights.education +
      cultureMatch.score * weights.culture;

    // Calculate confidence based on data completeness
    const dataCompleteness = [
      candidate.skills.length > 0 ? 1 : 0,
      candidate.experience > 0 ? 1 : 0,
      candidate.location ? 1 : 0,
      candidate.preferredSalary ? 1 : 0,
      candidate.education.level ? 1 : 0,
      candidate.languages.length > 0 ? 1 : 0
    ].reduce((acc, val) => acc + val, 0) / 6;

    const confidence = dataCompleteness * 0.7 + overallScore * 0.3;

    // Determine fit level
    let fitLevel: JobMatch['fitLevel'];
    if (overallScore >= 0.9) fitLevel = 'perfect';
    else if (overallScore >= 0.75) fitLevel = 'excellent';
    else if (overallScore >= 0.6) fitLevel = 'good';
    else if (overallScore >= 0.4) fitLevel = 'fair';
    else fitLevel = 'poor';

    // Generate recommendations
    const recommendations: string[] = [];
    if (skillsMatch.gaps.length > 0) {
      recommendations.push(`Desarrollar habilidades en: ${skillsMatch.gaps.slice(0, 3).join(', ')}`);
    }
    if (experienceMatch.score < 0.8) {
      recommendations.push('Considerar ganar más experiencia en proyectos similares');
    }
    if (locationMatch.score < 0.5 && !job.remote) {
      recommendations.push('Evaluar posibilidad de reubicación o trabajo remoto');
    }
    if (salaryMatch.score < 0.7) {
      recommendations.push('Revisar expectativas salariales');
    }

    return {
      job,
      candidate,
      overallScore,
      matchBreakdown: {
        skills: skillsMatch,
        experience: experienceMatch,
        location: locationMatch,
        salary: salaryMatch,
        workStyle: workStyleMatch,
        education: educationMatch,
        culture: cultureMatch
      },
      recommendations,
      confidence,
      fitLevel
    };
  }, [
    calculateSkillMatch,
    calculateExperienceMatch,
    calculateLocationMatch,
    calculateSalaryMatch,
    calculateWorkStyleMatch,
    calculateEducationMatch,
    calculateCultureFit
  ]);

  // Find best matches for a candidate
  const findJobsForCandidate = useCallback(async (
    candidateId: string,
    jobs: JobPosting[],
    limit = 10
  ): Promise<JobMatch[]> => {
    const candidate = candidates.get(candidateId);
    if (!candidate) return [];

    setIsAnalyzing(true);

    try {
      const matches = jobs.map(job => calculateJobMatch(job, candidate));
      
      // Sort by overall score
      const sortedMatches = matches
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, limit);

      // Cache results
      setJobMatches(prev => new Map(prev.set(candidateId, sortedMatches)));

      // Track analytics
      analytics.trackEvent('job_matching_performed', {
        candidateId,
        jobCount: jobs.length,
        matchCount: sortedMatches.length,
        averageScore: sortedMatches.reduce((acc, match) => acc + match.overallScore, 0) / sortedMatches.length,
        topMatchScore: sortedMatches[0]?.overallScore || 0
      });

      return sortedMatches;

    } catch (error) {
      console.error('Error finding jobs for candidate:', error);
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  }, [candidates, calculateJobMatch, analytics]);

  // Find best candidates for a job
  const findCandidatesForJob = useCallback(async (
    jobId: string,
    job: JobPosting,
    candidateList?: CandidateProfile[],
    limit = 10
  ): Promise<JobMatch[]> => {
    const candidatesToSearch = candidateList || Array.from(candidates.values());

    setIsAnalyzing(true);

    try {
      const matches = candidatesToSearch.map(candidate => calculateJobMatch(job, candidate));
      
      // Sort by overall score
      const sortedMatches = matches
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, limit);

      analytics.trackEvent('candidate_matching_performed', {
        jobId,
        candidateCount: candidatesToSearch.length,
        matchCount: sortedMatches.length,
        averageScore: sortedMatches.reduce((acc, match) => acc + match.overallScore, 0) / sortedMatches.length,
        topMatchScore: sortedMatches[0]?.overallScore || 0
      });

      return sortedMatches;

    } catch (error) {
      console.error('Error finding candidates for job:', error);
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  }, [candidates, calculateJobMatch, analytics]);

  // Generate skill gap analysis
  const generateSkillGapAnalysis = useCallback((
    candidateId: string,
    jobId: string,
    jobMatch: JobMatch
  ): SkillGapAnalysis => {
    const missingSkills = jobMatch.matchBreakdown.skills.gaps.map(skill => ({
      skill,
      importance: 'high' as const, // Simplified - would be dynamic
      learningPath: [`Curso de ${skill}`, `Práctica en proyecto`, `Certificación`],
      estimatedTime: '3-6 meses'
    }));

    const developmentPlan = missingSkills.map(({ skill }) => ({
      skill,
      action: `Completar capacitación en ${skill}`,
      timeline: '3 meses',
      resources: ['Cursos online', 'Workshops', 'Mentoring']
    }));

    return {
      candidateId,
      jobId,
      missingSkills,
      strengthAreas: jobMatch.matchBreakdown.skills.matches,
      developmentPlan
    };
  }, []);

  // Generate career path recommendations
  const generateCareerPath = useCallback((
    candidate: CandidateProfile,
    currentJobs: JobPosting[]
  ): CareerPath => {
    // Simplified career path generation
    const experienceLevel = candidate.experience;
    let currentRole = 'Junior';
    let nextRoles: CareerPath['nextRoles'] = [];

    if (experienceLevel < 3) {
      currentRole = 'Junior Professional';
      nextRoles = [
        {
          title: 'Mid-Level Engineer',
          timeframe: '2-3 años',
          requiredSkills: ['Project Management', 'Advanced Technical Skills'],
          salaryRange: { min: 4000, max: 6000 },
          probability: 0.8
        },
        {
          title: 'Specialist',
          timeframe: '3-4 años',
          requiredSkills: ['Specialization', 'Leadership'],
          salaryRange: { min: 5000, max: 7500 },
          probability: 0.6
        }
      ];
    } else if (experienceLevel < 8) {
      currentRole = 'Mid-Level Professional';
      nextRoles = [
        {
          title: 'Senior Engineer',
          timeframe: '1-2 años',
          requiredSkills: ['Team Leadership', 'Strategic Thinking'],
          salaryRange: { min: 6000, max: 9000 },
          probability: 0.7
        },
        {
          title: 'Project Manager',
          timeframe: '2-3 años',
          requiredSkills: ['PMP Certification', 'Budget Management'],
          salaryRange: { min: 7000, max: 12000 },
          probability: 0.6
        }
      ];
    } else {
      currentRole = 'Senior Professional';
      nextRoles = [
        {
          title: 'Principal Engineer',
          timeframe: '1-2 años',
          requiredSkills: ['Technical Excellence', 'Mentoring'],
          salaryRange: { min: 10000, max: 15000 },
          probability: 0.5
        },
        {
          title: 'Director',
          timeframe: '2-4 años',
          requiredSkills: ['Executive Leadership', 'Business Strategy'],
          salaryRange: { min: 15000, max: 25000 },
          probability: 0.3
        }
      ];
    }

    return {
      currentRole,
      nextRoles,
      longTermGoals: [
        {
          role: 'Technical Director',
          timeframe: '5-8 años',
          pathSteps: ['Senior Engineer', 'Principal Engineer', 'Technical Director']
        },
        {
          role: 'Project Director',
          timeframe: '6-10 años',
          pathSteps: ['Project Manager', 'Senior PM', 'Project Director']
        }
      ]
    };
  }, []);

  // Create or update candidate profile
  const createCandidateProfile = useCallback((
    profileData: Omit<CandidateProfile, 'id'>
  ): string => {
    const candidateId = `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const candidate: CandidateProfile = {
      ...profileData,
      id: candidateId
    };

    const updatedCandidates = new Map(candidates);
    updatedCandidates.set(candidateId, candidate);
    setCandidates(updatedCandidates);
    saveCandidatesToStorage(updatedCandidates);

    analytics.trackEvent('candidate_profile_created', {
      candidateId,
      experienceYears: candidate.experience,
      skillsCount: candidate.skills.length,
      location: candidate.location
    });

    return candidateId;
  }, [candidates, saveCandidatesToStorage, analytics]);

  return {
    candidates,
    jobMatches,
    isAnalyzing,
    findJobsForCandidate,
    findCandidatesForJob,
    calculateJobMatch,
    generateSkillGapAnalysis,
    generateCareerPath,
    createCandidateProfile
  };
}

// Hook for job recommendation engine
export function useJobRecommendationEngine() {
  const [recommendationHistory, setRecommendationHistory] = useState<Map<string, JobMatch[]>>(new Map());
  const jobMatching = useSmartJobMatching();
  const analytics = useAdvancedAnalytics('careers');

  const getPersonalizedRecommendations = useCallback(async (
    candidateId: string,
    jobs: JobPosting[],
    options?: {
      diversityWeight?: number;
      freshnessWeight?: number;
      popularityWeight?: number;
    }
  ): Promise<JobMatch[]> => {
    const matches = await jobMatching.findJobsForCandidate(candidateId, jobs);
    
    // Apply additional scoring based on options
    const enhancedMatches = matches.map(match => {
      let enhancedScore = match.overallScore;
      
      // Add diversity bonus (different departments/roles)
      if (options?.diversityWeight) {
        // Implementation would check previous recommendations
        enhancedScore += options.diversityWeight * 0.1;
      }
      
      // Add freshness bonus for recently posted jobs
      if (options?.freshnessWeight) {
        const daysSincePosted = (Date.now() - new Date(match.job.postedDate).getTime()) / (1000 * 60 * 60 * 24);
        const freshnessBonus = Math.max(0, (7 - daysSincePosted) / 7) * options.freshnessWeight * 0.1;
        enhancedScore += freshnessBonus;
      }
      
      return { ...match, overallScore: enhancedScore };
    });

    // Sort by enhanced score
    const finalRecommendations = enhancedMatches
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 10);

    // Store in history
    setRecommendationHistory(prev => 
      new Map(prev.set(candidateId, finalRecommendations))
    );

    analytics.trackEvent('personalized_recommendations_generated', {
      candidateId,
      recommendationCount: finalRecommendations.length,
      averageScore: finalRecommendations.reduce((acc, r) => acc + r.overallScore, 0) / finalRecommendations.length
    });

    return finalRecommendations;
  }, [jobMatching, analytics]);

  return {
    getPersonalizedRecommendations,
    recommendationHistory
  };
}