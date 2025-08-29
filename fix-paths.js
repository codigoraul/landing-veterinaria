const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Directorio de salida de la compilación
const distDir = path.join(__dirname, 'dist');

// Patrones para buscar archivos HTML, CSS y JS
const filePatterns = [
  '**/*.html',
  '**/*.css',
  '**/*.js',
  '**/*.json',
  '**/*.webmanifest'
];

// Función para procesar un archivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Reemplazar rutas absolutas por relativas
    // Ejemplo: href="/assets/" -> href="./assets/"
    const patterns = [
      { regex: /(href|src)="\/([^"\/])/g, replace: '$1="./$2' },
      { regex: /(href|src)="\/([^"\/])/g, replace: '$1="./$2' }, // Para rutas como "/assets"
      { regex: /(href|src)='\/([^'\/])/g, replace: "$1='./$2" },
      { regex: /(url\(['"]?)\/([^/])/g, replace: '$1./$2' }, // Para URLs en CSS
      { regex: /(href|src)="\/([^"\/])/g, replace: '$1="./$2' }, // Para rutas en JavaScript
      { regex: /(href|src)="\/\/"/g, replace: '$1="./"' }, // Para rutas raíz
      { regex: /(href|src)="\/index\.html/g, replace: '$1="./index.html"' }, // Para enlaces a index.html
      { regex: /(href|src)="\/([^"\/]+\.(html|css|js|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|json|webmanifest|xml|ico))"(?![^<]*>|\s*\/>)/g, replace: '$1="./$2"' },
      { regex: /(href|src)="\/([^"\/]+\.(html|css|js|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|json|webmanifest|xml|ico))'(?![^<]*>|\s*\/>)/g, replace: "$1='./$2'" },
      { regex: /(href|src)=\/(?=[^\/])([^"']*?)(?=["'#?]|\s|>)/g, replace: '$1="./$2"' },
      { regex: /(href|src)='\/(?=[^\/])([^"']*?)(?=["'#?]|\s|>)/g, replace: "$1='./$2" },
      { regex: /(url\(['"]?)\/(?=[^\/])([^"')]*?)(?=["')#?]|\s|>)/g, replace: '$1./$2' },
    ];

    patterns.forEach(({ regex, replace }) => {
      if (regex.test(content)) {
        content = content.replace(regex, replace);
        modified = true;
      }
    });

    // Guardar el archivo si se realizaron cambios
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Actualizado: ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (error) {
    console.error(`Error al procesar el archivo ${filePath}:`, error);
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando corrección de rutas...\n');
  
  try {
    // Buscar archivos en el directorio dist
    const files = await glob(filePatterns, { cwd: distDir, absolute: true, nodir: true });
    
    console.log(`📂 Se encontraron ${files.length} archivos para procesar\n`);
    
    // Procesar cada archivo
    files.forEach(processFile);
    
    console.log('\n✅ Proceso completado. Todas las rutas han sido actualizadas.');
  } catch (error) {
    console.error('❌ Error al buscar archivos:', error);
    process.exit(1);
  }
}

// Ejecutar el script
main().catch(console.error);
