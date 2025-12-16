const fs = require('fs');
const path = require('path');

// Nome do arquivo de saída
const outputFile = 'project-map.txt';

// Pastas e arquivos para IGNORAR (para manter o mapa limpo)
const ignoreDirs = new Set(['.git', 'node_modules', '.next', '.vscode', 'out', 'build', 'dist', '.swc']);
const ignoreFiles = new Set(['.DS_Store', 'Thumbs.db', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'project-map.txt', 'generate-map.js', '.env', '.env.local']);

function crawl(dir, prefix = '') {
  let output = '';
  let entries;

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return '';
  }

  // Filtrar entradas ignoradas
  const filtered = entries.filter(entry => {
    if (entry.isDirectory()) return !ignoreDirs.has(entry.name);
    return !ignoreFiles.has(entry.name);
  });

  // Ordenar: Pastas primeiro, depois arquivos
  filtered.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  filtered.forEach((entry, index) => {
    const isLast = index === filtered.length - 1;
    const marker = isLast ? '└── ' : '├── ';
    
    output += `${prefix}${marker}${entry.name}\n`;

    if (entry.isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      output += crawl(path.join(dir, entry.name), newPrefix);
    }
  });

  return output;
}

try {
  const tree = `RAIZ DO PROJETO: ${path.basename(process.cwd())}\n\n` + crawl('.');
  fs.writeFileSync(outputFile, tree, 'utf8');
  console.log(`\n✅ Sucesso! O arquivo "${outputFile}" foi gerado na raiz.`);
  console.log(`👉 Por favor, envie este arquivo para o chat.`);
} catch (err) {
  console.error('❌ Erro ao gerar o mapa:', err);
}