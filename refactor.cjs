const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend/src');

const replacements = [
  // Backgrounds
  { regex: /bg-white\/95/g, replacement: 'bg-card/95' },
  { regex: /bg-white\/80/g, replacement: 'bg-card/80' },
  { regex: /bg-white\/10/g, replacement: 'bg-card/10' },
  { regex: /bg-white/g, replacement: 'bg-card' },
  { regex: /bg-\[#F5F0E8\]/g, replacement: 'bg-secondary' },
  { regex: /bg-\[#FFF9EF\]/g, replacement: 'bg-primary/5' },
  { regex: /bg-\[#FFFBF4\]/g, replacement: 'bg-background' },
  { regex: /bg-gray-50/g, replacement: 'bg-secondary/50' },
  { regex: /bg-brand-grid/g, replacement: 'dark:bg-dark-grid bg-brand-grid' },
  
  // Texts
  { regex: /text-\[#171512\]/g, replacement: 'text-foreground' },
  { regex: /text-\[#6F6A63\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-gray-700/g, replacement: 'text-foreground' },
  { regex: /text-gray-600/g, replacement: 'text-muted-foreground' },
  { regex: /text-gray-500/g, replacement: 'text-muted-foreground' },
  { regex: /text-gray-400/g, replacement: 'text-muted-foreground' },
  
  // Borders
  { regex: /border-\[#E8E0D5\]/g, replacement: 'border-border' },
  { regex: /border-\[#F5F0E8\]/g, replacement: 'border-secondary' },
  { regex: /border-gray-100/g, replacement: 'border-border' },
  { regex: /border-gray-200\/80/g, replacement: 'border-border/80' },
  { regex: /border-gray-200/g, replacement: 'border-border' },
  { regex: /border-gray-300/g, replacement: 'border-border' },
];

function cleanServiceFile(content) {
  // Remove mock imports
  let cleaned = content.replace(/import\s+\{.*?\MOCK.*?\}.*?;\n/g, '');
  cleaned = cleaned.replace(/import\s+\{.*?getMock.*?\}.*?;\n/g, '');
  
  // Remove USE_MOCK declaration
  cleaned = cleaned.replace(/const\s+USE_MOCK.*?\n/g, '');
  
  // Remove persistent mock state declarations
  cleaned = cleaned.replace(/let\s+mock[a-zA-Z0-9_]+.*?\n/g, '');
  
  // Dashboard specific fallbacks
  cleaned = cleaned.replace(/catch\s*\(err\)\s*\{\s*console\.warn.*?return\s*\{\s*data.*?getMock.*?\(\).*?\};\s*\}/gs, 'catch (err) { throw err; }');
  
  // Booking specific mock blocks
  cleaned = cleaned.replace(/if\s*\(USE_MOCK\)\s*\{[\s\S]*?return\s*\{[\s\S]*?\}\s*;\s*\}/g, '');
  
  // Auth specific
  cleaned = cleaned.replace(/if\s*\(USE_MOCK\)\s*\{[\s\S]*?throw new Error\("Invalid credentials.*?"\);\s*\}\s*\}/g, '');
  
  // Other simple USE_MOCK blocks
  cleaned = cleaned.replace(/if\s*\(USE_MOCK\)\s*\{[\s\S]*?return\s*\{.*?\};\s*\}/g, '');

  return cleaned;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (fullPath.includes('services')) {
          const original = content;
          content = cleanServiceFile(content);
          if (content !== original) {
            fs.writeFileSync(fullPath, content, 'utf8');
          }
      } else {
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
}

processDirectory(srcDir);
console.log('Refactoring complete');
