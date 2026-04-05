import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApiApp } from './apiRouter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const port = Number(process.env.PORT ?? 80);
const host = process.env.HOST ?? '0.0.0.0';

const app = express();
app.use('/api', createApiApp());
app.use(express.static(distDir));

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    next();
    return;
  }
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) next(err);
  });
});

app.listen(port, host, () => {
  console.log(`nasmono-home listening on http://${host}:${port}`);
});
