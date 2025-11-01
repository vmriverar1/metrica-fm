'use client';

import React, { Suspense } from 'react';
import { 
  ProgressiveEnhancementProvider, 
  useProgressiveEnhancement,
  withProgressiveEnhancement 
} from './ProgressiveEnhancer';
import { LazyLoadingMonitor } from './LazySection';
import { HOME_LAZY_SECTIONS } from './sections/LazyHomeSections';
import DynamicForm, { DynamicFormProps } from './DynamicForm';

// Enhanced DynamicForm con Progressive Enhancement
interface EnhancedDynamicFormProps extends DynamicFormProps {
  enableProgressiveEnhancement?: boolean;
  enableLazyLoading?: boolean;
  enableIntelligentCache?: boolean;
}

const EnhancedDynamicFormCore: React.FC<EnhancedDynamicFormProps> = ({
  enableProgressiveEnhancement = true,
  enableLazyLoading = true,
  enableIntelligentCache = true,
  ...formProps
}) => {
  const { isFeatureEnabled, isFeatureLoaded } = useProgressiveEnhancement();

  // Cache functionality removed

  // Configurar features basadas en props
  const enhancedProps = {
    ...formProps,
    // Progressive enhancement de features
    enableSmartValidation: formProps.enableSmartValidation && isFeatureLoaded('smart-validation'),
    showPreviewButton: formProps.showPreviewButton && isFeatureLoaded('preview-system'),
    showValidationPanel: formProps.showValidationPanel && isFeatureLoaded('smart-validation'),
    showBackupManager: formProps.showBackupManager && isFeatureLoaded('backup-system'),
  };

  return (
    <div className="enhanced-dynamic-form">
      {/* Core Form - Siempre disponible */}
      <DynamicForm {...enhancedProps} />
      
      {/* Enhanced Features - Solo si están habilitadas */}
      {enableLazyLoading && isFeatureEnabled('specialized-editors') && (
        <Suspense fallback={<div className="text-sm text-gray-500">Cargando monitoreo...</div>}>
          <LazyLoadingMonitor
            sections={HOME_LAZY_SECTIONS}
            onStatsUpdate={(stats) => {
                console.log('📊 Lazy Loading Stats:', stats);
              }}
            
          />
        </Suspense>
      )}
      
      {/* Cache Monitor - Solo para desarrollo y monitoreo avanzado */}
      {enableIntelligentCache && 
       isFeatureEnabled('intelligent-caching') && 
       process.env.NODE_ENV === 'development' && (
        <Suspense fallback={null}>
        </Suspense>
      )}
    </div>
  );
};

// Wrapper con Progressive Enhancement
const EnhancedDynamicForm: React.FC<EnhancedDynamicFormProps> = (props) => {
  if (!props.enableProgressiveEnhancement) {
    // Fallback a formulario básico sin enhancements
    return <DynamicForm {...props} />;
  }

  return (
    <ProgressiveEnhancementProvider
      initialConfig={{
        enableAutoUpgrade: true,
        maxConcurrentLoads: 2, // Limitado para mejor performance
        performanceThresholds: {
          cpu: 60,
          memory: 75,
          network: 'fast'
        }
      }}
    >
      <EnhancedDynamicFormCore {...props} />
    </ProgressiveEnhancementProvider>
  );
};

// HOC para componentes que requieren características específicas
export const HomeEditorWithEnhancements = withProgressiveEnhancement(
  EnhancedDynamicForm,
  ['basic-editing', 'form-validation', 'data-persistence'] // Features mínimas requeridas
);

// Versión especializada para home.json con todas las optimizaciones
export const OptimizedHomeEditor: React.FC<Omit<EnhancedDynamicFormProps, 'enableProgressiveEnhancement'>> = (props) => {
  return (
    <EnhancedDynamicForm
      {...props}
      enableProgressiveEnhancement={true}
      enableLazyLoading={true}
      enableIntelligentCache={true}
      // Features específicas para home.json
      showPreviewButton={true}
      enableSmartValidation={true}
      showValidationPanel={true}
      showBackupManager={true}
    />
  );
};

// Hook personalizado para gestionar el estado de enhancement
export const useHomeEditorEnhancements = () => {
  const { getActiveLevel, isFeatureEnabled, loadFeature } = useProgressiveEnhancement();
  
  const enableRecommendedFeatures = async () => {
    const recommendations = [
      'smart-validation',
      'preview-system',
      'auto-save',
      'specialized-editors'
    ];
    
    for (const featureId of recommendations) {
      if (!isFeatureEnabled(featureId)) {
        await loadFeature(featureId);
      }
    }
  };
  
  const enableAdvancedFeatures = async () => {
    const advanced = [
      'bulk-operations',
      'version-control',
      'backup-system',
      'intelligent-caching'
    ];
    
    for (const featureId of advanced) {
      if (!isFeatureEnabled(featureId)) {
        await loadFeature(featureId);
      }
    }
  };
  
  return {
    activeLevel: getActiveLevel(),
    enableRecommendedFeatures,
    enableAdvancedFeatures,
    isFeatureEnabled
  };
};

export default EnhancedDynamicForm;