const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const conductorController = require('../controllers/conductores');

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/conductores');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Aceptar cualquier tipo de archivo
const fileFilter = (req, file, cb) => {
    cb(null, true);
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1
    }
});

// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'El archivo es demasiado grande. El tamaño máximo permitido es de 10MB.'
            });
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Demasiados archivos. Solo se permite un archivo a la vez.'
            });
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error: 'Campo de archivo no esperado. Asegúrate de que el campo del formulario se llame "archivo".'
            });
        } else {
            return res.status(400).json({
                success: false,
                error: `Error al cargar el archivo: ${err.message}`
            });
        }
    } else if (err) {
        return res.status(400).json({
            success: false,
            error: err.message || 'Error al procesar el archivo.'
        });
    }
    next();
};

// Ruta para diagnóstico estructura tabla conductores
router.get('/debug/estructura', async (req, res) => {
    try {
        const columnas = await req.pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'conductores';
        `);

        const restricciones = await req.pool.query(`
            SELECT conname, contype, pg_get_constraintdef(oid) as definicion
            FROM pg_constraint 
            WHERE conrelid = 'conductores'::regclass;
        `);

        const indices = await req.pool.query(`
            SELECT indexname, indexdef 
            FROM pg_indexes 
            WHERE tablename = 'conductores';
        `);

        res.status(200).json({
            success: true,
            columnas: columnas.rows,
            restricciones: restricciones.rows,
            indices: indices.rows
        });
    } catch (error) {
        console.error('Error al verificar estructura de la tabla:', error);
        res.status(500).json({
            success: false,
            error: 'Error al verificar la estructura de la tabla',
            details: error.message
        });
    }
});

// Obtener todos los conductores
router.get('/', async (req, res) => {
    let client;
    try {
        client = await req.pool.connect();

        const tableExists = await client.query(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conductores')"
        );
        
        if (!tableExists.rows[0].exists) {
            console.error('La tabla "conductores" no existe en la base de datos');
            return res.status(500).json({ 
                success: false,
                error: 'La tabla de conductores no está configurada correctamente',
                details: 'Tabla no encontrada en la base de datos',
                code: 'TABLE_NOT_FOUND'
            });
        }

        const result = await client.query(`
            SELECT 
                id, 
                nombre, 
                COALESCE(apellido, '') as apellido, 
                email, 
                COALESCE(telefono, '') as telefono,
                COALESCE(url_licencia, '') as url_licencia, 
                COALESCE(estado, 'disponible') as estado
            FROM conductores 
            ORDER BY nombre, apellido NULLS LAST
        `);

        res.status(200).json({
            success: true,
            count: result.rowCount,
            data: result.rows
        });

    } catch (error) {
        console.error('Error al obtener conductores:', error);

        let statusCode = 500;
        let errorMessage = 'Error al obtener los conductores';
        let errorCode = 'INTERNAL_SERVER_ERROR';

        if (error.code === '42P01') { 
            statusCode = 500;
            errorMessage = 'La tabla de conductores no está configurada correctamente';
            errorCode = 'TABLE_NOT_FOUND';
        } else if (error.code === '42P07') {
            statusCode = 500;
            errorMessage = 'Conflicto en la base de datos';
            errorCode = 'DUPLICATE_TABLE';
        }

        res.status(statusCode).json({ 
            success: false,
            error: errorMessage,
            code: errorCode
        });

    } finally {
        if (client) client.release();
    }
});

router.post('/', (req, res) => {
    conductorController.create(req, res);
});

// Obtener un conductor por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await req.pool.query(
            `SELECT 
                id, nombre, COALESCE(apellido, '') as apellido, email, COALESCE(telefono, '') as telefono,
                COALESCE(url_licencia, '') as url_licencia, estado, archivo_url, tipo_archivo,
                TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
                TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at
            FROM conductores WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Conductor no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error al obtener conductor por ID:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener el conductor'
        });
    }
});

