const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/\[#FF9933\]/gi, 'brand-orange')
    .replace(/\[#138808\]/gi, 'brand-green');

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
      if (['.js', '.jsx'].some(ext => filePath.endsWith(ext))) {
        replaceInFile(filePath);
      }
    }
  }
}

walk(path.join(__dirname, 'src'));
