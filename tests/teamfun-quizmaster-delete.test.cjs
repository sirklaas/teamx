const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('TeamFun has secret quizmaster button and delete controls', () => {
    const html = read('teamfun/index.html');
    const css = read('teamfun/teamfun.css');
    const script = read('teamfun/teamfun.js');
    const deleteApi = read('teamfun/api/delete.php');

    // HTML: secret button wrapping 'Quizmaster' and lightbox delete button
    assert.match(html, /id="secretQuizmasterBtn"/);
    assert.match(html, /Quizmaster/);
    assert.match(html, /id="lightboxDelete"/);

    // CSS: secret button styling and delete-control styling
    assert.match(css, /\.secret-quizmaster-btn/);
    assert.match(css, /\.delete-control/);
    assert.match(css, /\.quizmaster-active/);

    // JS: secret toggle, deleteMedia, no client-side admin password
    assert.match(script, /toggleQuizmasterMode/);
    assert.match(script, /deleteMedia/);
    assert.match(script, /\/teamfun\/api\/delete\.php/);
    assert.doesNotMatch(script, /ADMIN_PASSWORD|authWithPassword|_superusers/);

    // PHP: server delete helper with superuser auth and collection deletion
    assert.match(deleteApi, /api\/collections\/_superusers\/auth-with-password/);
    assert.match(deleteApi, /showmedia\/records/);
    assert.match(deleteApi, /DELETE/);
});
