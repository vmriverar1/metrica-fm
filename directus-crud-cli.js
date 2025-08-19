#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Directus CRUD CLI - Sistema Completo de Línea de Comandos
 * Permite operaciones CRUD completas desde terminal
 * 
 * @author Métrica DIP
 * @version 3.0
 */

class DirectusCLI {
  constructor(config = {}) {
    this.directusUrl = config.url || process.env.DIRECTUS_URL || 'http://localhost:8055';
    this.credentials = config.credentials || {
      email: process.env.DIRECTUS_EMAIL || 'admin@metrica-dip.com',
      password: process.env.DIRECTUS_PASSWORD || 'MetricaDIP2024!'
    };
    this.api = null;
    this.token = null;
  }

  /**
   * Autenticar con Directus
   */
  async authenticate() {
    try {
      const authResponse = await axios.post(
        `${this.directusUrl}/auth/login`, 
        this.credentials
      );
      
      this.token = authResponse.data.data.access_token;
      
      this.api = axios.create({
        baseURL: this.directusUrl,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error de autenticación:', error.message);
      return false;
    }
  }

  /**
   * CREATE - Crear registro
   */
  async create(collection, dataInput) {
    try {
      let data;
      
      // Verificar si es un archivo JSON o datos directos
      if (dataInput.endsWith('.json')) {
        const jsonContent = fs.readFileSync(dataInput, 'utf8');
        data = JSON.parse(jsonContent);
      } else {
        // Parsear datos desde string (key=value,key2=value2)
        data = this.parseDataString(dataInput);
      }

      console.log('📝 Creando registro en', collection);
      console.log('   Datos:', JSON.stringify(data, null, 2));
      
      const response = await this.api.post(`/items/${collection}`, data);
      
      console.log('✅ Registro creado exitosamente');
      console.log('   ID:', response.data.data.id);
      console.log('   Respuesta:', JSON.stringify(response.data.data, null, 2));
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Error CREATE:', error.response?.data?.errors?.[0]?.message || error.message);
      return null;
    }
  }

  /**
   * READ - Leer registros
   */
  async read(collection, id = null, options = {}) {
    try {
      if (id) {
        // Leer registro específico
        console.log(`📖 Leyendo registro ${id} de ${collection}`);
        const response = await this.api.get(`/items/${collection}/${id}`);
        
        console.log('✅ Registro encontrado:');
        console.log(JSON.stringify(response.data.data, null, 2));
        
        return response.data.data;
      } else {
        // Leer todos los registros con opciones
        console.log(`📖 Leyendo registros de ${collection}`);
        
        const params = {};
        if (options.limit) params.limit = options.limit;
        if (options.offset) params.offset = options.offset;
        if (options.sort) params.sort = options.sort;
        if (options.filter) params.filter = options.filter;
        if (options.fields) params.fields = options.fields;
        
        const response = await this.api.get(`/items/${collection}`, { params });
        const records = response.data.data;
        
        console.log(`✅ ${records.length} registros encontrados:\n`);
        
        // Mostrar registros en formato tabla
        if (records.length > 0) {
          this.displayTable(records);
        }
        
        return records;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️ Registro no encontrado');
      } else {
        console.error('❌ Error READ:', error.response?.data?.errors?.[0]?.message || error.message);
      }
      return null;
    }
  }

  /**
   * UPDATE - Actualizar registro
   */
  async update(collection, id, dataInput) {
    try {
      let data;
      
      // Verificar si es un archivo JSON o datos directos
      if (dataInput.endsWith('.json')) {
        const jsonContent = fs.readFileSync(dataInput, 'utf8');
        data = JSON.parse(jsonContent);
      } else {
        // Parsear datos desde string
        data = this.parseDataString(dataInput);
      }

      console.log(`✏️ Actualizando registro ${id} en ${collection}`);
      console.log('   Datos:', JSON.stringify(data, null, 2));
      
      const response = await this.api.patch(`/items/${collection}/${id}`, data);
      
      console.log('✅ Registro actualizado exitosamente');
      console.log('   Respuesta:', JSON.stringify(response.data.data, null, 2));
      
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️ Registro no encontrado');
      } else {
        console.error('❌ Error UPDATE:', error.response?.data?.errors?.[0]?.message || error.message);
      }
      return null;
    }
  }

  /**
   * DELETE - Eliminar registro
   */
  async delete(collection, id) {
    try {
      console.log(`🗑️ Eliminando registro ${id} de ${collection}`);
      
      // Confirmar antes de eliminar
      if (!process.argv.includes('--force')) {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const answer = await new Promise(resolve => {
          readline.question('   ¿Confirmar eliminación? (s/n): ', resolve);
        });
        readline.close();
        
        if (answer.toLowerCase() !== 's' && answer.toLowerCase() !== 'si') {
          console.log('   Eliminación cancelada');
          return false;
        }
      }
      
      await this.api.delete(`/items/${collection}/${id}`);
      
      console.log('✅ Registro eliminado exitosamente');
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️ Registro no encontrado');
      } else {
        console.error('❌ Error DELETE:', error.response?.data?.errors?.[0]?.message || error.message);
      }
      return false;
    }
  }

