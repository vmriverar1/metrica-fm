'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Share2, BookmarkPlus, Copy, Check } from 'lucide-react';

interface ArticleContentProps {
  content: string;
  className?: string;
}

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

export default function ArticleContent({ content, className }: ArticleContentProps) {
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Generate table of contents from headings in content
  useEffect(() => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const toc: TableOfContentsItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      toc.push({ id, title, level });
    }

    setTableOfContents(toc);
  }, [content]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const article = document.getElementById('article-content');
      if (!article) return;

      const rect = article.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const articleHeight = rect.height;
      const scrolled = Math.max(0, -rect.top);
      const progress = Math.min(100, (scrolled / (articleHeight - windowHeight)) * 100);
      
      setReadingProgress(Math.max(0, progress));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section for TOC highlighting
  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-50% 0px -50% 0px'
    });

    // Observe all headings
    const headings = document.querySelectorAll('#article-content h1, #article-content h2, #article-content h3');
    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [content]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    // Here you would typically save to localStorage or send to API
    if (typeof window !== 'undefined') {
      const bookmarks = JSON.parse(localStorage.getItem('article-bookmarks') || '[]');
      const articleUrl = window.location.pathname;
      
      if (bookmarked) {
        const updated = bookmarks.filter((url: string) => url !== articleUrl);
        localStorage.setItem('article-bookmarks', JSON.stringify(updated));
      } else {
        bookmarks.push(articleUrl);
        localStorage.setItem('article-bookmarks', JSON.stringify(bookmarks));
      }
    }
  };

  const renderContent = (content: string) => {
    // Convert markdown-like syntax to HTML
    let html = content
      // Headers
      .replace(/^### (.*$)/gm, '<h3 id="$1" class="scroll-mt-20">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 id="$1" class="scroll-mt-20">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 id="$1" class="scroll-mt-20">$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Wrap in paragraphs
    html = `<p>${html}</p>`;

    // Clean up empty paragraphs and fix heading paragraphs
    html = html
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<h[1-6][^>]*>.*?<\/h[1-6]>)<\/p>/g, '$1')
      .replace(/<p>(<h[1-6][^>]*>.*?<\/h[1-6]>)<br>/g, '$1')
      .replace(/<br><\/p>/g, '</p>');

    return html;
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Reading Progress Bar */}
      <div className="fixed top-20 left-0 w-full h-1 bg-muted z-50">
        <div 
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Table of Contents - Desktop */}
        {tableOfContents.length > 0 && (
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-32">
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Contenido</h4>
                <ScrollArea className="h-96">
                  <nav className="space-y-2">
                    {tableOfContents.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={cn(
                          "block w-full text-left text-sm transition-colors hover:text-primary",
                          item.level === 1 && "font-medium",
                          item.level === 2 && "ml-4",
                          item.level === 3 && "ml-8",
                          activeSection === item.id ? "text-primary font-medium" : "text-muted-foreground"
                        )}
                      >
                        {item.title}
                      </button>
                    ))}
                  </nav>
                </ScrollArea>
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className={cn(
          "prose prose-lg max-w-none",
          tableOfContents.length > 0 ? "lg:col-span-3" : "lg:col-span-4"
        )}>
          <div
            id="article-content"
            className={cn(
              "prose-headings:text-foreground prose-headings:font-semibold",
              "prose-h1:text-3xl prose-h1:mb-8 prose-h1:mt-8",
              "prose-h2:text-2xl prose-h2:mb-6 prose-h2:mt-8",
              "prose-h3:text-xl prose-h3:mb-4 prose-h3:mt-6",
              "prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4",
              "prose-strong:text-foreground prose-strong:font-semibold",
              "prose-em:text-muted-foreground",
              "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
              "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
              "prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg",
              "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic",
              "prose-ul:text-muted-foreground prose-ol:text-muted-foreground",
              "prose-li:text-muted-foreground prose-li:mb-1"
            )}
            dangerouslySetInnerHTML={{
              __html: renderContent(content)
            }}
          />

          {/* Article Actions */}
          <Separator className="my-8" />
          
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleBookmark}
                className="gap-2"
              >
                <BookmarkPlus className={cn(
                  "w-4 h-4",
                  bookmarked && "fill-current"
                )} />
                {bookmarked ? 'Guardado' : 'Guardar'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="gap-2"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? 'Copiado' : 'Copiar enlace'}
              </Button>
            </div>

            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Compartir
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Table of Contents - Collapsible */}
      {tableOfContents.length > 0 && (
        <div className="lg:hidden mt-8 p-4 bg-muted/50 rounded-lg">
          <details className="group">
            <summary className="cursor-pointer font-medium text-foreground">
              Contenido del artículo
            </summary>
            <nav className="mt-4 space-y-2">
              {tableOfContents.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "block w-full text-left text-sm transition-colors hover:text-primary",
                    item.level === 1 && "font-medium",
                    item.level === 2 && "ml-4",
                    item.level === 3 && "ml-8",
                    activeSection === item.id ? "text-primary font-medium" : "text-muted-foreground"
                  )}
                >
                  {item.title}
                </button>
              ))}
            </nav>
          </details>
        </div>
      )}
    </div>
  );
}