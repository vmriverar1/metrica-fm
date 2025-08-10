'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  Flag, 
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  Send,
  User,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    isAuthor?: boolean;
    isVerified?: boolean;
  };
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  likes: number;
  dislikes: number;
  replies: Comment[];
  isLiked?: boolean;
  isDisliked?: boolean;
}

interface CommentSectionProps {
  articleId: string;
  initialComments?: Comment[];
  allowGuests?: boolean;
  moderationEnabled?: boolean;
  className?: string;
}

// Sample comments for demonstration
const getSampleComments = (): Comment[] => [
  {
    id: 'sample1',
    author: {
      name: 'Carlos Mendoza',
      avatar: 'https://i.pravatar.cc/150?img=11',
      isVerified: true
    },
    content: 'Excelente artículo sobre la gestión de proyectos de infraestructura. Los puntos sobre la importancia de la planificación anticipada son especialmente relevantes para nuestro contexto en Perú.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    likes: 15,
    dislikes: 1,
    replies: [
      {
        id: 'reply1',
        author: {
          name: 'Ana García',
          avatar: 'https://i.pravatar.cc/150?img=5',
          isAuthor: true
        },
        content: 'Gracias por tu comentario, Carlos. Efectivamente, la planificación anticipada es crucial en proyectos de infraestructura, especialmente considerando las complejidades regulatorias y ambientales.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        likes: 8,
        dislikes: 0,
        replies: []
      }
    ]
  },
  {
    id: 'sample2',
    author: {
      name: 'María Fernández',
      avatar: 'https://i.pravatar.cc/150?img=16',
      isVerified: false
    },
    content: '¿Cómo aplican estas metodologías en proyectos de menor escala? Me gustaría conocer ejemplos prácticos para municipalidades.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    likes: 12,
    dislikes: 0,
    replies: []
  },
  {
    id: 'sample3',
    author: {
      name: 'Roberto Silva',
      avatar: 'https://i.pravatar.cc/150?img=33',
      isVerified: true
    },
    content: 'Como ingeniero civil con 20 años de experiencia, puedo confirmar que estos principios son fundamentales. La parte sobre gestión de riesgos es particularmente importante en nuestra región.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    likes: 25,
    dislikes: 2,
    replies: [
      {
        id: 'reply2',
        author: {
          name: 'Luis Ramos',
          avatar: 'https://i.pravatar.cc/150?img=8'
        },
        content: 'Totalmente de acuerdo. La gestión de riesgos sísmicos debe ser una prioridad en todos los proyectos.',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        likes: 10,
        dislikes: 0,
        replies: []
      }
    ]
  }
];

