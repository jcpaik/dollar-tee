import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKETCHES_DIR = path.resolve(__dirname, 'sketches');

function sketchesApiPlugin() {
  return {
    name: 'sketches-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/sketches')) return next();

        // GET /api/sketches — list all sketches with code
        if (req.method === 'GET' && req.url === '/api/sketches') {
          const files = fs.readdirSync(SKETCHES_DIR)
            .filter(f => f.endsWith('.js'))
            .sort();
          const sketches = files.map(f => ({
            name: f.replace(/\.js$/, ''),
            code: fs.readFileSync(path.join(SKETCHES_DIR, f), 'utf-8'),
          }));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(sketches));
          return;
        }

        // Extract sketch name from URL: /api/sketches/:name
        const match = req.url.match(/^\/api\/sketches\/(.+)$/);
        if (!match) return next();
        const name = decodeURIComponent(match[1]);
        const filePath = path.join(SKETCHES_DIR, name + '.js');

        // Prevent path traversal
        if (!filePath.startsWith(SKETCHES_DIR)) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid name' }));
          return;
        }

        // POST /api/sketches/:name — save sketch to disk
        if (req.method === 'POST') {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const body = JSON.parse(Buffer.concat(chunks).toString());
          fs.writeFileSync(filePath, body.code, 'utf-8');
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        // DELETE /api/sketches/:name — delete sketch file
        if (req.method === 'DELETE') {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        next();
      });
    },
  };
}

function sketchesBundlePlugin() {
  return {
    name: 'sketches-bundle',
    writeBundle(options) {
      const outDir = options.dir || path.resolve(__dirname, 'dist');
      const files = fs.readdirSync(SKETCHES_DIR)
        .filter(f => f.endsWith('.js'))
        .sort();
      const sketches = files.map(f => ({
        name: f.replace(/\.js$/, ''),
        code: fs.readFileSync(path.join(SKETCHES_DIR, f), 'utf-8'),
      }));
      fs.writeFileSync(
        path.join(outDir, 'sketches.json'),
        JSON.stringify(sketches),
      );
    },
  };
}

export default defineConfig({
  plugins: [sketchesApiPlugin(), sketchesBundlePlugin()],
  server: {
    watch: {
      ignored: ['**/sketches/**'],
    },
  },
});
