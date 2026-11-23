import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const manifest = process.argv[2] || 'content/image-migration.json';
const images = JSON.parse(await fs.readFile(manifest, 'utf8'));
const results = [];
let next = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (next < images.length) {
    const image = images[next++];
    let result;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(image.url, { method: 'HEAD', signal: AbortSignal.timeout(30000) });
        assert.equal(response.status, 200, `HTTP ${response.status}`);
        const type = response.headers.get('content-type');
        assert.match(type || '', /^image\//, `Not an image: ${type}`);
        const bytes = Number(response.headers.get('content-length'));
        assert.equal(bytes, image.bytes, 'Remote file size differs');
        const sha256 = response.headers.get('etag')?.replace(/^W\//, '').replaceAll('"', '');
        assert.equal(sha256, image.sha256, 'Remote SHA-256 differs');
        result = { source: image.source, url: image.url, status: response.status, type, bytes, sha256, ok: true };
        break;
      } catch (error) {
        result = { source: image.source, url: image.url, ok: false, error: error.message };
      }
    }
    results.push(result);
  }
}));
results.sort((a, b) => a.source.localeCompare(b.source));
await fs.mkdir('.artifacts', { recursive: true });
await fs.writeFile('.artifacts/image-remote-audit.json', JSON.stringify(results, null, 2) + '\n');
const failures = results.filter(r => !r.ok);
console.log(`Checked ${results.length} remote images: ${results.length - failures.length} passed; ${failures.length} failed.`);
if (failures.length) {
  for (const failure of failures) console.error(failure.source + ': ' + failure.error);
  process.exitCode = 1;
} else console.log('All URLs return actual images with the original file size and SHA-256.');
