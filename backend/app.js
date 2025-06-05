const express = require('express');
const cors = require('cors');
const pool = require('./db');
const vehiclesRouter = require('./routes/vehicles');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/vehicles', vehiclesRouter);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
