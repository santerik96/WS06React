const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const postsRouter = require('./routes/posts');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is missing. Create a .env file in backend/ before testing database features.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'blog' });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
  }
}

app.locals.publicDir = publicDir;
app.use(express.json());
app.use(express.static(publicDir));

app.use('/api/posts', postsRouter);

// Tarjoile käännetty React-sovellus
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

// Ohjaa kaikki muut paitsi /api-pyynnöt React-reitittimelle
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// 404 handler (vain /api-reiteille, joita ei löytynyt)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 500 error handler
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ error: 'Internal server error' });
});

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Mounted routers:');
    console.log('  /api/posts -> routes/posts.js');
  });
});