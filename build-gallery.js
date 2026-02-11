// build-gallery.js
const fs = require('fs');
const path = require('path');

const galleryDir = './_gallery';
const outputFile = './gallery-data.json';

// Read all files from _gallery folder
const files = fs.readdirSync(galleryDir).filter(file => file.endsWith('.md'));

const galleryData = files.map(file => {
  const content = fs.readFileSync(path.join(galleryDir, file), 'utf8');
  
  // Extract frontmatter (simple parser)
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;
  
  const frontmatter = frontmatterMatch[1];
  const data = {};
  
  frontmatter.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
      data[key.trim()] = value;
    }
  });
  
  return data;
}).filter(Boolean);

fs.writeFileSync(outputFile, JSON.stringify(galleryData, null, 2));
console.log(`Gallery data written to ${outputFile}`);