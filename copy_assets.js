import fs from 'fs';
import path from 'path';

const srcDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\8b91c19d-fd4d-4e78-a484-b9e74578b1a0';
const destDir = path.resolve('public', 'activities');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = [
  { src: 'medical_camp_1790358005474.jpg', dest: 'medical_camp.jpg' },
  { src: 'pothole_before_1790358108141.jpg', dest: 'pothole_before.jpg' },
  { src: 'pothole_after_1790358130681.jpg', dest: 'pothole_after.jpg' },
  { src: 'lake_cleanup_1790358157363.jpg', dest: 'lake_cleanup.jpg' }
];

for (const f of files) {
  const srcPath = path.join(srcDir, f.src);
  const destPath = path.join(destDir, f.dest);
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied ${f.src} -> ${destPath}`);
}
console.log('All images copied successfully!');
