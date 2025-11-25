/**
 * Componente de formulario dinámico para CRUD
 */

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RotatingWordsEditor from './home/RotatingWordsEditor';
import EnhancedStatisticsManager from './enhanced/EnhancedStatisticsManager';
import ServiceBuilder from './home/ServiceBuilder';
import EnhancedPortfolioManager from './enhanced/EnhancedPortfolioManager';
import EnhancedPillarsManager from './enhanced/EnhancedPillarsManager';
import EnhancedPoliciesManager from './enhanced/EnhancedPoliciesManager';
import TimelineEditor from './TimelineEditor';
import HeroTeamGalleryEditor from './HeroTeamGalleryEditor';
import TeamMembersEditor from './TeamMembersEditor';
import TeamMomentsEditor from './TeamMomentsEditor';
import ValuesEditor from './ValuesEditor';
import CultureStatsEditor from './CultureStatsEditor';
import TechnologiesEditor from './TechnologiesEditor';
import PreviewModal from './PreviewModal';
import ValidationPanel from './ValidationPanel';
import MediaPickerField from './MediaPickerField';
import UnifiedMediaLibrary from './UnifiedMediaLibrary';
import GalleryField from './GalleryField';
import VideoField from './VideoField';
import PdfField from './PdfField';
import ImageSelector from './ImageSelector';
import GradientSelector from './GradientSelector';
import {
  BenefitsEditor,
  CommitmentsEditor,
  ActionButtonsEditor,
  TestimonialsEditor,
  QualityObjectivesEditor,
  ScopeItemsEditor,
  ImportanceReasonsEditor
} from './iso';
import BackupManager from './BackupManager';
import { useSmartValidation } from '@/hooks/useSmartValidation';
import { useISOValidation } from '@/hooks/useISOValidation';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useFormShortcuts } from '@/hooks/useKeyboardShortcuts';
import ISOValidationPanel from './iso/ISOValidationPanel';
import ContextualHelp from './ContextualHelp';
import { getSafeNumberInputProps } from '@/lib/form-utils';
import {
  Save,
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Upload,
  Link as LinkIcon,
  Calendar,
  ChevronUp,
  ChevronDown,
  Hash,
  Type,
  ToggleLeft,
  ToggleRight,
  List,
  Tag,
  FileText,
  Eye,
  EyeOff,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Home,
  User,
  Briefcase,
  Star,
  BarChart3,
  Shield,
  Globe,
  Settings,
  Image,
  TrendingUp,
  Users,
  Award,
  RefreshCw,
  Keyboard
} from 'lucide-react';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'number' | 'date' | 'datetime-local' | 'email' | 'url' | 'password' | 'file' | 'tags' | 'markdown' | 'media' | 'image' | 'gallery' | 'video' | 'custom';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
  description?: string;
  group?: string;
  dependsOn?: {
    field: string;
    value: any;
  };
  defaultValue?: any;
  disabled?: boolean;
  width?: 'full' | 'half' | 'third';
  // Para componentes custom
  component?: 'rotating-words' | 'statistics-grid' | 'service-builder' | 'portfolio-manager' | 'pillars-editor' | 'policies-manager' | 'image-field' | 'video-field' | 'pdf-field' | 'timeline-builder' | 'statistics-builder' | 'phases-builder' | 'hero-team-gallery-editor' | 'team-members-editor' | 'team-moments-editor' | 'values-editor' | 'culture-stats-editor' | 'technologies-editor' | 'benefits-editor' | 'commitments-editor' | 'action-buttons-editor' | 'testimonials-editor' | 'quality-objectives-editor' | 'scope-items-editor' | 'gradient-selector' | 'importance-reasons-editor';
  customProps?: Record<string, any>;
  config?: Record<string, any>;
}

export interface FormGroup {
  name: string;
  label: string;
  description?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface DynamicFormProps {
  fields: FormField[];
  groups?: FormGroup[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  cancelLabel?: string;
  mode?: 'create' | 'edit';
  showPreviewButton?: boolean;
  previewComponent?: 'HomePage' | 'BlogPage' | 'PortfolioPage' | 'AboutPage';
  enableSmartValidation?: boolean;
  showValidationPanel?: boolean;
  showBackupManager?: boolean;
  backupResource?: string;
  enableISOValidation?: boolean;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
  resource?: string;
  enableKeyboardShortcuts?: boolean;
}

export default function DynamicForm({
  fields,
  groups = [],
  initialValues = {},
  onSubmit,
  onCancel,
  loading = false,
  title,
  subtitle,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  mode = 'create',
  showPreviewButton = false,
  previewComponent = 'HomePage',
  enableSmartValidation = false,
  showValidationPanel = false,
  showBackupManager = false,
  backupResource = 'unknown',
  enableISOValidation = false,
  enableAutoSave = false,
  autoSaveInterval = 30000,
  resource = 'unknown',
  enableKeyboardShortcuts = true,
  showContextualHelp = false
}: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [showPreview, setShowPreview] = useState<Record<string, boolean>>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaLibraryField, setMediaLibraryField] = useState<any>(null);
  const initialValuesRef = useRef<Record<string, any>>({});
  
  // Smart Validation
  const smartValidation = useSmartValidation(values, {
    debounceMs: 1000,
    validateOnChange: enableSmartValidation,
    fieldValidation: enableSmartValidation,
    autoSuggest: enableSmartValidation
  });

  // ISO Validation
  const isoValidation = useISOValidation(enableISOValidation ? values : {});

  // Keyboard Shortcuts
  const shortcuts = useFormShortcuts({
    onSave: () => {
      if (enableAutoSave) {
        autoSaveResult.saveNow();
      } else {
        document.querySelector('button[type="submit"]')?.click();
      }
    },
    onCancel: () => onCancel?.(),
    onPreview: showPreviewButton ? () => setShowPreviewModal(true) : undefined,
    enabled: enableKeyboardShortcuts
  });

  // Auto Save System
  const autoSaveResult = useAutoSave(values, {
    enabled: enableAutoSave,
    delay: autoSaveInterval,
    onSave: async (data) => {
      try {
        await onSubmit(data);
        return true;
      } catch (error) {
        console.error('Auto-save failed:', error);
        return false;
      }
    },
    onSaveStart: () => {
      console.log('🔄 Auto-save iniciado...');
    },
    onSaveSuccess: () => {
      console.log('✅ Auto-save exitoso');
    },
    onSaveError: (error) => {
      console.error('❌ Auto-save falló:', error);
    }
  });

  // Detect mobile screen size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Memoize initial values to prevent unnecessary re-renders
  const memoizedInitialValues = useMemo(() => {
    const hasChanged = JSON.stringify(initialValuesRef.current) !== JSON.stringify(initialValues);
    if (hasChanged) {
      initialValuesRef.current = { ...initialValues };
      console.log('📝 [DYNAMIC FORM] Valores iniciales han cambiado:', {
        hasInitialValues: !!initialValues,
        initialValuesKeys: Object.keys(initialValues || {}),
        fieldsCount: fields?.length || 0
      });
    }
    return initialValuesRef.current;
  }, [initialValues, fields?.length]);

  useEffect(() => {
    setValues(memoizedInitialValues);
  }, [memoizedInitialValues]);

  // Apply default values for fields that don't have values
  useEffect(() => {
    if (!fields || fields.length === 0) return;

    const valuesWithDefaults = { ...values };
    let hasChanges = false;

    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        const currentValue = getNestedValue(valuesWithDefaults, field.key);
        if (currentValue === undefined || currentValue === '' || currentValue === null) {
          setNestedValue(valuesWithDefaults, field.key, field.defaultValue);
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setValues(valuesWithDefaults);
    }
  }, [fields, values]);

  // Helper function to get nested values using dot notation
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  };

