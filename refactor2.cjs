const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend/src');

const replacements = [
  { regex: /bg-\[#FFFEFC\]/g, replacement: 'bg-card' },
  { regex: /bg-\[#FAF7F1\]/g, replacement: 'bg-background' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let originalContent = content;
      for (const r of replacements) {
        content = content.replace(r.regex, r.replacement);
      }
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

processDirectory(srcDir);
console.log('Refactoring 2 complete');
