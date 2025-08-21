#!/usr/bin/env node

/**
 * Script para validar archivos JSON existentes contra los schemas creados
 * Identifica incompatibilidades y sugiere correcciones
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

class JSONValidator {
  constructor() {
    this.ajv = new Ajv({ 
      allErrors: true, 
      verbose: true,
      strict: false  // Permitir propiedades adicionales por ahora
    });
    addFormats(this.ajv);
    
    this.schemas = {};
    this.validationResults = {
      passed: [],
      failed: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        errors: []
      }
    };
  }

  async loadSchemas() {
    console.log('📋 Cargando schemas de validación...');
    
    const schemaDir = path.join(__dirname, '../data/schemas');
    const schemaFiles = [
      { name: 'static-page', path: 'pages/static-page.schema.json' },
      { name: 'portfolio', path: 'dynamic-content/portfolio.schema.json' },
      { name: 'careers', path: 'dynamic-content/careers.schema.json' },
      { name: 'newsletter', path: 'dynamic-content/newsletter.schema.json' }
    ];

    for (const schema of schemaFiles) {
      try {
        const schemaPath = path.join(schemaDir, schema.path);
        const schemaContent = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        this.ajv.addSchema(schemaContent, schema.name);
        this.schemas[schema.name] = schemaContent;
        console.log(`   ✅ Schema cargado: ${schema.name}`);
      } catch (error) {
        console.error(`   ❌ Error cargando schema ${schema.name}:`, error.message);
      }
    }
  }

  getSchemaForFile(filePath) {
    const relativePath = path.relative('public/json', filePath);
    
    if (relativePath.startsWith('pages/')) {
      return 'static-page';
    }
    
    if (relativePath.includes('portfolio')) {
      return 'portfolio';
    }
    
    if (relativePath.includes('careers')) {
      return 'careers';
    }
    
    if (relativePath.includes('newsletter')) {
      return 'newsletter';
    }
    
    return null;
  }

  validateFile(filePath) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const schemaName = this.getSchemaForFile(filePath);
      
      if (!schemaName) {
        console.log(`   ⚠️  Sin schema para: ${path.relative('public/json', filePath)}`);
        return { valid: true, warnings: ['No schema available'] };
      }

      const validate = this.ajv.getSchema(schemaName);
      if (!validate) {
        throw new Error(`Schema '${schemaName}' no encontrado`);
      }

      const valid = validate(data);
      const result = {
        file: path.relative('public/json', filePath),
        schema: schemaName,
        valid: valid,
        errors: valid ? [] : validate.errors,
        warnings: [],
        suggestions: []
      };

      if (!valid) {
        result.suggestions = this.generateSuggestions(validate.errors, data);
      }

      this.validationResults.total++;
      if (valid) {
        this.validationResults.passed.push(result);
        this.validationResults.summary.passed++;
      } else {
        this.validationResults.failed.push(result);
        this.validationResults.summary.failed++;
        this.validationResults.summary.errors.push(...validate.errors);
      }

      return result;

    } catch (error) {
      const result = {
        file: path.relative('public/json', filePath),
        valid: false,
        errors: [{ message: error.message }],
        warnings: [],
        suggestions: ['Fix JSON syntax errors']
      };
      
      this.validationResults.failed.push(result);
      this.validationResults.summary.failed++;
      return result;
    }
  }

  generateSuggestions(errors, data) {
    const suggestions = [];
    const errorTypes = new Set();

    for (const error of errors) {
      errorTypes.add(error.keyword);
      
      switch (error.keyword) {
        case 'required':
          suggestions.push(`Agregar campo requerido: ${error.params.missingProperty}`);
          break;
        case 'type':
          suggestions.push(`Cambiar tipo de ${error.instancePath} de ${typeof error.data} a ${error.schema}`);
          break;
        case 'format':
          if (error.schema === 'uri') {
            suggestions.push(`Verificar que ${error.instancePath} sea una URL válida`);
          } else if (error.schema === 'email') {
            suggestions.push(`Verificar que ${error.instancePath} sea un email válido`);
          }
          break;
        case 'pattern':
          if (error.schema.includes('[a-z0-9-]')) {
            suggestions.push(`${error.instancePath} debe ser un slug válido (solo letras minúsculas, números y guiones)`);
          } else if (error.schema.includes('#[0-9A-Fa-f]')) {
            suggestions.push(`${error.instancePath} debe ser un color hex válido (ej: #FF0000)`);
          }
          break;
        case 'minimum':
          suggestions.push(`${error.instancePath} debe ser >= ${error.schema}`);
          break;
        case 'maximum':
          suggestions.push(`${error.instancePath} debe ser <= ${error.schema}`);
          break;
        case 'minLength':
          suggestions.push(`${error.instancePath} debe tener al menos ${error.schema} caracteres`);
          break;
        case 'maxLength':
          suggestions.push(`${error.instancePath} debe tener máximo ${error.schema} caracteres`);
          break;
      }
    }

    // Sugerencias generales
    if (errorTypes.has('type')) {
      suggestions.push('Considerar normalizar tipos de datos según el análisis previo');
    }
    
    if (errorTypes.has('required')) {
      suggestions.push('Revisar si los campos faltantes son realmente opcionales');
    }

    return [...new Set(suggestions)]; // Eliminar duplicados
  }

  async validateAllFiles() {
    console.log('\n🔍 Validando archivos JSON contra schemas...\n');
    
    const jsonDir = path.join(__dirname, '../public/json');
    const files = this.findJsonFiles(jsonDir);

    for (const file of files) {
      console.log(`📄 Validando: ${path.relative(jsonDir, file)}`);
      const result = this.validateFile(file);
      
      if (result.valid) {
        console.log(`   ✅ Válido (schema: ${result.schema || 'none'})`);
      } else {
        console.log(`   ❌ Inválido (${result.errors.length} errores)`);
        // Mostrar solo los primeros 3 errores para no saturar
        result.errors.slice(0, 3).forEach(error => {
          console.log(`      • ${error.instancePath}: ${error.message}`);
        });
        if (result.errors.length > 3) {
          console.log(`      ... y ${result.errors.length - 3} errores más`);
        }
      }
    }
  }

  findJsonFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.findJsonFiles(fullPath));
      } else if (item.endsWith('.json')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 REPORTE DE VALIDACIÓN JSON SCHEMAS');
    console.log('='.repeat(80));
    
    const { summary } = this.validationResults;
    
    console.log('\n📈 RESUMEN:');
    console.log(`   • Total de archivos: ${summary.total}`);
    console.log(`   • Válidos: ${summary.passed} (${((summary.passed/summary.total)*100).toFixed(1)}%)`);
    console.log(`   • Inválidos: ${summary.failed} (${((summary.failed/summary.total)*100).toFixed(1)}%)`);
    console.log(`   • Errores totales: ${summary.errors.length}`);

    if (this.validationResults.passed.length > 0) {
      console.log('\n✅ ARCHIVOS VÁLIDOS:');
      this.validationResults.passed.forEach(result => {
        console.log(`   • ${result.file} (${result.schema})`);
      });
    }

    if (this.validationResults.failed.length > 0) {
      console.log('\n❌ ARCHIVOS CON ERRORES:');
      this.validationResults.failed.forEach(result => {
        console.log(`\n   📄 ${result.file} (${result.schema || 'sin schema'})`);
        console.log(`      Errores: ${result.errors.length}`);
        
        // Agrupar errores por tipo
        const errorsByType = {};
        result.errors.forEach(error => {
          const type = error.keyword || 'unknown';
          if (!errorsByType[type]) errorsByType[type] = [];
          errorsByType[type].push(error);
        });

        Object.entries(errorsByType).forEach(([type, errors]) => {
          console.log(`      • ${type}: ${errors.length} errores`);
        });

        if (result.suggestions.length > 0) {
          console.log('      💡 Sugerencias:');
          result.suggestions.slice(0, 3).forEach(suggestion => {
            console.log(`         - ${suggestion}`);
          });
        }
      });
    }

    // Análisis de errores más comunes
    const errorFrequency = {};
    summary.errors.forEach(error => {
      const key = `${error.keyword}: ${error.message}`;
      errorFrequency[key] = (errorFrequency[key] || 0) + 1;
    });

    const topErrors = Object.entries(errorFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    if (topErrors.length > 0) {
      console.log('\n🔥 ERRORES MÁS COMUNES:');
      topErrors.forEach(([error, count]) => {
        console.log(`   • ${error} (${count} veces)`);
      });
    }

    console.log('\n💡 RECOMENDACIONES:');
    if (summary.failed === 0) {
      console.log('   ✅ Todos los archivos son válidos. ¡Excelente!');
      console.log('   • Proceder con la implementación del sistema CRUD');
    } else {
      console.log('   • Corregir errores de validación antes de implementar CRUD');
      console.log('   • Considerar hacer schemas menos estrictos para migración gradual');
      console.log('   • Implementar normalización automática de datos');
      if (summary.failed / summary.total > 0.5) {
        console.log('   ⚠️  Muchos archivos inválidos - considerar ajustar schemas');
      }
    }

    return this.validationResults;
  }

  saveResults() {
    const outputPath = path.join(__dirname, '../data/validation-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(this.validationResults, null, 2));
    console.log(`\n💾 Resultados guardados en: ${outputPath}`);
  }
}

async function main() {
  const validator = new JSONValidator();
  
  try {
    await validator.loadSchemas();
    await validator.validateAllFiles();
    const results = validator.generateReport();
    validator.saveResults();
    
    console.log('\n✅ Validación completada');
    
    // Exit code basado en resultados
    process.exit(results.summary.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Error durante validación:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = JSONValidator;