#!/usr/bin/env node

/**
 * Script para analizar la estructura completa de los archivos JSON
 * Genera un mapa detallado de tipos, campos y patrones
 */

const fs = require('fs');
const path = require('path');

class JSONAnalyzer {
  constructor() {
    this.analysis = {
      collections: {},
      fieldTypes: new Set(),
      commonPatterns: {},
      relationships: [],
      inconsistencies: []
    };
  }

  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      const relativePath = path.relative('public/json', filePath);
      const category = this.categorizeFile(relativePath);
      
      console.log(`\n📄 Analizando: ${relativePath}`);
      
      const structure = this.analyzeStructure(data, '');
      
      this.analysis.collections[relativePath] = {
        category,
        size: this.getObjectSize(data),
        structure,
        sampleData: this.extractSample(data)
      };
      
    } catch (error) {
      console.error(`❌ Error analizando ${filePath}:`, error.message);
    }
  }

  categorizeFile(relativePath) {
    if (relativePath.startsWith('pages/')) return 'static_page';
    if (relativePath.startsWith('dynamic-content/')) return 'dynamic_content';
    return 'unknown';
  }

  analyzeStructure(obj, prefix = '') {
    const structure = {};
    
    if (Array.isArray(obj)) {
      if (obj.length > 0) {
        structure.type = 'array';
        structure.itemType = this.getType(obj[0]);
        structure.length = obj.length;
        if (typeof obj[0] === 'object') {
          structure.itemStructure = this.analyzeStructure(obj[0], prefix);
        }
      } else {
        structure.type = 'empty_array';
      }
    } else if (obj && typeof obj === 'object') {
      structure.type = 'object';
      structure.fields = {};
      
      for (const [key, value] of Object.entries(obj)) {
        const fieldPath = prefix ? `${prefix}.${key}` : key;
        this.analysis.fieldTypes.add(fieldPath);
        
        structure.fields[key] = {
          type: this.getType(value),
          required: true, // Asumir requerido por ahora
          sample: this.getSample(value)
        };
        
        if (typeof value === 'object' && value !== null) {
          structure.fields[key].structure = this.analyzeStructure(value, fieldPath);
        }
      }
    } else {
      structure.type = this.getType(obj);
      structure.sample = this.getSample(obj);
    }
    
    return structure;
  }

  getType(value) {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    if (typeof value === 'object') return 'object';
    if (typeof value === 'string') {
      // Detectar patrones especiales
      if (value.match(/^https?:\/\//)) return 'url';
      if (value.match(/^\/[^\/]/)) return 'path';
      if (value.match(/^#[0-9A-F]{6}$/i)) return 'color';
      if (value.match(/^\d{4}-\d{2}-\d{2}/)) return 'date';
      if (value.match(/^[a-z0-9-]+$/)) return 'slug';
      return 'string';
    }
    return typeof value;
  }

  getSample(value) {
    if (typeof value === 'string') {
      return value.length > 100 ? value.substring(0, 100) + '...' : value;
    }
    return value;
  }

  extractSample(data) {
    const sample = {};
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        sample[key] = `Array(${value.length})`;
      } else if (typeof value === 'object') {
        sample[key] = `Object(${Object.keys(value).length} keys)`;
      } else {
        sample[key] = this.getSample(value);
      }
    }
    return sample;
  }

  getObjectSize(obj) {
    return JSON.stringify(obj).length;
  }

  findRelationships() {
    console.log('\n🔗 Analizando relaciones entre colecciones...');
    
    // Buscar campos que podrían ser relaciones
    for (const [collectionName, collection] of Object.entries(this.analysis.collections)) {
      this.scanForRelations(collection.structure, collectionName);
    }
  }

  scanForRelations(structure, collectionName, path = '') {
    if (structure.type === 'object' && structure.fields) {
      for (const [fieldName, field] of Object.entries(structure.fields)) {
        const fullPath = path ? `${path}.${fieldName}` : fieldName;
        
        // Detectar IDs de relación
        if (fieldName.endsWith('_id') || fieldName.endsWith('_ids')) {
          this.analysis.relationships.push({
            source: collectionName,
            field: fullPath,
            type: fieldName.endsWith('_ids') ? 'many' : 'one',
            target: fieldName.replace(/_ids?$/, '')
          });
        }
        
        if (field.structure) {
          this.scanForRelations(field.structure, collectionName, fullPath);
        }
      }
    } else if (structure.type === 'array' && structure.itemStructure) {
      this.scanForRelations(structure.itemStructure, collectionName, path + '[]');
    }
  }

  detectInconsistencies() {
    console.log('\n⚠️  Detectando inconsistencias...');
    
    // Agrupar por campos similares
    const fieldGroups = {};
    
    for (const [collectionName, collection] of Object.entries(this.analysis.collections)) {
      this.groupFields(collection.structure, collectionName, fieldGroups);
    }
    
    // Buscar inconsistencias en tipos
    for (const [fieldName, occurrences] of Object.entries(fieldGroups)) {
      const types = new Set(occurrences.map(o => o.type));
      if (types.size > 1) {
        this.analysis.inconsistencies.push({
          field: fieldName,
          issue: 'type_mismatch',
          details: occurrences
        });
      }
    }
  }

  groupFields(structure, collectionName, groups, path = '') {
    if (structure.type === 'object' && structure.fields) {
      for (const [fieldName, field] of Object.entries(structure.fields)) {
        const fullPath = path ? `${path}.${fieldName}` : fieldName;
        
        if (!groups[fieldName]) groups[fieldName] = [];
        groups[fieldName].push({
          collection: collectionName,
          path: fullPath,
          type: field.type,
          sample: field.sample
        });
        
        if (field.structure) {
          this.groupFields(field.structure, collectionName, groups, fullPath);
        }
      }
    } else if (structure.type === 'array' && structure.itemStructure) {
      this.groupFields(structure.itemStructure, collectionName, groups, path + '[]');
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 REPORTE DE ANÁLISIS JSON');
    console.log('='.repeat(80));
    
    // Resumen general
    console.log('\n📈 RESUMEN GENERAL:');
    console.log(`   • Total de archivos: ${Object.keys(this.analysis.collections).length}`);
    console.log(`   • Páginas estáticas: ${Object.values(this.analysis.collections).filter(c => c.category === 'static_page').length}`);
    console.log(`   • Contenido dinámico: ${Object.values(this.analysis.collections).filter(c => c.category === 'dynamic_content').length}`);
    console.log(`   • Campos únicos encontrados: ${this.analysis.fieldTypes.size}`);
    
    // Colecciones por categoría
    console.log('\n📁 COLECCIONES POR CATEGORÍA:');
    
    const categories = {};
    for (const [name, collection] of Object.entries(this.analysis.collections)) {
      if (!categories[collection.category]) categories[collection.category] = [];
      categories[collection.category].push({ name, ...collection });
    }
    
    for (const [category, collections] of Object.entries(categories)) {
      console.log(`\n   ${category.toUpperCase()}:`);
      collections.forEach(col => {
        console.log(`   • ${col.name} (${col.size} bytes)`);
        console.log(`     Estructura: ${this.describeStructure(col.structure)}`);
      });
    }
    
    // Relaciones encontradas
    if (this.analysis.relationships.length > 0) {
      console.log('\n🔗 RELACIONES DETECTADAS:');
      this.analysis.relationships.forEach(rel => {
        console.log(`   • ${rel.source} → ${rel.field} (${rel.type}) → ${rel.target}`);
      });
    }
    
    // Inconsistencias
    if (this.analysis.inconsistencies.length > 0) {
      console.log('\n⚠️  INCONSISTENCIAS ENCONTRADAS:');
      this.analysis.inconsistencies.forEach(inc => {
        console.log(`   • Campo "${inc.field}": ${inc.issue}`);
        inc.details.forEach(detail => {
          console.log(`     - ${detail.collection}: ${detail.type} (${detail.sample})`);
        });
      });
    } else {
      console.log('\n✅ No se encontraron inconsistencias importantes');
    }
    
    // Recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    console.log('   • Crear schemas JSON para validación automática');
    console.log('   • Implementar sistema de bloqueo para escrituras concurrentes');
    console.log('   • Considerar caché en memoria para lecturas frecuentes');
    if (this.analysis.inconsistencies.length > 0) {
      console.log('   • Resolver inconsistencias de tipos antes de implementar CRUD');
    }
    
    return this.analysis;
  }

  describeStructure(structure) {
    if (structure.type === 'object') {
      const fieldCount = Object.keys(structure.fields || {}).length;
      return `Object con ${fieldCount} campos`;
    } else if (structure.type === 'array') {
      return `Array de ${structure.itemType} (${structure.length || 0} items)`;
    }
    return structure.type;
  }

  saveAnalysis() {
    const outputPath = path.join(__dirname, '../data/json-analysis.json');
    
    // Crear directorio si no existe
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Convertir Set a Array para JSON
    const output = {
      ...this.analysis,
      fieldTypes: Array.from(this.analysis.fieldTypes),
      generatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\n💾 Análisis guardado en: ${outputPath}`);
  }
}

async function main() {
  const analyzer = new JSONAnalyzer();
  const jsonDir = path.join(__dirname, '../public/json');
  
  console.log('🔍 Iniciando análisis de estructura JSON...');
  console.log(`📂 Directorio base: ${jsonDir}`);
  
  // Función recursiva para encontrar todos los .json
  function findJsonFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...findJsonFiles(fullPath));
      } else if (item.endsWith('.json')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  const jsonFiles = findJsonFiles(jsonDir);
  console.log(`📋 Encontrados ${jsonFiles.length} archivos JSON`);
  
  // Analizar cada archivo
  for (const file of jsonFiles) {
    analyzer.analyzeFile(file);
  }
  
  // Análisis adicional
  analyzer.findRelationships();
  analyzer.detectInconsistencies();
  
  // Generar reporte
  const analysis = analyzer.generateReport();
  
  // Guardar análisis
  analyzer.saveAnalysis();
  
  console.log('\n✅ Análisis completado exitosamente');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = JSONAnalyzer;