// Actualizar conductor por ID
router.put('/:id', upload.single('archivo'), handleMulterError, async (req, res) => {
    const { id } = req.params;
    const { 
        nombre, 
        apellido, 
        email, 
        telefono, 
        url_licencia, 
        estado,
        tipo_archivo
    } = req.body;

    let archivo_url = undefined;
    if (req.file) {
        archivo_url = `/uploads/conductores/${req.file.filename}`;
    }

    if (!nombre || !email || !url_licencia) {
        if (req.file) {
            fs.unlink(req.file.path, err => {
                if (err) console.error('Error al eliminar archivo temporal:', err);
            });
        }
        return res.status(400).json({
            success: false,
            error: 'Los campos nombre, email y url_licencia son obligatorios'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        if (req.file) {
            fs.unlink(req.file.path, err => {
                if (err) console.error('Error al eliminar archivo temporal:', err);
            });
        }
        return res.status(400).json({
            success: false,
            error: 'El formato del correo electrónico no es válido'
        });
    }

    let client;
    try {
        client = await req.pool.connect();
        await client.query('BEGIN');

        // Verificar si email o url_licencia ya están usados por otro conductor distinto a este
        const emailExistente = await client.query(
            'SELECT id FROM conductores WHERE email = $1 AND id <> $2',
            [email, id]
        );
        if (emailExistente.rows.length > 0) {
            await client.query('ROLLBACK');
            if (req.file) {
                fs.unlink(req.file.path, err => {
                    if (err) console.error('Error al eliminar archivo temporal:', err);
                });
            }
            return res.status(409).json({
                success: false,
                error: 'El correo electrónico ya está registrado por otro conductor'
            });
        }

        const licenciaExistente = await client.query(
            'SELECT id FROM conductores WHERE url_licencia = $1 AND id <> $2',
            [url_licencia, id]
        );
        if (licenciaExistente.rows.length > 0) {
            await client.query('ROLLBACK');
            if (req.file) {
                fs.unlink(req.file.path, err => {
                    if (err) console.error('Error al eliminar archivo temporal:', err);
                });
            }
            return res.status(409).json({
                success: false,
                error: 'El número de licencia ya está registrado por otro conductor'
            });
        }

        // Obtener conductor actual para eliminar archivo viejo si hay cambio
        const conductorActual = await client.query(
            'SELECT archivo_url FROM conductores WHERE id = $1',
            [id]
        );

        if (conductorActual.rows.length === 0) {
            await client.query('ROLLBACK');
            if (req.file) {
                fs.unlink(req.file.path, err => {
                    if (err) console.error('Error al eliminar archivo temporal:', err);
                });
            }
            return res.status(404).json({
                success: false,
                error: 'Conductor no encontrado'
            });
        }

        if (archivo_url && conductorActual.rows[0].archivo_url) {
            // Eliminar archivo viejo
            const archivoViejoPath = path.join(__dirname, '..', conductorActual.rows[0].archivo_url);
            fs.unlink(archivoViejoPath, (err) => {
                if (err) console.error('Error al eliminar archivo antiguo:', err);
            });
        }

        const updateQuery = `
            UPDATE conductores SET
                nombre = $1,
                apellido = $2,
                email = $3,
                telefono = $4,
                url_licencia = $5,
                estado = $6,
                tipo_archivo = $7
                ${archivo_url ? ', archivo_url = $8' : ''}
            WHERE id = $9
            RETURNING *
        `;

        const values = [
            nombre,
            apellido || null,
            email,
            telefono || null,
            url_licencia,
            estado || 'disponible',
            tipo_archivo || 'documento'
        ];

        if (archivo_url) values.push(archivo_url);
        values.push(id);

        const result = await client.query(updateQuery, values);
        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            data: result.rows[0],
            message: 'Conductor actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar conductor:', error);
        if (client) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                console.error('Error al hacer rollback:', rollbackError);
            }
        }
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, err => {
                if (err) console.error('Error al eliminar archivo temporal:', err);
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error al actualizar el conductor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (client) client.release();
    }
});

// Eliminar conductor por ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    let client;
    try {
        client = await req.pool.connect();
        await client.query('BEGIN');

        // Obtener conductor para eliminar archivo
        const conductor = await client.query(
            'SELECT archivo_url FROM conductores WHERE id = $1',
            [id]
        );

        if (conductor.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                error: 'Conductor no encontrado'
            });
        }

        // Eliminar conductor
        await client.query('DELETE FROM conductores WHERE id = $1', [id]);

        await client.query('COMMIT');

        // Eliminar archivo si existe
        if (conductor.rows[0].archivo_url) {
            const archivoPath = path.join(__dirname, '..', conductor.rows[0].archivo_url);
            fs.unlink(archivoPath, (err) => {
                if (err) console.error('Error al eliminar archivo asociado:', err);
            });
        }

        res.status(200).json({
            success: true,
            message: 'Conductor eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar conductor:', error);
        if (client) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                console.error('Error al hacer rollback:', rollbackError);
            }
        }
        res.status(500).json({
            success: false,
            error: 'Error al eliminar el conductor'
        });
    } finally {
        if (client) client.release();
    }
});

module.exports = router;
