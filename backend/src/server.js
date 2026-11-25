import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI manquant : configurez backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connecté (${mongoose.connection.host})`);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API démarrée sur http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Impossible de démarrer le serveur :', error.message);
    process.exit(1);
  }
};

start();
