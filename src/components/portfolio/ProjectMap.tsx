'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, ExternalLink, Building2 } from 'lucide-react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Project, getCategoryLabel, getCategoryColor } from '@/types/portfolio';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// Leaflet types (will be loaded dynamically)
interface LeafletMap {
  setView: (center: [number, number], zoom: number) => void;
  flyTo: (center: [number, number], zoom: number, options?: any) => void;
  remove: () => void;
}

interface LeafletMarker {
  remove: () => void;
  bindPopup: (content: string) => LeafletMarker;
  on: (event: string, handler: Function) => LeafletMarker;
}

interface ProjectMapProps {
  className?: string;
}

export default function ProjectMap({ className }: ProjectMapProps) {
  const { filteredProjects, filters, setFilters } = usePortfolio();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Dynamically load Leaflet
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      try {
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS
        const L = await import('leaflet');
        
        // Fix default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        setLeafletLoaded(true);
      } catch (error) {
        console.error('Error loading Leaflet:', error);
      }
    };

    loadLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;

    const initializeMap = async () => {
      const L = (await import('leaflet')).default;

      const map = L.map(mapRef.current!, {
        center: [-12.0464, -77.0428], // Lima, Peru
        zoom: 6,
        zoomControl: true,
        attributionControl: true
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map as any;
      setIsMapLoaded(true);
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded]);

  // Update markers when projects change
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !leafletLoaded) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Group projects by location to create clusters
      const locationGroups = new Map<string, Project[]>();
      
      filteredProjects.forEach(project => {
        const key = `${project.location.coordinates[0]},${project.location.coordinates[1]}`;
        if (!locationGroups.has(key)) {
          locationGroups.set(key, []);
        }
        locationGroups.get(key)!.push(project);
      });

      // Create markers for each location group
      locationGroups.forEach((projects, locationKey) => {
        const firstProject = projects[0];
        const [lat, lng] = firstProject.location.coordinates;

        // Create custom marker based on category
        const categoryColors = {
          oficina: '#3B82F6',
          retail: '#F97316', 
          industria: '#6B7280',
          hoteleria: '#8B5CF6',
          educacion: '#10B981',
          vivienda: '#F59E0B',
          salud: '#EF4444'
        };

        const color = categoryColors[firstProject.category as keyof typeof categoryColors] || '#6B7280';
        
        // Create simple, reliable custom icon
        const markerHtml = projects.length > 1 
          ? `<div class="marker-main" style="background-color: ${color}"><div class="marker-inner"></div><span class="marker-count">${projects.length}</span></div>`
          : `<div class="marker-main" style="background-color: ${color}"><div class="marker-inner"></div></div>`;
        
        const customIcon = L.divIcon({
          className: 'portfolio-marker',
          html: markerHtml,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current!);

        // Add click handler
        marker.on('click', () => {
          if (projects.length === 1) {
            setSelectedProject(projects[0]);
          } else {
            // If multiple projects, show the first one and allow cycling
            setSelectedProject(projects[0]);
          }
          
          // Fly to location
          mapInstanceRef.current!.flyTo([lat, lng], 12, {
            duration: 1.5
          });
        });

        markersRef.current.push(marker as any);
      });
    };

    updateMarkers();
  }, [filteredProjects, isMapLoaded, leafletLoaded]);

  const closeProjectDetails = () => {
    setSelectedProject(null);
  };

  const handleViewProject = (project: Project) => {
    window.open(`/portfolio/${project.category}/${project.slug}`, '_blank');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Map container */}
      <div 
        ref={mapRef} 
        className="w-full h-[500px] md:h-[600px] rounded-xl shadow-lg overflow-hidden"
        style={{ zIndex: 1 }}
      />

      {/* Loading overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-muted rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando mapa...</p>
          </div>
        </div>
      )}

      {/* Project details panel */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-4 right-4 w-80 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-10"
          >
            {/* Project image */}
            <div className="relative h-48">
              <Image
                src={selectedProject.featuredImage}
                alt={selectedProject.title}
                fill
                className="object-cover"
                sizes="320px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Close button */}
              <button
                onClick={closeProjectDetails}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Category badge */}
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white bg-black/50 backdrop-blur-sm`}>
                  {getCategoryLabel(selectedProject.category)}
                </span>
              </div>
            </div>

            {/* Project info */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2">
                {selectedProject.title}
              </h3>
              
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">
                  {selectedProject.location.city}, {selectedProject.location.region}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {selectedProject.shortDescription}
              </p>

              {/* Project details */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Área:</span>
                  <div className="font-medium">{selectedProject.details.area}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Año:</span>
                  <div className="font-medium">{selectedProject.completedAt.getFullYear()}</div>
                </div>
              </div>

              {/* Action button */}
              <Button
                onClick={() => handleViewProject(selectedProject)}
                className="w-full"
                size="sm"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Ver Proyecto Completo
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
        <h4 className="font-medium text-sm mb-2">Categorías</h4>
        <div className="space-y-1">
          {Object.entries({
            oficina: '#3B82F6',
            retail: '#F97316',
            industria: '#6B7280',
            hoteleria: '#8B5CF6',
            educacion: '#10B981',
            vivienda: '#F59E0B',
            salud: '#EF4444'
          }).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs capitalize">{getCategoryLabel(category as any)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}