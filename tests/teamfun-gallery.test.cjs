const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('TeamFun renders a five-column gallery with lightbox and selection controls', () => {
    const html = read('teamfun/index.html');
    const css = read('teamfun/teamfun.css');
    const script = read('teamfun/teamfun.js');

    assert.match(html, /id="mediaGrid"/);
    assert.match(html, /id="lightbox"/);
    assert.match(css, /grid-template-columns:\s*repeat\(5,/);
    assert.match(script, /openLightbox/);
    assert.match(script, /moveLightbox/);
    assert.match(script, /downloadSelected/);
});

test('TeamFun supports direct game-code routes', () => {
    const rewrite = read('teamfun/.htaccess');

    assert.match(rewrite, /RewriteRule\s+\^\s+index\.html/);
});
