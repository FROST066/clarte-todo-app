import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 8080;
const { app } = createApp();

const server = app.listen(PORT, () => {
  console.log(`Serveur Clarté Todo démarré sur http://localhost:${PORT}`);
});

export default server;