export default function CommentSection({ 
  articleId, 
  initialComments = [],
  allowGuests = true,
  moderationEnabled = true,
  className 
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [showGuestForm, setShowGuestForm] = useState(false);

  // Load comments from localStorage (simulated backend)
  useEffect(() => {
    const saved = localStorage.getItem(`article-comments-${articleId}`);
    if (saved) {
      const parsedComments = JSON.parse(saved, (key, value) => {
        if (key === 'createdAt' || key === 'updatedAt') {
          return new Date(value);
        }
        return value;
      });
      setComments(parsedComments);
    } else {
      // Load sample comments if no saved comments exist
      const sampleComments = getSampleComments();
      setComments(sampleComments);
      localStorage.setItem(`article-comments-${articleId}`, JSON.stringify(sampleComments));
    }
  }, [articleId]);

  // Save comments to localStorage
  const saveComments = (updatedComments: Comment[]) => {
    localStorage.setItem(`article-comments-${articleId}`, JSON.stringify(updatedComments));
    setComments(updatedComments);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return a.createdAt.getTime() - b.createdAt.getTime();
      case 'popular':
        return (b.likes - b.dislikes) - (a.likes - a.dislikes);
      default: // newest
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: generateId(),
      author: {
        name: userInfo.name || 'Usuario Anónimo',
        avatar: undefined,
        isAuthor: false,
        isVerified: false
      },
      content: newComment.trim(),
      createdAt: new Date(),
      likes: 0,
      dislikes: 0,
      replies: []
    };

    const updatedComments = [comment, ...comments];
    saveComments(updatedComments);
    setNewComment('');
    setShowGuestForm(false);
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyText.trim()) return;

    const reply: Comment = {
      id: generateId(),
      author: {
        name: userInfo.name || 'Usuario Anónimo',
        avatar: undefined,
        isAuthor: false,
        isVerified: false
      },
      content: replyText.trim(),
      createdAt: new Date(),
      likes: 0,
      dislikes: 0,
      replies: []
    };

    const updatedComments = comments.map(comment => 
      comment.id === parentId 
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    );

    saveComments(updatedComments);
    setReplyText('');
    setReplyingTo(null);
  };

  const handleLike = (commentId: string, isReply?: boolean, parentId?: string) => {
    const updatedComments = comments.map(comment => {
      if (isReply && comment.id === parentId) {
        return {
          ...comment,
          replies: comment.replies.map(reply => 
            reply.id === commentId 
              ? { 
                  ...reply, 
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                  dislikes: reply.isDisliked ? reply.dislikes - 1 : reply.dislikes,
                  isLiked: !reply.isLiked,
                  isDisliked: false
                }
              : reply
          )
        };
      } else if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          dislikes: comment.isDisliked ? comment.dislikes - 1 : comment.dislikes,
          isLiked: !comment.isLiked,
          isDisliked: false
        };
      }
      return comment;
    });

    saveComments(updatedComments);
  };

  const handleDislike = (commentId: string, isReply?: boolean, parentId?: string) => {
    const updatedComments = comments.map(comment => {
      if (isReply && comment.id === parentId) {
        return {
          ...comment,
          replies: comment.replies.map(reply => 
            reply.id === commentId 
              ? { 
                  ...reply, 
                  dislikes: reply.isDisliked ? reply.dislikes - 1 : reply.dislikes + 1,
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes,
                  isDisliked: !reply.isDisliked,
                  isLiked: false
                }
              : reply
          )
        };
      } else if (comment.id === commentId) {
        return {
          ...comment,
          dislikes: comment.isDisliked ? comment.dislikes - 1 : comment.dislikes + 1,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes,
          isDisliked: !comment.isDisliked,
          isLiked: false
        };
      }
      return comment;
    });

    saveComments(updatedComments);
  };

  const CommentComponent = ({ comment, isReply = false, parentId }: { 
    comment: Comment; 
    isReply?: boolean;
    parentId?: string;
  }) => (
    <div className={cn(
      "space-y-3",
      isReply && "ml-8 pl-4 border-l-2 border-muted"
    )}>
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback>
            {comment.author.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          {/* Author Info */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.author.name}</span>
            
            {comment.author.isAuthor && (
              <Badge variant="secondary" className="text-xs">
                Autor
              </Badge>
            )}
            
            {comment.author.isVerified && (
              <Badge variant="outline" className="text-xs">
                Verificado
              </Badge>
            )}
            
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(comment.createdAt)}
            </span>
            
            {comment.updatedAt && (
              <span className="text-xs text-muted-foreground">
                • editado
              </span>
            )}
          </div>

          {/* Comment Content */}
          <div className="text-sm text-foreground leading-relaxed">
            {comment.content}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLike(comment.id, isReply, parentId)}
              className={cn(
                "flex items-center gap-1 text-xs hover:text-primary transition-colors",
                comment.isLiked && "text-primary"
              )}
            >
              <ThumbsUp className={cn(
                "w-3 h-3",
                comment.isLiked && "fill-current"
              )} />
              {comment.likes > 0 && comment.likes}
            </button>

            <button
              onClick={() => handleDislike(comment.id, isReply, parentId)}
              className={cn(
                "flex items-center gap-1 text-xs hover:text-destructive transition-colors",
                comment.isDisliked && "text-destructive"
              )}
            >
              <ThumbsDown className={cn(
                "w-3 h-3",
                comment.isDisliked && "fill-current"
              )} />
              {comment.dislikes > 0 && comment.dislikes}
            </button>

            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-xs hover:text-primary transition-colors"
              >
                <Reply className="w-3 h-3" />
                Responder
              </button>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 text-xs hover:text-muted-foreground transition-colors">
                  <MoreVertical className="w-3 h-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Flag className="w-3 h-3 mr-2" />
                  Reportar
                </Button>
              </PopoverContent>
            </Popover>
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-3"
            >
              {allowGuests && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Tu nombre"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="text-sm"
                  />
                  <Input
                    type="email"
                    placeholder="Tu email (opcional)"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="text-sm"
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  className="flex-1 min-h-[80px] text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyText.trim()}
                >
                  <Send className="w-3 h-3 mr-1" />
                  Responder
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setReplyingTo(null)}
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="space-y-4">
          {comment.replies.map(reply => (
            <CommentComponent 
              key={reply.id} 
              comment={reply} 
              isReply={true}
              parentId={comment.id}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">
            Comentarios ({comments.length + comments.reduce((acc, c) => acc + c.replies.length, 0)})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ordenar por:</span>
          <Button
            variant={sortBy === 'newest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('newest')}
          >
            Recientes
          </Button>
          <Button
            variant={sortBy === 'popular' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('popular')}
          >
            Populares
          </Button>
        </div>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-4">
        <div className="flex gap-3">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="¿Qué te parece este artículo? Comparte tu opinión..."
              className="min-h-[100px] resize-none"
              onClick={() => allowGuests && !userInfo.name && setShowGuestForm(true)}
            />

            {/* Guest Form */}
            <AnimatePresence>
              {showGuestForm && allowGuests && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <Input
                    placeholder="Tu nombre *"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Tu email (opcional)"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {moderationEnabled && "Los comentarios están sujetos a moderación."}
              </div>
              
              <Button
                type="submit"
                disabled={!newComment.trim() || (allowGuests && !userInfo.name)}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Publicar Comentario
              </Button>
            </div>
          </div>
        </div>
      </form>

      <Separator />

      {/* Comments List */}
      <div className="space-y-6">
        {sortedComments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h4 className="text-lg font-medium text-muted-foreground mb-2">
              Sé el primero en comentar
            </h4>
            <p className="text-sm text-muted-foreground">
              Comparte tu opinión sobre este artículo y comienza la conversación.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {sortedComments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <CommentComponent comment={comment} />
                {index < sortedComments.length - 1 && (
                  <Separator className="mt-6" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}