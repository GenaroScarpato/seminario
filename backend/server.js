// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg'); // PostgreSQL

class Server {
    constructor() {
        this.port = process.env.PORT || 3000;
        this.app = express();

        // Inicializar la conexión a PostgreSQL
        this.pool = new Pool({
            connectionString: process.env.DB_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });

        // Verificar conexión a BD
        this.pool.connect()
            .then(client => {
                console.log('✅ Conectado a la base de datos PostgreSQL');
                client.release();
            })
            .catch(err => {
                console.error('❌ Error conectando a la base de datos:', err.message);
            });

        // Hacer pool accesible en req
        this.app.use((req, res, next) => {
            req.pool = this.pool;
            next();
        });

        this.cargarMiddlewares();
        this.cargarRutas();
    }

    listen() {
        this.app.listen(this.port, '0.0.0.0', () => {
            console.log(`🚀 Servidor escuchando en el puerto ${this.port}`);
        });
    }

    cargarMiddlewares() {
                
        // Configuración de CORS
        this.app.use(cors({
            origin: (origin, callback) => {
                const allowlist = ['http://localhost:5173', 'http://192.168.0.231:5173'];
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

        // Middleware para logging de errores
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
        this.app.use("/api/feedback", require('./routes/feedback'));
        this.app.use("/api/conductores", require('./routes/conductores'));

        console.log('🛣️ Rutas cargadas');
    }
}

module.exports = Server;