  /**
   * COLLECTION - Operaciones con colecciones
   */
  async collection(action, jsonFile) {
    try {
      switch (action) {
        case 'create':
          if (!jsonFile) {
            console.error('❌ Se requiere un archivo JSON para crear colección');
            return;
          }
          const createDef = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
          await this.createCollection(createDef.collection);
          break;
          
        case 'list':
          console.log('📋 Colecciones disponibles:\n');
          const response = await this.api.get('/collections');
          const collections = response.data.data
            .filter(c => !c.collection.startsWith('directus_'))
            .map(c => ({
              Nombre: c.collection,
              Icono: c.meta?.icon || '-',
              Descripción: c.meta?.note || '-'
            }));
          this.displayTable(collections);
          break;
          
        case 'drop':
          if (!jsonFile) {
            console.error('❌ Se requiere el nombre de la colección');
            return;
          }
          await this.dropCollection(jsonFile);
          break;
          
        case 'info':
          if (!jsonFile) {
            console.error('❌ Se requiere el nombre de la colección');
            return;
          }
          await this.collectionInfo(jsonFile);
          break;
          
        default:
          console.error('❌ Acción no válida:', action);
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  /**
   * Obtener información de una colección
   */
  async collectionInfo(name) {
    try {
      console.log(`📊 Información de la colección: ${name}\n`);
      
      // Obtener campos
      const fieldsResponse = await this.api.get(`/fields/${name}`);
      const fields = fieldsResponse.data.data;
      
      console.log('📋 Campos:');
      const fieldInfo = fields.map(f => ({
        Campo: f.field,
        Tipo: f.type,
        Requerido: f.meta?.required ? 'Sí' : 'No',
        Único: f.schema?.is_unique ? 'Sí' : 'No',
        Descripción: f.meta?.note || '-'
      }));
      this.displayTable(fieldInfo);
      
      // Obtener conteo de registros
      const countResponse = await this.api.get(`/items/${name}`, {
        params: { limit: 1, meta: 'total_count' }
      });
      
      console.log(`\n📊 Total de registros: ${countResponse.data.meta?.total_count || 0}`);
      
    } catch (error) {
      console.error('❌ Error obteniendo información:', error.message);
    }
  }

  /**
   * Parsear string de datos (key=value,key2=value2)
   */
  parseDataString(dataString) {
    const data = {};
    const pairs = dataString.split(',');
    
    for (const pair of pairs) {
      const [key, ...valueParts] = pair.trim().split('=');
      const value = valueParts.join('='); // Por si el valor contiene '='
      
      if (key && value) {
        // Intentar parsear como JSON (para arrays, objetos, booleanos)
        try {
          data[key] = JSON.parse(value);
        } catch {
          // Si no es JSON válido, usar como string
          data[key] = value;
        }
      }
    }
    
    return data;
  }

  /**
   * Mostrar datos en formato tabla
   */
  displayTable(data) {
    if (!data || data.length === 0) return;
    
    // Obtener todas las columnas
    const columns = Object.keys(data[0]);
    
    // Calcular ancho máximo por columna
    const widths = {};
    columns.forEach(col => {
      widths[col] = Math.max(
        col.length,
        ...data.map(row => String(row[col] || '').length)
      );
      widths[col] = Math.min(widths[col], 40); // Máximo 40 caracteres
    });
    
    // Imprimir encabezados
    console.log('┌' + columns.map(col => '─'.repeat(widths[col] + 2)).join('┬') + '┐');
    console.log('│' + columns.map(col => ` ${col.padEnd(widths[col])} `).join('│') + '│');
    console.log('├' + columns.map(col => '─'.repeat(widths[col] + 2)).join('┼') + '┤');
    
    // Imprimir filas
    data.forEach(row => {
      console.log('│' + columns.map(col => {
        let value = String(row[col] || '');
        if (value.length > widths[col]) {
          value = value.substring(0, widths[col] - 3) + '...';
        }
        return ` ${value.padEnd(widths[col])} `;
      }).join('│') + '│');
    });
    
    console.log('└' + columns.map(col => '─'.repeat(widths[col] + 2)).join('┴') + '┘');
  }

  /**
   * Crear colección (función auxiliar del sistema anterior)
   */
  async createCollection(definition) {
    // Implementación existente del sistema anterior
    console.log('📦 Creando colección desde definición JSON...');
    // ... código de creación de colección ...
  }

  /**
   * Eliminar colección
   */
  async dropCollection(name) {
    try {
      console.log(`🗑️ Eliminando colección ${name}...`);
      await this.api.delete(`/collections/${name}`);
      console.log('✅ Colección eliminada exitosamente');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️ La colección no existe');
      } else {
        console.error('❌ Error:', error.message);
      }
    }
  }
}

/**
 * Función principal CLI
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }

  const cli = new DirectusCLI();
  
  // Autenticar primero
  const authenticated = await cli.authenticate();
  if (!authenticated) {
    console.error('❌ No se pudo autenticar con Directus');
    process.exit(1);
  }

  const command = args[0].toLowerCase();
  
  try {
    switch (command) {
      // CREATE
      case 'create':
      case 'add':
      case 'new':
        if (args.length < 3) {
          console.error('❌ Uso: directus-cli create <collection> <data|file.json>');
          console.error('   Ejemplo: directus-cli create products name=Laptop,price=999.99');
          console.error('   Ejemplo: directus-cli create products data.json');
          return;
        }
        await cli.create(args[1], args[2]);
        break;

      // READ
      case 'read':
      case 'get':
      case 'list':
      case 'show':
        if (args.length < 2) {
          console.error('❌ Uso: directus-cli read <collection> [id] [--limit=10] [--sort=-created_at]');
          return;
        }
        
        const collection = args[1];
        const id = args[2] && !args[2].startsWith('--') ? args[2] : null;
        const options = {};
        
        // Parsear opciones
        args.slice(id ? 3 : 2).forEach(arg => {
          if (arg.startsWith('--')) {
            const [key, value] = arg.substring(2).split('=');
            options[key] = value || true;
          }
        });
        
        await cli.read(collection, id, options);
        break;

      // UPDATE
      case 'update':
      case 'edit':
      case 'modify':
        if (args.length < 4) {
          console.error('❌ Uso: directus-cli update <collection> <id> <data|file.json>');
          console.error('   Ejemplo: directus-cli update products 1 price=899.99,stock=25');
          console.error('   Ejemplo: directus-cli update products 1 updates.json');
          return;
        }
        await cli.update(args[1], args[2], args[3]);
        break;

      // DELETE
      case 'delete':
      case 'remove':
      case 'del':
      case 'rm':
        if (args.length < 3) {
          console.error('❌ Uso: directus-cli delete <collection> <id> [--force]');
          console.error('   Ejemplo: directus-cli delete products 1');
          console.error('   Ejemplo: directus-cli delete products 1 --force');
          return;
        }
        await cli.delete(args[1], args[2]);
        break;

      // COLLECTION operations
      case 'collection':
      case 'col':
        if (args.length < 2) {
          console.error('❌ Uso: directus-cli collection <action> [params]');
          console.error('   Acciones: create, list, drop, info');
          return;
        }
        await cli.collection(args[1], args[2]);
        break;

      // SEARCH
      case 'search':
      case 'find':
        if (args.length < 2) {
          console.error('❌ Uso: directus-cli search <collection> [filter]');
          console.error('   Ejemplo: directus-cli search products --filter=category:electronics');
          return;
        }
        
        const searchOptions = {
          filter: {}
        };
        
        // Parsear filtros
        args.slice(2).forEach(arg => {
          if (arg.startsWith('--filter=')) {
            const filterStr = arg.substring(9);
            const [field, value] = filterStr.split(':');
            searchOptions.filter[field] = { _eq: value };
          }
        });
        
        await cli.read(args[1], null, searchOptions);
        break;

      default:
        console.error(`❌ Comando no reconocido: ${command}`);
        console.log('   Use --help para ver comandos disponibles');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

/**
 * Mostrar ayuda
 */
function showHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    DIRECTUS CRUD CLI v3.0                      ║
╚═══════════════════════════════════════════════════════════════╝

📋 COMANDOS DISPONIBLES:

  CREATE (create, add, new)
    directus-cli create <collection> <data>
    directus-cli create products name=Laptop,price=999.99,stock=10
    directus-cli create products product.json

  READ (read, get, list, show)
    directus-cli read <collection> [id] [options]
    directus-cli read products                    # Lista todos
    directus-cli read products 5                  # Lee ID 5
    directus-cli read products --limit=10         # Primeros 10
    directus-cli read products --sort=-created_at # Ordenar por fecha

  UPDATE (update, edit, modify)
    directus-cli update <collection> <id> <data>
    directus-cli update products 5 price=799.99,stock=20
    directus-cli update products 5 updates.json

  DELETE (delete, remove, del, rm)
    directus-cli delete <collection> <id> [--force]
    directus-cli delete products 5
    directus-cli delete products 5 --force        # Sin confirmación

  SEARCH (search, find)
    directus-cli search <collection> --filter=field:value
    directus-cli search products --filter=category:electronics

  COLLECTION (collection, col)
    directus-cli collection create definition.json
    directus-cli collection list                  # Lista colecciones
    directus-cli collection info products         # Info de colección
    directus-cli collection drop products         # Eliminar colección

📝 FORMATOS DE DATOS:

  String directo:
    key1=value1,key2=value2,key3=value3
    
  Valores especiales:
    active=true                    # Boolean
    tags=["tag1","tag2"]          # Array
    config={"key":"value"}        # Object
    price=99.99                   # Number

  Archivo JSON:
    {
      "name": "Product Name",
      "price": 99.99,
      "active": true,
      "tags": ["new", "featured"]
    }

🔧 VARIABLES DE ENTORNO:

  DIRECTUS_URL=http://localhost:8055
  DIRECTUS_EMAIL=admin@company.com
  DIRECTUS_PASSWORD=secret123

📚 EJEMPLOS:

  # Crear un producto
  directus-cli create products name="Gaming Laptop",price=1299.99,stock=5

  # Leer todos los productos
  directus-cli read products

  # Leer un producto específico
  directus-cli read products 10

  # Actualizar precio de un producto
  directus-cli update products 10 price=999.99

  # Eliminar un producto
  directus-cli delete products 10

  # Buscar productos por categoría
  directus-cli search products --filter=category:electronics

  # Listar todas las colecciones
  directus-cli collection list

💡 TIPS:

  • Use --force con delete para evitar confirmación
  • Los datos JSON pueden venir de archivos .json
  • Los filtros soportan operadores Directus (_eq, _neq, _gt, etc)
  • Use variables de entorno para credenciales sensibles

═══════════════════════════════════════════════════════════════
`);
}

// Exportar para uso como módulo
module.exports = DirectusCLI;

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  });
}