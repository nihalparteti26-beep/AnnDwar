// import 'dotenv/config';
// import express from 'express';
// import path from 'path';
// // import { fileURLToPath } from 'url';
// import { createServer as createViteServer } from 'vite';
// import apiRouter from './server/routes/index.js';

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes/index.js';


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
 

  app.use(express.json({ limit: '20mb' }));

  // --- MODULAR API ROUTES ---
  app.use('/api', apiRouter);

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(process.env.PORT) || 3000, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
});
}

startServer();
