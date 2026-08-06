const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'educational-articles');
const outFile = path.join(__dirname, 'data-articles.js');

if (!fs.existsSync(srcDir)) {
  console.error('educational-articles folder not found!');
  process.exit(1);
}

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.md'));
const articles = [];

// Very basic MD parser
function parseMD(text) {
  let html = text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Handle lists
  html = html.replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>');
  // merge consecutive ul
  html = html.replace(/<\/ul>\s*<ul>/gim, '');

  // paragraphs (anything not starting with <)
  html = html.split('\n').map(line => {
    line = line.trim();
    if (!line) return '';
    if (line.startsWith('<')) return line;
    return '<p>' + line + '</p>';
  }).filter(Boolean).join('\n');

  return html;
}

files.forEach((file, idx) => {
  const content = fs.readFileSync(path.join(srcDir, file), 'utf-8');
  const lines = content.split('\n');
  let title = 'Без названия';
  
  if (lines[0] && lines[0].startsWith('# ')) {
    title = lines[0].replace('# ', '').trim();
  }

  // Remove the h1 from the content since we already use it as title, or keep it, it's fine.
  // Actually let's remove the first line if it's the title to avoid duplication in the viewer.
  let contentWithoutTitle = content;
  if (lines[0] && lines[0].startsWith('# ')) {
    contentWithoutTitle = lines.slice(1).join('\n');
  }

  const htmlContent = parseMD(contentWithoutTitle);

  articles.push({
    id: `art-${idx + 1}`,
    filename: file,
    title: title,
    html: htmlContent
  });
});

const output = `var ARTICLES = ${JSON.stringify(articles, null, 2)};\n`;
fs.writeFileSync(outFile, output);
console.log(`Processed ${files.length} articles to data-articles.js`);
