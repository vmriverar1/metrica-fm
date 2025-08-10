'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Building2, Globe, Linkedin, Twitter, Mail, BookOpen } from 'lucide-react';
import { Author } from '@/types/blog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface AuthorBioProps {
  author: Author;
  variant?: 'card' | 'inline' | 'detailed';
  showStats?: boolean;
  showSocial?: boolean;
  className?: string;
}

export default function AuthorBio({ 
  author, 
  variant = 'card',
  showStats = true,
  showSocial = true,
  className 
}: AuthorBioProps) {
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'website':
        return <Globe className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const formatSocialUrl = (url: string, platform: string) => {
    if (platform.toLowerCase() === 'email') {
      return `mailto:${url}`;
    }
    return url.startsWith('http') ? url : `https://${url}`;
  };

  // Inline variant for article headers
  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="relative w-12 h-12 rounded-full overflow-hidden">
          <Image
            src={author.avatar}
            alt={author.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground">{author.name}</h4>
            {author.role && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{author.role}</span>
              </>
            )}
          </div>
          {author.company && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Building2 className="w-3 h-3" />
              {author.company}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detailed variant for author pages
  if (variant === 'detailed') {
    return (
      <div className={cn("bg-card border border-border rounded-xl p-8", className)}>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Author Image */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32 rounded-xl overflow-hidden">
              <Image
                src={author.avatar}
                alt={author.name}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          </div>

          {/* Author Info */}
          <div className="flex-1 space-y-4">
            {/* Name and Title */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{author.name}</h2>
              {author.role && (
                <p className="text-lg text-primary font-medium">{author.role}</p>
              )}
              {author.company && (
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Building2 className="w-4 h-4" />
                  <span>{author.company}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {author.bio && (
              <p className="text-muted-foreground leading-relaxed">{author.bio}</p>
            )}

            {/* Location */}
            {author.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{author.location}</span>
              </div>
            )}

            {/* Social Links */}
            {showSocial && author.social && Object.keys(author.social).length > 0 && (
              <div className="flex items-center gap-2">
                {Object.entries(author.social).map(([platform, url]) => (
                  <Button
                    key={platform}
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-2"
                  >
                    <a
                      href={formatSocialUrl(url, platform)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      {getSocialIcon(platform)}
                      <span className="capitalize">{platform}</span>
                    </a>
                  </Button>
                ))}
              </div>
            )}

            {/* Expertise Tags */}
            {author.expertise && author.expertise.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Especialidades:</h4>
                <div className="flex flex-wrap gap-2">
                  {author.expertise.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            {showStats && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">15</div>
                  <div className="text-sm text-muted-foreground">Artículos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">2.5K</div>
                  <div className="text-sm text-muted-foreground">Lectores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">5.2K</div>
                  <div className="text-sm text-muted-foreground">Vistas</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <div className={cn("bg-card border border-border rounded-xl p-6", className)}>
      <div className="flex items-start gap-4">
        {/* Author Image */}
        <div className="flex-shrink-0">
          <div className="relative w-16 h-16 rounded-full overflow-hidden">
            <Image
              src={author.avatar}
              alt={author.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        </div>

        {/* Author Info */}
        <div className="flex-1 space-y-3">
          {/* Name and Title */}
          <div>
            <h3 className="font-semibold text-foreground">{author.name}</h3>
            {author.role && (
              <p className="text-sm text-primary font-medium">{author.role}</p>
            )}
            {author.company && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Building2 className="w-3 h-3" />
                <span>{author.company}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {author.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {author.bio}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {author.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{author.location}</span>
                </div>
              )}
              {showStats && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>15 artículos</span>
                </div>
              )}
            </div>

            {/* Social Links */}
            {showSocial && author.social && Object.keys(author.social).length > 0 && (
              <div className="flex items-center gap-1">
                {Object.entries(author.social).slice(0, 3).map(([platform, url]) => (
                  <Button
                    key={platform}
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-8 h-8 p-0"
                  >
                    <a
                      href={formatSocialUrl(url, platform)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {getSocialIcon(platform)}
                    </a>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Expertise Preview */}
          {author.expertise && author.expertise.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {author.expertise.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {author.expertise.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{author.expertise.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <Separator className="my-4" />
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Especialista en {author.expertise?.[0] || 'Proyectos de Infraestructura'}
        </div>
        <Link href={`/blog/author/${author.id}`}>
          <Button variant="outline" size="sm">
            Ver perfil
          </Button>
        </Link>
      </div>
    </div>
  );
}