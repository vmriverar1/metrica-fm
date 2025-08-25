/**
 * Componente de formulario dinámico para CRUD
 */

'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RotatingWordsEditor from './home/RotatingWordsEditor';
import StatisticsGrid from './home/StatisticsGrid';
import ServiceBuilder from './home/ServiceBuilder';
import PortfolioManager from './home/PortfolioManager';
import PillarsEditor from './home/PillarsEditor';
import PoliciesManager from './home/PoliciesManager';
import PreviewModal from './PreviewModal';
import ValidationPanel from './ValidationPanel';
import MediaPickerField from './MediaPickerField';
import ImageField from './ImageField';
import GalleryField from './GalleryField';
import BackupManager from './BackupManager';
import PerformanceMonitor from './PerformanceMonitor';
import { useSmartValidation } from '@/hooks/useSmartValidation';
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
  Award
} from 'lucide-react';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'number' | 'date' | 'datetime-local' | 'email' | 'url' | 'password' | 'file' | 'tags' | 'markdown' | 'media' | 'custom';
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
  component?: 'rotating-words' | 'statistics-grid' | 'service-builder' | 'portfolio-manager' | 'pillars-editor' | 'policies-manager';
  customProps?: Record<string, any>;
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
  showPerformanceMonitor?: boolean;
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
  showPerformanceMonitor = false
}: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [showPreview, setShowPreview] = useState<Record<string, boolean>>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  
  // Smart Validation
  const smartValidation = useSmartValidation(values, {
    debounceMs: 1000,
    validateOnChange: enableSmartValidation,
    fieldValidation: enableSmartValidation,
    autoSuggest: enableSmartValidation
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

  useEffect(() => {
    console.log('📝 [DYNAMIC FORM] Recibiendo valores iniciales:', {
      hasInitialValues: !!initialValues,
      initialValuesKeys: initialValues ? Object.keys(initialValues) : [],
      sampleValues: initialValues ? {
        page: initialValues.page,
        introduction: initialValues.introduction,
        hasTimelineEvents: !!initialValues.timeline_events,
        hasAchievementSummary: !!initialValues.achievement_summary
      } : null,
      fieldsCount: fields?.length || 0
    });
    
    setValues(initialValues);
  }, [initialValues]);

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
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} es requerido`;
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
    
    const error = validateField(field, values[field.key]);
    if (error) {
      setErrors(prev => ({ ...prev, [field.key]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    (fields || []).forEach(field => {
      if (shouldShowField(field)) {
        const error = validateField(field, getNestedValue(values, field.key));
        if (error) {
          newErrors[field.key] = error;
        }
      }
    });

    setErrors(newErrors);
    setTouched((fields || []).reduce((acc, field) => ({ ...acc, [field.key]: true }), {}));

    if (Object.keys(newErrors).length === 0) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
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
        <label htmlFor={field.key} className="block text-sm font-medium text-gray-700 mb-1">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>

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
            type="number"
            value={value}
            min={field.validation?.min}
            max={field.validation?.max}
            onChange={(e) => handleChange(field, e.target.value ? Number(e.target.value) : '')}
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

        {/* Image Field - Enhanced image input with upload/external toggle */}
        {field.type === 'image' && (
          <div>
            <ImageField
              value={value || ''}
              onChange={(newValue) => handleChange(field, newValue)}
              label="" // No mostrar label en el componente ya que DynamicForm ya lo muestra
              placeholder={field.placeholder}
              required={false} // No mostrar asterisco ya que DynamicForm ya lo muestra
              disabled={field.disabled || loading}
              description="" // No mostrar description ya que DynamicForm ya la muestra
            />
          </div>
        )}

        {/* Gallery Field - Enhanced gallery management with multiple images */}
        {field.type === 'gallery' && (
          <div>
            <GalleryField
              value={value || []}
              onChange={(newValue) => handleChange(field, newValue)}
              label="" // No mostrar label en el componente ya que DynamicForm ya lo muestra
              placeholder={field.placeholder}
              required={false} // No mostrar asterisco ya que DynamicForm ya lo muestra
              disabled={field.disabled || loading}
              description="" // No mostrar description ya que DynamicForm ya la muestra
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
          <StatisticsGrid
            statistics={Array.isArray(value) ? value : []}
            onChange={(statistics) => handleChange(field, statistics)}
            {...field.customProps}
          />
        )}
        
        {field.type === 'custom' && field.component === 'service-builder' && (
          <ServiceBuilder
            mainService={value?.main_service || {}}
            secondaryServices={Array.isArray(value?.secondary_services) ? value.secondary_services : []}
            onChange={(services) => handleChange(field, services)}
            {...field.customProps}
          />
        )}
        
        {field.type === 'custom' && field.component === 'portfolio-manager' && (
          <PortfolioManager
            projects={Array.isArray(value) ? value : []}
            onChange={(projects) => handleChange(field, projects)}
            {...field.customProps}
          />
        )}
        
        {field.type === 'custom' && field.component === 'pillars-editor' && (
          <PillarsEditor
            pillars={Array.isArray(value) ? value : []}
            onChange={(pillars) => handleChange(field, pillars)}
            {...field.customProps}
          />
        )}
        
        {field.type === 'custom' && field.component === 'policies-manager' && (
          <PoliciesManager
            policies={Array.isArray(value) ? value : []}
            onChange={(policies) => handleChange(field, policies)}
            {...field.customProps}
          />
        )}

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
          {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
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

      {/* Performance Monitor */}
      {showPerformanceMonitor && (
        <div className="mt-6 border-t pt-6">
          <PerformanceMonitor
            resource={backupResource}
            realTime={true}
            showSystemMetrics={true}
            showUserMetrics={true}
          />
        </div>
      )}

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
    </div>
  );
}