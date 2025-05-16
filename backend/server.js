// server.js
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const cookieParser = require('cookie-parser');
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
        this.app.use(cookieParser());

        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: './tmp/',
        }));

        this.app.use('/uploads', express.static('uploads'));
    }

    cargarRutas() {
        this.app.use("/api/vehiculos", require('./routes/vehiculos'));
        this.app.use("/api/pedidos", require('./routes/pedidos'));
        this.app.use("/api/rutas", require('./routes/rutas'));
        this.app.use("/api/feedback", require('./routes/feedback'));
    }
}

module.exports = Server;
