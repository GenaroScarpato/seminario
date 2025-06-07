const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');
const vehiclesRouter = require('./routes/vehicles');
const conductoresRouter = require('./routes/conductores');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Asegúrate de que coincida con la URL de tu frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/vehiculos', vehiclesRouter);
app.use('/api/conductores', conductoresRouter);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
