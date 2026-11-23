import { build } from '../lib/build.mjs';
await build({ outDir: process.argv.includes('--dev') ? '.dev' : 'dist', live: process.argv.includes('--dev'), assets: !process.argv.includes('--no-assets') });
