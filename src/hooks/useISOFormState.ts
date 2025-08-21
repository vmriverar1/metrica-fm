'use client'

import { useState, useCallback, useEffect } from 'react'
import { 
  validateField, 
  validateObject, 
  ValidationErrors, 
  ISO_FIELD_VALIDATIONS 
} from '@/lib/iso-validation'

export interface FormState<T> {
  data: T
  errors: ValidationErrors
  hasChanges: boolean
  isValid: boolean
  isDirty: boolean
}

export interface FormActions<T> {
  updateField: (path: string, value: any) => void
  setData: (data: T) => void
  reset: () => void
  validate: () => boolean
  validateField: (path: string) => string | null
  clearErrors: () => void
  setError: (path: string, error: string) => void
}

export function useISOFormState<T extends Record<string, any>>(
  formType: 'hero' | 'policy' | 'metrics',
  initialData: T
): [FormState<T>, FormActions<T>] {
  const [data, setDataState] = useState<T>(initialData)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const validations = ISO_FIELD_VALIDATIONS[formType] || {}

  // Función para obtener valor anidado
  const getNestedValue = useCallback((obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }, [])

  // Función para establecer valor anidado
  const setNestedValue = useCallback((obj: any, path: string, value: any): any => {
    const keys = path.split('.')
    const result = { ...obj }
    let current = result

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      } else {
        current[key] = { ...current[key] }
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
    return result
  }, [])

  // Validar campo individual
  const validateSingleField = useCallback((path: string, value?: any): string | null => {
    const fieldValue = value !== undefined ? value : getNestedValue(data, path)
    return validateField(path, fieldValue, validations, data)
  }, [data, validations, getNestedValue])

  // Validar todo el formulario
  const validateAll = useCallback((): boolean => {
    const result = validateObject(data, validations)
    setErrors(result.errors)
    return result.isValid
  }, [data, validations])

  // Calcular si el formulario es válido
  const isValid = Object.keys(errors).length === 0

  // Acciones del formulario
  const updateField = useCallback((path: string, value: any) => {
    // Actualizar datos
    const newData = setNestedValue(data, path, value)
    setDataState(newData)
    setHasChanges(true)
    setIsDirty(true)

    // Validar el campo actualizado
    const fieldError = validateField(path, value, validations, newData)
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors }
      if (fieldError) {
        newErrors[path] = fieldError
      } else {
        delete newErrors[path]
      }
      return newErrors
    })
  }, [data, validations, setNestedValue])

  const setData = useCallback((newData: T) => {
    setDataState(newData)
    setHasChanges(true)
    setIsDirty(true)
    // Limpiar errores al establecer nuevos datos
    setErrors({})
  }, [])

  const reset = useCallback(() => {
    setDataState(initialData)
    setErrors({})
    setHasChanges(false)
    setIsDirty(false)
  }, [initialData])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const setError = useCallback((path: string, error: string) => {
    setErrors(prevErrors => ({
      ...prevErrors,
      [path]: error
    }))
  }, [])

  // Estado del formulario
  const formState: FormState<T> = {
    data,
    errors,
    hasChanges,
    isValid,
    isDirty
  }

  // Acciones del formulario
  const formActions: FormActions<T> = {
    updateField,
    setData,
    reset,
    validate: validateAll,
    validateField: validateSingleField,
    clearErrors,
    setError
  }

  return [formState, formActions]
}

// Hook específico para manejar arrays (como KPIs, compromisos, etc.)
export function useISOArrayState<T extends { id?: string }>(
  initialItems: T[],
  createNewItem: () => T
) {
  const [items, setItems] = useState<T[]>(initialItems)
  const [editingId, setEditingId] = useState<string | null>(null)

  const addItem = useCallback(() => {
    const newItem = createNewItem()
    const newId = newItem.id || `item-${Date.now()}`
    const itemWithId = { ...newItem, id: newId } as T
    
    setItems(prev => [...prev, itemWithId])
    setEditingId(newId)
    return itemWithId
  }, [createNewItem])

  const updateItem = useCallback((index: number, updates: Partial<T>) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ))
  }, [])

  const deleteItem = useCallback((index: number) => {
    setItems(prev => {
      const newItems = prev.filter((_, i) => i !== index)
      // Si estamos editando el elemento que se elimina, limpiar el estado de edición
      const deletedItem = prev[index]
      if (deletedItem.id === editingId) {
        setEditingId(null)
      }
      return newItems
    })
  }, [editingId])

  const reorderItems = useCallback((fromIndex: number, toIndex: number) => {
    setItems(prev => {
      const newItems = [...prev]
      const [movedItem] = newItems.splice(fromIndex, 1)
      newItems.splice(toIndex, 0, movedItem)
      return newItems
    })
  }, [])

  const toggleEdit = useCallback((id: string | null) => {
    setEditingId(prev => prev === id ? null : id)
  }, [])

  return {
    items,
    editingId,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    toggleEdit,
    setItems,
    setEditingId
  }
}

// Hook para manejar el estado de guardado/sincronización
export function useISOSaveState() {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const save = useCallback(async <T>(
    data: T,
    saveFunction: (data: T) => Promise<void>
  ): Promise<boolean> => {
    setIsSaving(true)
    setSaveError(null)
    
    try {
      await saveFunction(data)
      setLastSaved(new Date())
      return true
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Error al guardar')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  const clearSaveError = useCallback(() => {
    setSaveError(null)
  }, [])

  return {
    isSaving,
    lastSaved,
    saveError,
    save,
    clearSaveError
  }
}

// Hook combinado para formularios ISO completos
export function useISOEditor<T extends Record<string, any>>(
  formType: 'hero' | 'policy' | 'metrics',
  initialData: T,
  saveFunction?: (data: T) => Promise<void>
) {
  const [formState, formActions] = useISOFormState(formType, initialData)
  const { isSaving, lastSaved, saveError, save, clearSaveError } = useISOSaveState()

  const handleSave = useCallback(async (): Promise<boolean> => {
    // Validar antes de guardar
    const isValid = formActions.validate()
    if (!isValid) {
      return false
    }

    if (saveFunction) {
      const success = await save(formState.data, saveFunction)
      return success
    }

    return true
  }, [formState.data, formActions, save, saveFunction])

  // Auto-validación cuando cambian los datos
  useEffect(() => {
    if (formState.isDirty) {
      formActions.validate()
    }
  }, [formState.data, formState.isDirty, formActions])

  return {
    // Estado del formulario
    ...formState,
    
    // Acciones del formulario
    ...formActions,
    
    // Estado de guardado
    isSaving,
    lastSaved,
    saveError,
    
    // Funciones de guardado
    handleSave,
    clearSaveError
  }
}