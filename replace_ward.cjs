const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/Bandireddy\s*Circle/gi, match => {
      if (match === match.toUpperCase()) return 'ADDA360';
      if (match.startsWith('B')) return 'ADDA360';
      return 'adda360';
    })
    .replace(/Ward\s*(No\.?\s*)?59/gi, match => {
      if (match.startsWith('W')) return 'ADDA360';
      return 'adda360';
    })
    .replace(/Bandireddy/gi, match => {
      if (match.startsWith('B')) return 'ADDA360';
      return 'adda360';
    })
    .replace(/Ward\s*No/gi, match => {
      if (match.startsWith('W')) return 'ADDA360';
      return 'adda360';
    });

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Replaced in ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        walk(filePath);
      }
    } else {
      if (['.js', '.jsx', '.html', '.css', '.json'].some(ext => filePath.endsWith(ext))) {
        replaceInFile(filePath);
      }
    }
  }
}

walk(path.join(__dirname, 'src'));
replaceInFile(path.join(__dirname, 'index.html'));
replaceInFile(path.join(__dirname, 'package.json'));
