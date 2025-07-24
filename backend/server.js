// server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server: SocketServer } = require('socket.io');
const { Pool } = require('pg');

class Server {
    constructor() {
        this.port = process.env.PORT || 3000;
        this.app = express();
        this.httpServer = http.createServer(this.app); // importante

        // Inicializar la conexión a PostgreSQL
        this.pool = new Pool({
            connectionString: process.env.DB_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });

        // Verificar conexión
        this.pool.connect()
            .then(client => {
                console.log('✅ Conectado a la base de datos PostgreSQL');
                client.release();
            })
            .catch(err => {
                console.error('❌ Error conectando a la base de datos:', err.message);
            });

        this.app.use((req, res, next) => {
            req.pool = this.pool;
            next();
        });

        this.cargarMiddlewares();
        this.cargarRutas();
        this.configurarSocket(); // 🚀
    }

    listen() {
        this.httpServer.listen(this.port, '0.0.0.0', () => {
            console.log(`🚀 Servidor escuchando en el puerto ${this.port}`);
        });
    }

    cargarMiddlewares() {
        this.app.use(cors({
            origin: (origin, callback) => {
                const allowlist = [
                    'http://localhost:5173',
                    'http://192.168.0.231:5173',
                    'http://localhost:8081'                ];
                if (!origin || allowlist.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization', 'x-token'],
            credentials: true,
        }));

        this.app.use(express.json());

        this.app.use((err, req, res, next) => {
            console.error('Error en la aplicación:', {
                timestamp: new Date(),
                method: req.method,
                path: req.path,
                error: err,
                stack: err.stack
            });
            next(err);
        });

        console.log('⚙️ Middlewares cargados');
    }

    cargarRutas() {
        this.app.use("/api/vehiculos", require('./routes/vehiculos'));
        this.app.use("/api/pedidos", require('./routes/pedidos'));
        this.app.use("/api/rutas", require('./routes/rutas'));
        this.app.use("/api/conductores", require('./routes/conductores'));
        this.app.use("/api/auth", require('./routes/auth'));
        this.app.use("/api", require('./routes/asignacion'));
        this.app.use("/api/reportes", require('./routes/reportes'));

        console.log('🛣️ Rutas cargadas');
    }

    configurarSocket() {
  this.io = new SocketServer(this.httpServer, {
    cors: {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST"]
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000
    }
  });

  this.io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado:', socket.id);

    // Manejar mensajes de ubicación
    socket.on('ubicacion', (data) => {
    console.log('📍 Datos recibidos en servidor:', data); // Verifica que llegan los datos

      console.log('📍 Nueva ubicación:', data);
      
      // Validar datos
      if (!data || !data.lat || !data.lng || !data.dni) {
        console.warn('Datos de ubicación inválidos:', data);
        return;
      }

      // Añadir timestamp si no existe
      if (!data.timestamp) {
        data.timestamp = new Date().toISOString();
      }

      // Emitir a todos los clientes
      this.io.emit('ubicacion_conductor', data);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Cliente desconectado:', socket.id);
    });
  });
}
}

module.exports = Server;
