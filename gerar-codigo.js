const fs = require('fs');
const path = require('path');

// Nome do arquivo final
const outputFile = 'projeto-completo.txt';

// Pastas que NÃO vamos ler
const ignoreDirs = [
  '.git', 
  'node_modules', 
  '.next', 
  '.vscode', 
  'public' // Ignorar imagens para não pesar
];

// Arquivos específicos que vamos ignorar
const ignoreFiles = [
  'package-lock.json', 
  'pnpm-lock.yaml', 
  'yarn.lock', 
  'next-env.d.ts',
  '.DS_Store', 
  'Thumbs.db',
  outputFile,
  'gerar-codigo.js',
  'generate-map.js',
  'project-map.txt'
];

// Extensões que queremos ler (Códigos)
const allowedExtensions = ['.ts', '.tsx', '.js', '.mjs', '.css', '.json'];

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    
    // Pula se for pasta ignorada
    if (fs.statSync(fullPath).isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      // Verifica se não está na lista de ignorados
      if (!ignoreFiles.includes(file)) {
        // Verifica extensão
        const ext = path.extname(file);
        if (allowedExtensions.includes(ext)) {
          arrayOfFiles.push(fullPath);
        }
      }
    }
  });

  return arrayOfFiles;
}

try {
  console.log('🔍 Escaneando projeto...');
  const allFiles = getAllFiles(__dirname);
  
  let content = `RELATÓRIO COMPLETO DO CÓDIGO\nData: ${new Date().toISOString()}\n`;
  content += `Total de arquivos: ${allFiles.length}\n\n`;
  content += `================================================\n\n`;

  allFiles.forEach(file => {
    // Caminho relativo para facilitar a leitura
    const relativePath = path.relative(__dirname, file);
    
    console.log(`Lendo: ${relativePath}`);
    
    const fileContent = fs.readFileSync(file, 'utf8');
    
    content += `--- ARQUIVO: ${relativePath} ---\n`;
    content += `${fileContent}\n`;
    content += `--- FIM DO ARQUIVO: ${relativePath} ---\n\n`;
    content += `================================================\n\n`;
  });

  fs.writeFileSync(outputFile, content, 'utf8');
  console.log(`\n✅ Sucesso! Arquivo criado: ${outputFile}`);
  console.log(`👉 Por favor, anexe este arquivo no chat.`);

} catch (e) {
  console.error('❌ Erro:', e);
}