  // Helper function to set nested values using dot notation
  const setNestedValue = (obj: any, path: string, value: any): any => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!(key in current)) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    if (lastKey) {
      target[lastKey] = value;
    }
    return { ...obj };
  };

  useEffect(() => {
    // Initialize expanded groups only when groups change structure, not reference
    const initialExpanded: Record<string, boolean> = {};
    groups.forEach(group => {
      initialExpanded[group.name] = group.defaultExpanded ?? true;
    });
    
    // Set first group as active tab if not set
    if (!activeTab && groups.length > 0) {
      setActiveTab(groups[0].name);
    }
    
    console.log('🔧 [DYNAMIC FORM] Inicializando grupos:', {
      groupsCount: groups.length,
      groupNames: groups.map(g => g.name),
      groupsDetails: groups.map(g => ({ 
        name: g.name, 
        label: g.label, 
        collapsible: g.collapsible,
        defaultExpanded: g.defaultExpanded 
      })),
      initialExpanded,
      isMobile,
      activeTab
    });
    
    setExpandedGroups(initialExpanded);
  }, [groups.length, activeTab, isMobile]); // Only depend on groups length, not the entire groups array

  const validateField = (field: FormField, value: any): string | null => {
    // Required validation
    if (field.required) {
      const isEmpty = !value || value === '' || (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        // For select fields, be more lenient - only show error if we're sure it's empty
        if (field.type === 'select') {
          // Don't show error if field hasn't been touched yet
          if (!touched[field.key]) {
            return null;
          }
          // Also check if we have a valid selection
          const hasValidOption = field.options?.some(option => option.value === value);
          if (hasValidOption) {
            return null;
          }
        }
        return `${field.label} es requerido`;
      }
    }

    if (!value) return null;

    // Type specific validations
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Email inválido';
        }
        break;
      
      case 'url':
        try {
          new URL(value);
        } catch {
          return 'URL inválida';
        }
        break;
      
      case 'number':
        if (isNaN(value)) {
          return 'Debe ser un número válido';
        }
        if (field.validation?.min !== undefined && value < field.validation.min) {
          return `Debe ser mayor o igual a ${field.validation.min}`;
        }
        if (field.validation?.max !== undefined && value > field.validation.max) {
          return `Debe ser menor o igual a ${field.validation.max}`;
        }
        break;
    }

    // Length validations
    if (field.validation?.min && value.length < field.validation.min) {
      return `Debe tener al menos ${field.validation.min} caracteres`;
    }
    if (field.validation?.max && value.length > field.validation.max) {
      return `Debe tener máximo ${field.validation.max} caracteres`;
    }

    // Pattern validation
    if (field.validation?.pattern) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {
        return 'Formato inválido';
      }
    }

    // Custom validation
    if (field.validation?.custom) {
      return field.validation.custom(value);
    }

    return null;
  };

  // Get icon for group/section
  const getGroupIcon = (groupName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      // Home page sections
      'hero': <Home className="w-4 h-4" />,
      'introduction': <User className="w-4 h-4" />,
      'services': <Briefcase className="w-4 h-4" />,
      'portfolio': <Star className="w-4 h-4" />,
      'statistics': <BarChart3 className="w-4 h-4" />,
      'pillars': <Shield className="w-4 h-4" />,
      'policies': <Shield className="w-4 h-4" />,
      'contact': <Globe className="w-4 h-4" />,
      'seo': <Settings className="w-4 h-4" />,
      'metadata': <Settings className="w-4 h-4" />,
      'images': <Image className="w-4 h-4" />,
      'performance': <TrendingUp className="w-4 h-4" />,
      
      // Portfolio sections
      'general': <Info className="w-4 h-4" />,
      'gallery': <Image className="w-4 h-4" />,
      'technical': <Settings className="w-4 h-4" />,
      'team': <Users className="w-4 h-4" />,
      'certifications': <Award className="w-4 h-4" />,
      
      // Career sections
      'job_info': <Briefcase className="w-4 h-4" />,
      'requirements': <List className="w-4 h-4" />,
      'benefits': <Star className="w-4 h-4" />,
      'application': <User className="w-4 h-4" />,
      
      // Common sections
      'general_info': <Info className="w-4 h-4" />,
      'content': <FileText className="w-4 h-4" />,
      'configuration': <Settings className="w-4 h-4" />,
      
      // Default fallback
      'default': <FileText className="w-4 h-4" />
    };

    return iconMap[groupName.toLowerCase()] || iconMap['default'];
  };

  const handleChange = (field: FormField, value: any) => {
    setValues(prev => setNestedValue(prev, field.key, value));

    // Mark field as touched for select fields
    if (field.type === 'select') {
      setTouched(prev => ({ ...prev, [field.key]: true }));
    }

    // Clear error when user starts typing
    if (errors[field.key]) {
      setErrors(prev => ({ ...prev, [field.key]: '' }));
    }

    // Field-level smart validation
    if (enableSmartValidation) {
      smartValidation.validateField(field.key, value);
    }
  };

  // Auto-fix handler
  const handleAutoFix = (fieldKey: string, value: any) => {
    setValues(prev => setNestedValue(prev, fieldKey, value));
    setTouched(prev => ({ ...prev, [fieldKey]: true }));
  };

  const handleBlur = (field: FormField) => {
    setTouched(prev => ({ ...prev, [field.key]: true }));

    // Get current value using the same method as the form field
    const currentValue = getNestedValue(values, field.key);


    const error = validateField(field, currentValue);
    if (error) {
      setErrors(prev => ({ ...prev, [field.key]: error }));
    } else {
      // Clear error if validation passes
      setErrors(prev => ({ ...prev, [field.key]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 [DynamicForm] handleSubmit called');
    console.log('📝 [DynamicForm] Current values:', values);

    // Validate all fields
    const newErrors: Record<string, string> = {};
    (fields || []).forEach(field => {
      if (shouldShowField(field)) {
        const error = validateField(field, getNestedValue(values, field.key));
        if (error) {
          newErrors[field.key] = error;
          console.log('❌ [DynamicForm] Validation error:', field.key, error);
        }
      }
    });

    setErrors(newErrors);
    setTouched((fields || []).reduce((acc, field) => ({ ...acc, [field.key]: true }), {}));

    console.log('📝 [DynamicForm] Validation errors count:', Object.keys(newErrors).length);

    if (Object.keys(newErrors).length === 0) {
      try {
        console.log('📝 [DynamicForm] Calling onSubmit with values:', values);
        await onSubmit(values);
        console.log('✅ [DynamicForm] onSubmit completed successfully');
      } catch (error) {
        console.error('❌ [DynamicForm] Form submission error:', error);
      }
    } else {
      console.log('❌ [DynamicForm] Form has validation errors, not submitting');
      console.log('❌ [DynamicForm] Errors:', newErrors);
    }
  };

  const shouldShowField = (field: FormField): boolean => {
    if (!field.dependsOn) return true;
    
    const dependentValue = getNestedValue(values, field.dependsOn.field);
    return dependentValue === field.dependsOn.value;
  };

  const toggleGroup = (groupName: string) => {
    console.log('🔄 [DYNAMIC FORM] Toggle grupo:', {
      groupName,
      currentState: expandedGroups[groupName],
      willBe: !expandedGroups[groupName]
    });
    
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const renderField = (field: FormField) => {
    if (!shouldShowField(field)) return null;

    const value = getNestedValue(values, field.key) ?? field.defaultValue ?? '';
    const error = touched[field.key] ? errors[field.key] : '';
    const widthClass = field.width === 'half' ? 'md:col-span-1' : field.width === 'third' ? 'md:col-span-1 lg:col-span-1' : 'md:col-span-2';

    const commonInputProps = {
      id: field.key,
      name: field.key,
      disabled: field.disabled || loading,
      placeholder: field.placeholder,
      className: `block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
        error ? 'border-red-300' : 'border-gray-300'
      } ${field.disabled ? 'bg-gray-100 text-gray-500' : ''} ${
        enableSmartValidation ? smartValidation.getFieldStyles(field.key) : ''
      }`
    };

    return (
      <div key={field.key} className={`${widthClass}`}>
        <div className="flex items-start justify-between mb-1">
          <label htmlFor={field.key} className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {/* Contextual Help */}
          {showContextualHelp && (
            <ContextualHelp
              fieldKey={field.key}
              fieldType={field.type}
              shortcuts={shortcuts.getShortcutsList()}
              showShortcuts={false} // Only show in main help panel
            />
          )}
        </div>

        {field.description && (
          <p className="text-xs text-gray-500 mb-2">{field.description}</p>
        )}

        {/* Text Input */}
        {field.type === 'text' && (
          <input
            {...commonInputProps}
            type="text"
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
          />
        )}

        {/* Textarea */}
        {field.type === 'textarea' && (
          <textarea
            {...commonInputProps}
            rows={4}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
          />
        )}

        {/* Markdown with preview */}
        {field.type === 'markdown' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Markdown</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                className="flex items-center text-xs text-blue-600 hover:text-blue-800"
              >
                {showPreview[field.key] ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showPreview[field.key] ? 'Editar' : 'Vista previa'}
              </button>
            </div>
            
            {showPreview[field.key] ? (
              <div className="border border-gray-300 rounded-md p-3 bg-gray-50 min-h-32 prose prose-sm max-w-none">
                {value ? (
                  <div dangerouslySetInnerHTML={{ __html: value.replace(/\n/g, '<br/>') }} />
                ) : (
                  <p className="text-gray-400 italic">Vista previa aparecerá aquí...</p>
                )}
              </div>
            ) : (
              <textarea
                {...commonInputProps}
                rows={8}
                value={value}
                onChange={(e) => handleChange(field, e.target.value)}
                onBlur={() => handleBlur(field)}
              />
            )}
          </div>
        )}

        {/* Select */}
        {field.type === 'select' && (
          <select
            {...commonInputProps}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
          >
            <option value="">Seleccionar...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {/* Multi-select */}
        {field.type === 'multiselect' && (
          <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
            {field.options?.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const currentArray = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      handleChange(field, [...currentArray, option.value]);
                    } else {
                      handleChange(field, currentArray.filter(v => v !== option.value));
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Checkbox */}
        {field.type === 'checkbox' && (
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleChange(field, !value)}
              className="flex items-center"
            >
              {value ? (
                <ToggleRight className="w-6 h-6 text-blue-600" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
              <span className="ml-2 text-sm text-gray-700">
                {value ? 'Activado' : 'Desactivado'}
              </span>
            </button>
          </div>
        )}

        {/* Number */}
        {field.type === 'number' && (
          <input
            {...commonInputProps}
            {...getSafeNumberInputProps({
              value: value || 0,
              onChange: (newValue) => handleChange(field, newValue),
              min: field.validation?.min,
              max: field.validation?.max,
              fallback: 0
            })}
            onBlur={() => handleBlur(field)}
          />
        )}

        {/* Date */}
        {(field.type === 'date' || field.type === 'datetime-local') && (
          <input
            {...commonInputProps}
            type={field.type}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
          />
        )}

        {/* Email */}
        {field.type === 'email' && (
          <input
            {...commonInputProps}
            type="email"
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
          />
        )}

        {/* URL */}
        {field.type === 'url' && (
          <input
            {...commonInputProps}
            type="url"
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
          />
        )}

        {/* Password */}
        {field.type === 'password' && (
          <input
            {...commonInputProps}
            type="password"
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
          />
        )}

        {/* Tags */}
        {field.type === 'tags' && (
          <div>
            <input
              {...commonInputProps}
              type="text"
              value={Array.isArray(value) ? value.join(', ') : ''}
              onChange={(e) => {
                const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                handleChange(field, tags);
              }}
              onBlur={() => handleBlur(field)}
              placeholder="Separar con comas..."
            />
            {Array.isArray(value) && value.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {value.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Media picker */}
        {field.type === 'media' && (
          <MediaPickerField
            value={value || ''}
            onChange={(newValue) => handleChange(field, newValue)}
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled || loading}
            allowUpload={true}
            allowExternal={true}
            allowManualInput={true}
            category={field.validation?.pattern || 'general'}
            filters={['images']}
          />
        )}

        {/* Image Field - WordPress-style Media Library integration */}
        {field.type === 'image' && (
          <div>
            <ImageSelector
              value={value || (field.multiple ? [] : '')}
              onChange={(newValue) => handleChange(field, newValue)}
              placeholder={field.placeholder || 'Seleccionar imagen...'}
              multiSelect={field.multiple || false}
              maxImages={field.maxImages || 10}
            />
          </div>
        )}

        {/* Gallery Field - Media Library integration for multiple images */}
        {field.type === 'gallery' && (
          <div>
            <ImageSelector
              value={value || []}
              onChange={(newValue) => handleChange(field, newValue)}
              placeholder={field.placeholder || 'Seleccionar imágenes...'}
              multiSelect={true}
              maxImages={field.maxImages || 20}
              variant="gallery"
              size="md"
              acceptedTypes={field.acceptedTypes || ['jpg', 'jpeg', 'png', 'gif', 'webp']}
              required={field.required}
              error={error}
            />
          </div>
        )}

        {/* Media Selector - WordPress-style media library */}
        {field.type === 'media-selector' && (
          <div>
            <ImageSelector
              value={field.multiSelect ? (value || []) : (value || '')}
              onChange={(newValue) => handleChange(field, newValue)}
              placeholder={field.placeholder || (field.multiSelect ? 'Seleccionar imágenes...' : 'Seleccionar imagen...')}
              multiSelect={field.multiSelect || false}
              maxImages={field.maxImages || 10}
              variant={field.variant || 'card'}
              size={field.size || 'md'}
              acceptedTypes={field.acceptedTypes || ['jpg', 'jpeg', 'png', 'gif', 'webp']}
              required={field.required}
              error={error}
            />
          </div>
        )}

        {/* Video Field - Enhanced video input with upload/external toggle */}
        {field.type === 'video' && (
          <div>
            <VideoField
              value={value || ''}
              onChange={(newValue) => handleChange(field, newValue)}
              label="" // No mostrar label en el componente ya que DynamicForm ya lo muestra
              placeholder={field.placeholder}
              required={false} // No mostrar asterisco ya que DynamicForm ya lo muestra
              disabled={field.disabled || loading}
              description="" // No mostrar description ya que DynamicForm ya la muestra
              allowYouTube={field.customProps?.allowYouTube !== false}
              allowVimeo={field.customProps?.allowVimeo !== false}
            />
          </div>
        )}

        {/* Custom Components */}
        {field.type === 'custom' && field.component === 'rotating-words' && (
          <RotatingWordsEditor
            words={Array.isArray(value) ? value : []}
            onChange={(words) => handleChange(field, words)}
            {...field.customProps}
          />
        )}
        
        {field.type === 'custom' && field.component === 'statistics-grid' && (
          <EnhancedStatisticsManager
            statistics={Array.isArray(value) ? value : []}
            onChange={(statistics) => handleChange(field, statistics)}
            {...field.customProps}
          />
        )}
        
        {field.type === 'custom' && field.component === 'service-builder' && (
          <ServiceBuilder
            mainService={value?.main_service || {}}
            secondaryServices={Array.isArray(value?.secondary_services) ? value.secondary_services : (Array.isArray(value?.services_list) ? value.services_list : [])}
            onChange={(services) => handleChange(field, services)}
            sectionTitle={value?.section?.title || ''}
            sectionSubtitle={value?.section?.subtitle || ''}
            {...field.customProps}
          />
        )}
        
        {field.type === 'custom' && field.component === 'portfolio-manager' && (
          <EnhancedPortfolioManager
            projects={Array.isArray(value) ? value : []}
            onChange={(projects) => handleChange(field, projects)}
            {...field.customProps}
          />
        )}
        
        {field.type === 'custom' && field.component === 'pillars-editor' && (
          <EnhancedPillarsManager
            pillars={Array.isArray(value) ? value : []}
            onChange={(pillars) => handleChange(field, pillars)}
            {...field.customProps}
          />
        )}
        
        {field.type === 'custom' && field.component === 'policies-manager' && (
          <EnhancedPoliciesManager
            policies={Array.isArray(value) ? value : []}
            onChange={(policies) => handleChange(field, policies)}
            {...field.customProps}
          />
        )}
        
        {/* Nuevos componentes para historia.json */}
        {field.type === 'custom' && field.component === 'image-field' && (
          <ImageSelector
            value={value || ''}
            onChange={(newValue) => handleChange(field, newValue)}
            label={field.label}
            description={field.description}
            variant="card"
            placeholder="Seleccionar imagen..."
            required={field.required || false}
            disabled={field.disabled || false}
          />
        )}
        
        {field.type === 'custom' && field.component === 'video-field' && (
          <VideoField
            value={value || ''}
            onChange={(newValue) => handleChange(field, newValue)}
            label={field.label}
            description={field.description}
            required={field.required || false}
            disabled={field.disabled || false}
          />
        )}
        
        {field.type === 'custom' && field.component === 'pdf-field' && (
          <PdfField
            value={value || ''}
            onChange={(newValue) => handleChange(field, newValue)}
            label={field.label}
            description={field.description}
            required={field.required || false}
            uploadEndpoint={
              field.key === 'hero.certificate_details.pdf_url'
                ? '/api/upload/iso-certificate'
                : '/api/upload'
            }
            disabled={field.disabled || false}
          />
        )}
        
        {field.type === 'custom' && field.component === 'timeline-builder' && (
          <TimelineEditor
            events={Array.isArray(value) ? value : []}
            onChange={(events) => handleChange(field, events)}
            {...field.customProps}
          />
        )}
        
        {field.type === 'custom' && field.component === 'statistics-builder' && (
          <>
            {(() => {
              console.log('🔍 [DYNAMIC FORM] statistics-builder value:', value);
              console.log('🔍 [DYNAMIC FORM] field.key:', field.key);
              console.log('🔍 [DYNAMIC FORM] value type:', typeof value, Array.isArray(value));

              if (Array.isArray(value)) {
                console.log('🔍 [DYNAMIC FORM] Array contents:', value);
                value.forEach((item, index) => {
                  console.log(`🔍 [DYNAMIC FORM] Item ${index}:`, item);
                });
              }

              return null;
            })()}
            <EnhancedStatisticsManager
              statistics={(() => {
                const rawValue = Array.isArray(value) ? value : [];
                console.log('🔄 [TRANSFORM] Raw value:', rawValue);

                // Transformar del formato Firestore al formato EnhancedStatisticsManager
                const transformedStats = rawValue.map((metric: any, index: number) => {
                  // Si ya está en formato transformado (tiene 'id'), devolverlo tal como está
                  if (metric && metric.id) {
                    console.log('🔄 [TRANSFORM] Ya transformado:', metric);
                    return metric;
                  }

                  // Si está en formato Firestore (tiene 'number'), transformarlo
                  if (metric && metric.number !== undefined) {
                    console.log('🔄 [TRANSFORM] Formato Firestore:', metric);

                    // Extraer número y sufijo del campo "number"
                    const numberStr = metric.number || '0';
                    const matches = numberStr.match(/^(\$|€)?([0-9.,]+)([+%KMB]*)$/);

                    let prefix = '';
                    let numValue = 0;
                    let suffix = '';

                    if (matches) {
                      prefix = matches[1] || '';
                      numValue = parseFloat(matches[2].replace(/,/g, '')) || 0;
                      suffix = matches[3] || '';
                    } else {
                      // Fallback: intentar extraer solo el número
                      const numMatch = numberStr.match(/([0-9.,]+)/);
                      numValue = numMatch ? parseFloat(numMatch[1].replace(/,/g, '')) : 0;
                      // Todo lo que no sea número lo ponemos como sufijo
                      suffix = numberStr.replace(/[0-9.,]/g, '').trim();
                    }

                    const transformed = {
                      id: `metric-${metric.index || index}`,
                      icon: metric.icon || 'Award', // Leer del Firestore o usar Award por defecto
                      value: numValue,
                      suffix: suffix,
                      prefix: prefix,
                      label: metric.label || 'Sin etiqueta',
                      description: metric.description || ''
                    };

                    console.log('🔄 [TRANSFORM] Transformado a:', transformed);
                    return transformed;
                  }

                  // Fallback para datos incompletos
                  console.log('🔄 [TRANSFORM] Datos incompletos, creando vacío:', metric);
                  return {
                    id: `metric-fallback-${index}`,
                    icon: 'Award',
                    value: 0,
                    suffix: '',
                    prefix: '',
                    label: 'Sin etiqueta',
                    description: ''
                  };
                });

                console.log('🔄 [TRANSFORM] Resultado final:', transformedStats);
                return transformedStats;
              })()}
              onChange={(statistics) => {
                console.log('🔄 [SAVE TRANSFORM] Recibiendo para guardar:', statistics);

                // Transformar de vuelta al formato Firestore para guardar
                const backTransformed = statistics.map((stat: any, index: number) => {
                  // Reconstruir el campo "number" combinando prefix + value + suffix
                  let numberStr = '';
                  if (stat.prefix) numberStr += stat.prefix;
                  if (stat.value !== undefined && stat.value !== null) {
                    numberStr += stat.value.toString();
                  }
                  if (stat.suffix) numberStr += stat.suffix;

                  const result = {
                    index: index,
                    label: stat.label || 'Sin etiqueta',
                    description: stat.description || '',
                    number: numberStr || '0',
                    icon: stat.icon || 'Award'
                  };

                  console.log('🔄 [SAVE TRANSFORM] Item transformado:', result);
                  return result;
                });

                console.log('🔄 [SAVE TRANSFORM] Resultado final para guardar:', backTransformed);
                handleChange(field, backTransformed);
              }}
              title={field.label}
              description={field.description}
              config={field.config}
              {...field.customProps}
            />
          </>
        )}
        
        {field.type === 'custom' && field.component === 'phases-builder' && (
          <div className="border rounded-lg p-4 bg-gradient-to-r from-cyan-50 to-red-50">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-cyan-600" />
              <h3 className="font-semibold text-cyan-900">Editor de Fases</h3>
              <span className="text-xs bg-cyan-200 text-cyan-800 px-2 py-1 rounded">Evolutivo</span>
            </div>
            <p className="text-sm text-cyan-700 mb-4">
              {field.description || 'Editor de fases cronológicas de desarrollo empresarial.'}
            </p>
            <div className="space-y-3 text-sm text-cyan-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Fases: {Array.isArray(value) ? value.length : 0} de {field.config?.maxPhases || 8}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Con períodos, enfoques y logros por fase</span>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
                <p className="text-yellow-700 text-xs">
                  <strong>Próximamente:</strong> Editor visual para fases evolutivas. 
                  Actualmente editando {Array.isArray(value) ? value.length : 0} fases desde JSON.
                </p>
              </div>
            </div>
          </div>
        )}

        {field.type === 'custom' && field.component === 'hero-team-gallery-editor' && (
          <HeroTeamGalleryEditor
            value={Array.isArray(value) ? value : []}
            onChange={(newValue) => handleChange(field, newValue)}
            disabled={field.disabled || loading}
          />
        )}

        {field.type === 'custom' && field.component === 'team-members-editor' && (
          <TeamMembersEditor
            value={Array.isArray(value) ? value : []}
            onChange={(newValue) => handleChange(field, newValue)}
            disabled={field.disabled || loading}
          />
        )}

        {field.type === 'custom' && field.component === 'team-moments-editor' && (
          <TeamMomentsEditor
            value={Array.isArray(value) ? value : []}
            onChange={(newValue) => handleChange(field, newValue)}
            disabled={field.disabled || loading}
          />
        )}

        {field.type === 'custom' && field.component === 'gallery-field' && (
          <GalleryField
            value={value || []}
            onChange={(newValue) => handleChange(field, newValue)}
            label={field.label}
            placeholder={field.customProps?.placeholder || 'Agregar imágenes...'}
            required={field.required}
            disabled={field.disabled || loading}
            description={field.description}
            galleryType={field.customProps?.galleryType || 'simple'}
          />
        )}
        {field.type === 'custom' && field.component === 'values-editor' && (
          <ValuesEditor
            value={Array.isArray(value) ? value : []}
            onChange={(newValue) => handleChange(field, newValue)}
            disabled={field.disabled || loading}
          />
        )}
        {field.type === 'custom' && field.component === 'culture-stats-editor' && (
          <CultureStatsEditor
            value={value || { section: { title: '', subtitle: '' }, categories: {} }}
            onChange={(newValue) => handleChange(field, newValue)}
            disabled={field.disabled || loading}
          />
        )}
        {field.type === 'custom' && field.component === 'technologies-editor' && (
          <TechnologiesEditor
            value={value || { section: { title: '', subtitle: '' }, tech_list: [] }}
            onChange={(newValue) => handleChange(field, newValue)}
            disabled={field.disabled || loading}
          />
        )}

        {/* ISO Components */}
        {field.type === 'custom' && field.component === 'benefits-editor' && (
          <BenefitsEditor
            value={Array.isArray(value) ? value : []}
            onChange={(newValue) => handleChange(field, newValue)}
            disabled={field.disabled || loading}
            maxBenefits={field.customProps?.maxBenefits || 8}
          />
        )}

        {field.type === 'custom' && field.component === 'commitments-editor' && (
          <CommitmentsEditor
            value={Array.isArray(value) ? value : []}
            onChange={(newValue) => handleChange(field, newValue)}
            disabled={field.disabled || loading}
            maxCommitments={field.customProps?.maxCommitments || 8}
          />
        )}

        {field.type === 'custom' && field.component === 'action-buttons-editor' && (
          <ActionButtonsEditor
            value={Array.isArray(value) ? value : []}
            onChange={(newValue) => handleChange(field, newValue)}
            disabled={field.disabled || loading}
            maxButtons={field.customProps?.maxButtons || 4}
          />
        )}


        {field.type === 'custom' && field.component === 'testimonials-editor' && (
          <TestimonialsEditor
            value={Array.isArray(value) ? value : []}
            onChange={(newValue) => handleChange(field, newValue)}
            disabled={field.disabled || loading}
            maxTestimonials={field.customProps?.maxTestimonials || 10}
          />
        )}

        {field.type === 'custom' && field.component === 'quality-objectives-editor' && (
          <QualityObjectivesEditor
            value={Array.isArray(value) ? value : []}
            onChange={(newValue) => handleChange(field, newValue)}
            disabled={field.disabled || loading}
            maxObjectives={field.customProps?.maxObjectives || 10}
          />
        )}

        {field.type === 'custom' && field.component === 'scope-items-editor' && (
          <ScopeItemsEditor
            value={Array.isArray(value) ? value : []}
            onChange={(newValue) => handleChange(field, newValue)}
            disabled={field.disabled || loading}
            maxItems={field.customProps?.maxItems || 10}
            title={field.customProps?.title}
            description={field.customProps?.description}
            placeholder={field.customProps?.placeholder}
          />
        )}
        {field.type === 'custom' && field.component === 'gradient-selector' && (
          <GradientSelector
            value={value || ''}
            onChange={(newValue) => handleChange(field, newValue)}
            disabled={field.disabled || loading}
            defaultColors={field.customProps?.defaultColors}
          />
        )}
        {field.type === 'custom' && field.component === 'importance-reasons-editor' && (
          <ImportanceReasonsEditor
            value={Array.isArray(value) ? value : []}
            onChange={(newValue) => handleChange(field, newValue)}
            disabled={field.disabled || loading}
            maxReasons={field.customProps?.maxReasons || 6}
            title={field.customProps?.title}
            description={field.customProps?.description}
          />
        )}

        {/* Array Fields */}
        {field.type === 'array' && field.arrayFields && (() => {
          const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

          const toggleExpanded = (index: number) => {
            const newExpanded = new Set(expandedItems);
            if (newExpanded.has(index)) {
              newExpanded.delete(index);
            } else {
              newExpanded.add(index);
            }
            setExpandedItems(newExpanded);
          };

          const moveItem = (fromIndex: number, toIndex: number) => {
            if (toIndex < 0 || toIndex >= value.length) return;
            const newArray = [...value];
            const [movedItem] = newArray.splice(fromIndex, 1);
            newArray.splice(toIndex, 0, movedItem);
            handleChange(field, newArray);
          };

          const getItemDisplayName = (item: any, index: number) => {
            // Verificar que el item existe
            if (!item) {
              return `Elemento ${index + 1}`;
            }

            // Intentar obtener un nombre descriptivo del item
            const titleField = field.arrayFields?.find(f => f.key === 'title' || f.key === 'name');
            const authorField = field.arrayFields?.find(f => f.key === 'author');

            if (titleField && item[titleField.key]) {
              return item[titleField.key];
            } else if (authorField && item[authorField.key]) {
              return item[authorField.key];
            }
            return `Elemento ${index + 1}`;
          };

          return (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    {field.label} ({Array.isArray(value) ? value.length : 0} elementos)
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const currentArray = Array.isArray(value) ? value : [];
                      const newItem = {};
                      field.arrayFields?.forEach(arrayField => {
                        newItem[arrayField.key] = arrayField.defaultValue || '';
                      });
                      handleChange(field, [...currentArray, newItem]);
                      // Auto-expandir el nuevo elemento
                      setTimeout(() => {
                        setExpandedItems(prev => new Set(prev).add(currentArray.length));
                      }, 100);
                    }}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    disabled={field.disabled || loading}
                  >
                    + Agregar elemento
                  </button>
                </div>

                {Array.isArray(value) && value.length > 0 ? (
                  <div className="space-y-3">
                    {value.map((item, index) => {
                      const isExpanded = expandedItems.has(index);
                      const displayName = getItemDisplayName(item, index);

                      return (
                        <div key={`${index}-${item.id || index}`} className="border border-gray-200 rounded-lg bg-white shadow-sm">
                          {/* Header del acordeón */}
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg">
                            <div className="flex items-center space-x-3">
                              {/* Controles de orden */}
                              <div className="flex flex-col space-y-1">
                                <button
                                  type="button"
                                  onClick={() => moveItem(index, index - 1)}
                                  disabled={index === 0 || field.disabled || loading}
                                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Mover arriba"
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveItem(index, index + 1)}
                                  disabled={index === value.length - 1 || field.disabled || loading}
                                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Mover abajo"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </button>
                              </div>

                              {/* Título del elemento */}
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                  {index + 1}
                                </span>
                                <h5 className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                  {displayName}
                                </h5>
                              </div>
                            </div>

                            {/* Controles */}
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => toggleExpanded(index)}
                                className="px-3 py-1 text-xs bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                                disabled={field.disabled || loading}
                              >
                                {isExpanded ? 'Contraer' : 'Editar'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const newArray = [...value];
                                  newArray.splice(index, 1);
                                  handleChange(field, newArray);
                                  // Remover de expandidos
                                  setExpandedItems(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(index);
                                    return newSet;
                                  });
                                }}
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                disabled={field.disabled || loading}
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>

                          {/* Contenido expandible */}
                          {isExpanded && (
                            <div className="p-4 border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {field.arrayFields?.map(arrayField => {
                                  const arrayFieldValue = item[arrayField.key] || arrayField.defaultValue || '';
                                  const arrayFieldError = errors[`${field.key}.${index}.${arrayField.key}`];

                                  return (
                                    <div key={arrayField.key} className={arrayField.width === 'full' ? 'md:col-span-2' : ''}>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        {arrayField.label}
                                        {arrayField.required && <span className="text-red-500 ml-1">*</span>}
                                      </label>

                                      {arrayField.type === 'text' && (
                                        <input
                                          type="text"
                                          value={arrayFieldValue}
                                          placeholder={arrayField.placeholder}
                                          onChange={(e) => {
                                            const newArray = [...value];
                                            newArray[index] = { ...newArray[index], [arrayField.key]: e.target.value };
                                            handleChange(field, newArray);
                                          }}
                                          className={`block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            arrayFieldError ? 'border-red-300' : 'border-gray-300'
                                          }`}
                                          disabled={field.disabled || loading}
                                        />
                                      )}

                                      {arrayField.type === 'textarea' && (
                                        <textarea
                                          value={arrayFieldValue}
                                          placeholder={arrayField.placeholder}
                                          rows={arrayField.rows || 3}
                                          onChange={(e) => {
                                            const newArray = [...value];
                                            newArray[index] = { ...newArray[index], [arrayField.key]: e.target.value };
                                            handleChange(field, newArray);
                                          }}
                                          className={`block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            arrayFieldError ? 'border-red-300' : 'border-gray-300'
                                          }`}
                                          disabled={field.disabled || loading}
                                        />
                                      )}

                                      {arrayField.type === 'number' && (
                                        <input
                                          type="number"
                                          value={arrayFieldValue}
                                          placeholder={arrayField.placeholder}
                                          min={arrayField.min}
                                          max={arrayField.max}
                                          onChange={(e) => {
                                            const newArray = [...value];
                                            newArray[index] = { ...newArray[index], [arrayField.key]: parseFloat(e.target.value) || 0 };
                                            handleChange(field, newArray);
                                          }}
                                          className={`block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            arrayFieldError ? 'border-red-300' : 'border-gray-300'
                                          }`}
                                          disabled={field.disabled || loading}
                                        />
                                      )}

                                      {arrayField.type === 'icon' && (
                                        <select
                                          value={arrayFieldValue}
                                          onChange={(e) => {
                                            const newArray = [...value];
                                            newArray[index] = { ...newArray[index], [arrayField.key]: e.target.value };
                                            handleChange(field, newArray);
                                          }}
                                          className={`block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            arrayFieldError ? 'border-red-300' : 'border-gray-300'
                                          }`}
                                          disabled={field.disabled || loading}
                                        >
                                          <option value="">Seleccionar ícono...</option>
                                          <option value="Award">🏆 Premio (Award)</option>
                                          <option value="Building">🏢 Edificio (Building)</option>
                                          <option value="Building2">🏛️ Edificio 2 (Building2)</option>
                                          <option value="Users">👥 Usuarios (Users)</option>
                                          <option value="Clock">⏰ Reloj (Clock)</option>
                                          <option value="Star">⭐ Estrella (Star)</option>
                                          <option value="Target">🎯 Objetivo (Target)</option>
                                          <option value="TrendingUp">📈 Tendencia (TrendingUp)</option>
                                          <option value="Shield">🛡️ Escudo (Shield)</option>
                                          <option value="Heart">❤️ Corazón (Heart)</option>
                                          <option value="GraduationCap">🎓 Graduación (GraduationCap)</option>
                                          <option value="Truck">🚚 Camión (Truck)</option>
                                          <option value="Home">🏠 Casa (Home)</option>
                                          <option value="Settings">⚙️ Configuración (Settings)</option>
                                          <option value="Cpu">💻 CPU (Cpu)</option>
                                          <option value="Factory">🏭 Fábrica (Factory)</option>
                                          <option value="DollarSign">💵 Dólar (DollarSign)</option>
                                        </select>
                                      )}

                                      {arrayField.type === 'color' && (
                                        <div className="flex gap-2">
                                          <input
                                            type="color"
                                            value={arrayFieldValue || '#00A8E8'}
                                            onChange={(e) => {
                                              const newArray = [...value];
                                              newArray[index] = { ...newArray[index], [arrayField.key]: e.target.value };
                                              handleChange(field, newArray);
                                            }}
                                            className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                                            disabled={field.disabled || loading}
                                          />
                                          <input
                                            type="text"
                                            value={arrayFieldValue || '#00A8E8'}
                                            onChange={(e) => {
                                              const newArray = [...value];
                                              newArray[index] = { ...newArray[index], [arrayField.key]: e.target.value };
                                              handleChange(field, newArray);
                                            }}
                                            placeholder="#00A8E8"
                                            className={`flex-1 px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                              arrayFieldError ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            disabled={field.disabled || loading}
                                          />
                                        </div>
                                      )}

                                      {arrayField.type === 'multitext' && (
                                        <textarea
                                          value={Array.isArray(arrayFieldValue) ? arrayFieldValue.join('\n') : arrayFieldValue}
                                          placeholder={arrayField.placeholder || 'Una métrica por línea'}
                                          rows={arrayField.rows || 4}
                                          onChange={(e) => {
                                            const newArray = [...value];
                                            const lines = e.target.value.split('\n').filter(line => line.trim());
                                            newArray[index] = { ...newArray[index], [arrayField.key]: lines };
                                            handleChange(field, newArray);
                                          }}
                                          className={`block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            arrayFieldError ? 'border-red-300' : 'border-gray-300'
                                          }`}
                                          disabled={field.disabled || loading}
                                        />
                                      )}

                                      {arrayField.type === 'boolean' && (
                                        <div className="flex items-center gap-2 py-2">
                                          <input
                                            type="checkbox"
                                            checked={arrayFieldValue === true}
                                            onChange={(e) => {
                                              const newArray = [...value];
                                              newArray[index] = { ...newArray[index], [arrayField.key]: e.target.checked };
                                              handleChange(field, newArray);
                                            }}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                            disabled={field.disabled || loading}
                                          />
                                          <span className="text-xs text-gray-600">
                                            {arrayFieldValue ? 'Activado' : 'Desactivado'}
                                          </span>
                                        </div>
                                      )}

                                      {arrayField.type === 'select' && arrayField.options && (
                                        <select
                                          value={arrayFieldValue}
                                          onChange={(e) => {
                                            const newArray = [...value];
                                            newArray[index] = { ...newArray[index], [arrayField.key]: e.target.value };
                                            handleChange(field, newArray);
                                          }}
                                          className={`block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            arrayFieldError ? 'border-red-300' : 'border-gray-300'
                                          }`}
                                          disabled={field.disabled || loading}
                                        >
                                          <option value="">Seleccionar...</option>
                                          {arrayField.options.map((opt: any) => (
                                            <option key={opt.value} value={opt.value}>
                                              {opt.label}
                                            </option>
                                          ))}
                                        </select>
                                      )}

                                      {arrayField.type === 'image' && (
                                        <div className="space-y-2">
                                          {arrayFieldValue && arrayFieldValue.trim() !== '' && (
                                            <div className="relative group">
                                              <div className="w-20 h-20 bg-gray-100 rounded border overflow-hidden">
                                                <img
                                                  src={arrayFieldValue}
                                                  alt="Preview"
                                                  className="w-full h-full object-cover"
                                                  onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo disponible%3C/text%3E%3C/svg%3E';
                                                  }}
                                                />
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const newArray = [...value];
                                                  newArray[index] = { ...newArray[index], [arrayField.key]: '' };
                                                  handleChange(field, newArray);
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                              >
                                                <X className="w-3 h-3" />
                                              </button>
                                            </div>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setMediaLibraryField({
                                                ...arrayField,
                                                arrayIndex: index,
                                                parentArrayField: field
                                              });
                                              setShowMediaLibrary(true);
                                            }}
                                            className="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-700"
                                          >
                                            <Upload className="w-4 h-4" />
                                            {arrayFieldValue ? 'Cambiar imagen' : (arrayField.placeholder || 'Seleccionar imagen')}
                                          </button>
                                        </div>
                                      )}

                                      {arrayField.description && (
                                        <p className="text-xs text-gray-500 mt-1">{arrayField.description}</p>
                                      )}

                                      {arrayFieldError && (
                                        <p className="text-xs text-red-500 mt-1">{arrayFieldError}</p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No hay elementos agregados</p>
                    <p className="text-xs">Haz clic en "Agregar elemento" para comenzar</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Smart Validation Feedback */}
        {enableSmartValidation && (() => {
          const fieldValidation = smartValidation.getFieldValidation(field.key);
          const primaryRule = fieldValidation.rules.find(r => r.severity === 'error') || 
                             fieldValidation.rules.find(r => r.severity === 'warning') ||
                             fieldValidation.rules.find(r => r.severity === 'info') ||
                             fieldValidation.rules.find(r => r.severity === 'success');
          
          if (primaryRule) {
            const Icon = primaryRule.severity === 'error' ? AlertCircle :
                        primaryRule.severity === 'warning' ? AlertTriangle :
                        primaryRule.severity === 'info' ? Info :
                        CheckCircle;
            
            const textColor = primaryRule.severity === 'error' ? 'text-red-600' :
                             primaryRule.severity === 'warning' ? 'text-yellow-600' :
                             primaryRule.severity === 'info' ? 'text-blue-600' :
                             'text-green-600';
                             
            return (
              <div className="mt-1">
                <p className={`text-xs ${textColor} flex items-center`}>
                  <Icon className="w-3 h-3 mr-1" />
                  {primaryRule.message}
                </p>
                {primaryRule.suggestion && (
                  <p className="text-xs text-gray-500 mt-0.5 ml-4">
                    💡 {primaryRule.suggestion}
                  </p>
                )}
                {primaryRule.autoFix && (
                  <button
                    type="button"
                    onClick={() => handleAutoFix(field.key, primaryRule.autoFix)}
                    className="text-xs text-purple-600 hover:text-purple-800 underline mt-1 ml-4"
                  >
                    ✨ Auto-corregir
                  </button>
                )}
              </div>
            );
          }
          return null;
        })()}

        {/* Error message */}
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </p>
        )}
      </div>
    );
  };

  const renderGroup = (groupName: string, groupFields: FormField[]) => {
    const group = groups.find(g => g.name === groupName);
    const isExpanded = expandedGroups[groupName];

    console.log('🎨 [DYNAMIC FORM] Renderizando grupo:', {
      groupName,
      hasGroup: !!group,
      groupLabel: group?.label,
      isCollapsible: group?.collapsible,
      isExpanded,
      fieldsCount: groupFields.length
    });

    if (!group) {
      console.log('⚠️ [DYNAMIC FORM] Grupo no encontrado, renderizando sin header:', groupName);
      return (
        <div key={groupName} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groupFields.map(renderField)}
        </div>
      );
    }

    return (
      <div key={groupName} className="border border-gray-200 rounded-lg">
        <div
          className={`px-6 py-4 bg-gray-50 border-b border-gray-200 ${group.collapsible ? 'cursor-pointer' : ''}`}
          onClick={() => group.collapsible && toggleGroup(groupName)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{group.label}</h3>
              {group.description && (
                <p className="mt-1 text-sm text-gray-500">{group.description}</p>
              )}
            </div>
            {group.collapsible && (
              <button type="button" className="text-gray-400 hover:text-gray-600">
                {isExpanded ? '−' : '+'}
              </button>
            )}
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groupFields.map(renderField)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Group fields
  const groupedFields = (fields || []).reduce((acc, field) => {
    const groupName = field.group || 'default';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(field);
    return acc;
  }, {} as Record<string, FormField[]>);

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
              {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
            </div>
            
            {/* Auto-save Status */}
            {enableAutoSave && (
              <div className="ml-4 flex items-center space-x-2">
                {autoSaveResult.isSaving ? (
                  <div className="flex items-center text-blue-600">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm font-medium">Guardando...</span>
                  </div>
                ) : autoSaveResult.hasUnsavedChanges ? (
                  <div className="flex items-center text-yellow-600">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Cambios sin guardar</span>
                  </div>
                ) : autoSaveResult.lastSaved && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      Guardado {new Date(autoSaveResult.lastSaved).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                
                {autoSaveResult.saveError && (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Error al guardar</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        {groups.length > 1 ? (
          // Unified Tabs Layout for All Editors - Like Portfolio but Responsive
          isMobile ? (
            // Mobile: Accordion Layout
            <div className="space-y-4">
              {Object.entries(groupedFields).map(([groupName, groupFields]) =>
                renderGroup(groupName, groupFields)
              )}
            </div>
          ) : (
            // Desktop: Single Row Horizontal Tabs with Icons and Scroll
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Single Row Scrollable Tabs */}
              <div className="mb-6">
                <div className="relative">
                  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-2">
                    <TabsList className="inline-flex h-12 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground min-w-max">
                      {groups.map((group) => (
                        <TabsTrigger 
                          key={group.name} 
                          value={group.name}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex-shrink-0 min-w-0 max-w-32 mr-1 last:mr-0"
                          title={group.label}
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            {/* Icon for section */}
                            <div className="flex-shrink-0">
                              {getGroupIcon(group.name)}
                            </div>
                            {/* Truncated text with ellipsis */}
                            <span className="truncate text-xs">
                              {group.label.length > 8 ? `${group.label.substring(0, 8)}...` : group.label}
                            </span>
                          </div>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                  
                  {/* Fade indicators for scroll */}
                  <div className="absolute left-0 top-0 bottom-2 w-4 bg-gradient-to-r from-white via-white to-transparent pointer-events-none z-10"></div>
                  <div className="absolute right-0 top-0 bottom-2 w-4 bg-gradient-to-l from-white via-white to-transparent pointer-events-none z-10"></div>
                </div>
                
                {/* Navigation helper for many tabs */}
                {groups.length > 8 && (
                  <div className="mt-2 flex items-center justify-center">
                    <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {groups.findIndex(g => g.name === activeTab) + 1} de {groups.length}: {groups.find(g => g.name === activeTab)?.label}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Tab Content */}
              {groups.map((group) => (
                <TabsContent key={group.name} value={group.name} className="mt-0">
                  <div className="border border-gray-200 rounded-lg">
                    {/* Tab Content Header - Clean and Simple */}
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getGroupIcon(group.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{group.label}</h3>
                          {group.description && (
                            <p className="text-sm text-gray-600 mt-0.5 truncate">{group.description}</p>
                          )}
                        </div>
                        {groups.length > 8 && (
                          <div className="flex-shrink-0">
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                              {groups.findIndex(g => g.name === group.name) + 1}/{groups.length}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Tab Content Fields */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {(groupedFields[group.name] || []).map(renderField)}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )
        ) : (
          // Single group or no groups: Simple layout
          <div className="space-y-8">
            {Object.entries(groupedFields).map(([groupName, groupFields]) =>
              renderGroup(groupName, groupFields)
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
          {/* Preview Button */}
          {showPreviewButton && (
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              <Monitor className="w-4 h-4 mr-2 inline" />
              Preview
            </button>
          )}
          
          <div className="flex items-center space-x-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <X className="w-4 h-4 mr-2 inline" />
                {cancelLabel}
              </button>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2 inline" />
                  {submitLabel}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Smart Validation Panel */}
      {enableSmartValidation && showValidationPanel && (
        <div className="mt-6">
          <ValidationPanel
            validationResult={smartValidation.validationResult}
            isValidating={smartValidation.isValidating}
            onApplyAutoFix={handleAutoFix}
            onValidate={smartValidation.validate}
          />
        </div>
      )}

      {/* ISO Validation Panel */}
      {enableISOValidation && (
        <div className="mt-6">
          <ISOValidationPanel
            data={values}
            className=""
          />
        </div>
      )}


      {/* Backup Manager */}
      {showBackupManager && (
        <div className="mt-6 border-t pt-6">
          <BackupManager
            resource={backupResource}
            data={values}
            onRestore={(backupData) => {
              setValues(backupData);
              // Clear any validation errors when restoring
              setErrors({});
              setTouched({});
            }}
          />
        </div>
      )}

      {/* Performance monitoring removed */}

      {/* Preview Modal */}
      {showPreviewButton && (
        <PreviewModal
          isOpen={showPreviewModal}
          data={values}
          onClose={() => setShowPreviewModal(false)}
          component={previewComponent}
          title={`Preview: ${title || previewComponent}`}
        />
      )}

      {/* Unified Media Library Modal */}
      {mediaLibraryField && (
        <UnifiedMediaLibrary
          isOpen={showMediaLibrary}
          onClose={() => {
            setShowMediaLibrary(false);
            setMediaLibraryField(null);
          }}
          onSelect={(selectedImages) => {
            const imageUrls = selectedImages.map(img => img.url);

            // Check si es un campo dentro de un array
            if (mediaLibraryField.arrayIndex !== undefined && mediaLibraryField.parentArrayField) {
              const parentField = mediaLibraryField.parentArrayField;
              const arrayIndex = mediaLibraryField.arrayIndex;
              const currentArray = Array.isArray(values[parentField.key]) ? values[parentField.key] : [];
              const newArray = [...currentArray];
              newArray[arrayIndex] = {
                ...newArray[arrayIndex],
                [mediaLibraryField.key]: imageUrls[0] || ''
              };
              handleChange(parentField, newArray);
            } else if (mediaLibraryField.multiple) {
              // Modo múltiple: agregar a las imágenes existentes
              const currentImages = (values[mediaLibraryField.key] || []) as string[];
              handleChange(mediaLibraryField, [...currentImages, ...imageUrls]);
            } else {
              // Modo único: reemplazar con la primera imagen
              handleChange(mediaLibraryField, imageUrls[0] || '');
            }
            setShowMediaLibrary(false);
            setMediaLibraryField(null);
          }}
          multiSelect={mediaLibraryField.multiple || false}
          selectedImages={(() => {
            // Si es un campo de array
            if (mediaLibraryField.arrayIndex !== undefined && mediaLibraryField.parentArrayField) {
              const parentField = mediaLibraryField.parentArrayField;
              const arrayIndex = mediaLibraryField.arrayIndex;
              const currentArray = Array.isArray(values[parentField.key]) ? values[parentField.key] : [];
              const currentValue = currentArray[arrayIndex]?.[mediaLibraryField.key];
              return currentValue ? [currentValue] : [];
            }
            // Campo normal
            if (mediaLibraryField.multiple) {
              return (values[mediaLibraryField.key] || []) as string[];
            }
            return values[mediaLibraryField.key] ? [values[mediaLibraryField.key] as string] : [];
          })()}
          title={mediaLibraryField.label || 'Seleccionar Imagen'}
        />
      )}
    </div>
  );
}