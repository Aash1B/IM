const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'frontend/src/services');

const files = fs.readdirSync(servicesDir);

for (const file of files) {
  if (file.endsWith('.ts')) {
    const fullPath = path.join(servicesDir, file);
    let lines = fs.readFileSync(fullPath, 'utf8').split('\n');
    
    // Filter out mock lines
    lines = lines.filter(line => {
      if (line.includes('from "../mocks/')) return false;
      if (line.includes('const USE_MOCK')) return false;
      if (line.startsWith('let mock') && line.includes('State')) return false;
      return true;
    });
    
    fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
  }
}
console.log("Services cleaned!");
