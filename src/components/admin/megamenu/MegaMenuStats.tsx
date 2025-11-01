'use client';

import React, { useMemo } from 'react';
import { 
  Menu, 
  Link, 
  Image, 
  Activity, 
  MousePointer,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface MegaMenuItem {
  id: string;
  order: number;
  enabled: boolean;
  type: 'megamenu' | 'simple';
  label: string;
  href?: string | null;
  icon: string;
  description: string;
  is_internal?: boolean;
  page_mapping?: string;
  click_count: number;
  created_at: string;
  updated_at: string;
  submenu?: {
    layout: string;
    section1: {
      title: string;
      description: string;
      highlight_color: string;
    };
    links: Array<{
      id: string;
      title: string;
      description: string;
      href: string;
      icon: string;
      enabled: boolean;
      is_internal: boolean;
      page_mapping: string;
      order: number;
      click_count: number;
    }>;
    section3: {
      type: string;
      title: string;
      description: string;
      image: string;
      cta: {
        text: string;
        href: string;
        type: string;
        page_mapping?: string;
      };
      background_gradient: string;
    };
  };
}

interface MegaMenuStatsProps {
  items: MegaMenuItem[];
  analytics?: {
    total_clicks: number;
    most_clicked_item: string | null;
    last_interaction: string | null;
    popular_links: any[];
  };
}

const MegaMenuStats: React.FC<MegaMenuStatsProps> = ({ items, analytics }) => {
  // Calcular estadísticas avanzadas
  const stats = useMemo(() => {
    const totalMenus = items.length;
    const enabledMenus = items.filter(item => item.enabled).length;
    const megaMenus = items.filter(item => item.type === 'megamenu').length;
    const simpleMenus = items.filter(item => item.type === 'simple').length;
    
    // Contar enlaces totales
    const totalLinks = items.reduce((acc, item) => {
      if (item.type === 'megamenu' && item.submenu) {
        return acc + item.submenu.links.length;
      }
      return acc + (item.href ? 1 : 0);
    }, 0);

    // Contar enlaces activos
    const activeLinks = items.reduce((acc, item) => {
      if (item.type === 'megamenu' && item.submenu) {
        return acc + item.submenu.links.filter(link => link.enabled).length;
      }
      return acc + (item.href && item.enabled ? 1 : 0);
    }, 0);
    
    // Contar imágenes promocionales
    const totalImages = items.filter(item => 
      item.type === 'megamenu' && item.submenu?.section3?.image
    ).length;

    // Calcular total de clicks
    const totalClicks = items.reduce((acc, item) => {
      let itemClicks = item.click_count || 0;
      if (item.type === 'megamenu' && item.submenu) {
        itemClicks += item.submenu.links.reduce((subAcc, link) => subAcc + (link.click_count || 0), 0);
      }
      return acc + itemClicks;
    }, 0);

    // Encontrar el item más clickeado
    const mostClickedItem = items.reduce((max, item) => {
      let itemTotalClicks = item.click_count || 0;
      if (item.type === 'megamenu' && item.submenu) {
        itemTotalClicks += item.submenu.links.reduce((subAcc, link) => subAcc + (link.click_count || 0), 0);
      }
      return itemTotalClicks > (max?.totalClicks || 0) ? 
        { ...item, totalClicks: itemTotalClicks } : max;
    }, null as any);

    // Calcular porcentajes
    const activePercentage = totalMenus > 0 ? Math.round((enabledMenus / totalMenus) * 100) : 0;
    const linksActivePercentage = totalLinks > 0 ? Math.round((activeLinks / totalLinks) * 100) : 0;
    const megaMenuPercentage = totalMenus > 0 ? Math.round((megaMenus / totalMenus) * 100) : 0;

    // Items recientes (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentItems = items.filter(item => 
      new Date(item.updated_at) > sevenDaysAgo || new Date(item.created_at) > sevenDaysAgo
    ).length;

    return {
      totalMenus,
      enabledMenus,
      megaMenus,
      simpleMenus,
      totalLinks,
      activeLinks,
      totalImages,
      totalClicks,
      mostClickedItem,
      activePercentage,
      linksActivePercentage,
      megaMenuPercentage,
      recentItems
    };
  }, [items]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Estadística Principal - Total de Menús */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">{isNaN(stats.totalMenus) ? 0 : stats.totalMenus}</p>
              <p className="text-sm text-muted-foreground">Menús Totales</p>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={isNaN(stats.activePercentage) ? 0 : stats.activePercentage} className="w-12 h-2" />
                <span className="text-xs text-muted-foreground">{isNaN(stats.activePercentage) ? 0 : stats.activePercentage}% activos</span>
              </div>
            </div>
            <Menu className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Enlaces Totales */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{isNaN(stats.totalLinks) ? 0 : stats.totalLinks}</p>
              <p className="text-sm text-muted-foreground">Enlaces</p>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={isNaN(stats.linksActivePercentage) ? 0 : stats.linksActivePercentage} className="w-12 h-2" />
                <span className="text-xs text-muted-foreground">{isNaN(stats.activeLinks) ? 0 : stats.activeLinks} activos</span>
              </div>
            </div>
            <Link className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* Imágenes y CTAs */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600">{isNaN(stats.totalImages) ? 0 : stats.totalImages}</p>
              <p className="text-sm text-muted-foreground">Imágenes</p>
              <div className="flex items-center gap-1 mt-2">
                <Badge variant="outline" className="text-xs">
                  Promocionales
                </Badge>
              </div>
            </div>
            <Image className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      {/* Interacciones */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-cyan-600">{isNaN(stats.totalClicks) ? 0 : stats.totalClicks}</p>
              <p className="text-sm text-muted-foreground">Total Clicks</p>
              {stats.mostClickedItem && (
                <div className="flex items-center gap-1 mt-2">
                  <MousePointer className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">
                    Más popular: {stats.mostClickedItem.label}
                  </span>
                </div>
              )}
            </div>
            <Activity className="h-8 w-8 text-cyan-600" />
          </div>
        </CardContent>
      </Card>


    </div>
  );
};

export default MegaMenuStats;