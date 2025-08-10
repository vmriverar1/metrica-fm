'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Clock, Eye, Share2, Bookmark, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BlogPost } from '@/types/blog';

interface ReadingProgressProps {
  article: BlogPost;
  className?: string;
}

export default function ReadingProgress({ article, className }: ReadingProgressProps) {
  const [readingTime, setReadingTime] = useState(0);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(article.readingTime);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Calculate reading progress
  useEffect(() => {
    const calculateProgress = () => {
      const scrolled = window.scrollY;
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      
      const totalDocScrollLength = docHeight - winHeight;
      const scrollPostion = Math.floor(scrolled / totalDocScrollLength * 100);
      
      // Update reading time based on scroll progress
      const progressPercent = Math.min(scrollPostion / 100, 1);
      const currentReadingTime = Math.floor(progressPercent * article.readingTime);
      const timeLeft = Math.max(article.readingTime - currentReadingTime, 0);
      
      setReadingTime(currentReadingTime);
      setEstimatedTimeLeft(timeLeft);
      setShowScrollToTop(scrolled > 400);
    };

    window.addEventListener('scroll', calculateProgress);
    calculateProgress(); // Initial calculation
    
    return () => window.removeEventListener('scroll', calculateProgress);
  }, [article.readingTime]);

  // Load bookmark state
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
    setIsBookmarked(bookmarks.includes(article.id));
  }, [article.id]);

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
    let updatedBookmarks;
    
    if (isBookmarked) {
      updatedBookmarks = bookmarks.filter((id: string) => id !== article.id);
    } else {
      updatedBookmarks = [...bookmarks, article.id];
    }
    
    localStorage.setItem('bookmarkedArticles', JSON.stringify(updatedBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    const shareData = {
      title: article.title,
      text: article.excerpt,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Progress Bar */}
      <div className={cn("fixed top-0 left-0 right-0 z-50", className)}>
        <motion.div
          className="h-1 bg-gradient-to-r from-primary to-accent origin-left"
          style={{ scaleX }}
        />
      </div>

      {/* Reading Stats - Fixed Position */}
      <div className="fixed top-20 right-4 z-40 hidden lg:block">
        <div className="bg-background/95 backdrop-blur-sm border rounded-xl shadow-lg p-4 space-y-3 min-w-[200px]">
          {/* Article Info */}
          <div className="space-y-1">
            <h4 className="font-medium text-sm text-foreground line-clamp-2">
              {article.title}
            </h4>
            <p className="text-xs text-muted-foreground">
              {article.author.name}
            </p>
          </div>

          {/* Reading Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{Math.round(scrollYProgress.get() * 100)}%</span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-1.5">
              <motion.div
                className="bg-primary h-1.5 rounded-full"
                style={{ scaleX }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
              />
            </div>
          </div>

          {/* Time Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Clock className="w-3 h-3" />
                <span>Leído</span>
              </div>
              <div className="font-medium">{readingTime}m</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Eye className="w-3 h-3" />
                <span>Restante</span>
              </div>
              <div className="font-medium">{estimatedTimeLeft}m</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBookmark}
              className="flex-1"
            >
              <Bookmark className={cn(
                "w-3 h-3 mr-1",
                isBookmarked && "fill-current"
              )} />
              {isBookmarked ? 'Guardado' : 'Guardar'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
            >
              <Share2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-sm border-t p-2">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground">Progreso de lectura</span>
          <span className="font-medium">{Math.round(scrollYProgress.get() * 100)}%</span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-1.5 mb-2">
          <motion.div
            className="bg-primary h-1.5 rounded-full"
            style={{ scaleX }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{readingTime}m leído • {estimatedTimeLeft}m restante</span>
          </div>
          
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBookmark}
              className="h-7 px-2"
            >
              <Bookmark className={cn(
                "w-3 h-3",
                isBookmarked && "fill-current"
              )} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="h-7 px-2"
            >
              <Share2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 lg:bottom-24 lg:right-4 z-40 bg-primary text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </>
  );
}