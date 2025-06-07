const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/conductores');
        // Crear el directorio si no existe
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Usar un nombre único para evitar colisiones
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
        fileSize: 10 * 1024 * 1024, // Límite de 10MB
        files: 1 // Solo permitir un archivo a la vez
    }
});

// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Un error de Multer al cargar
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
            // Otros errores de multer
            return res.status(400).json({
                success: false,
                error: `Error al cargar el archivo: ${err.message}`
            });
        }
    } else if (err) {
        // Un error del fileFilter u otro error
        return res.status(400).json({
            success: false,
            error: err.message || 'Error al procesar el archivo.'
        });
    }
    
    // Si no hay errores, pasar al siguiente middleware
    next();
};

// Ruta de diagnóstico para verificar la estructura de la tabla
router.get('/debug/estructura', async (req, res) => {
    try {
        // Obtener información de columnas
        const columnas = await req.pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'conductores';
        `);

        // Obtener restricciones
        const restricciones = await req.pool.query(`
            SELECT conname, contype, pg_get_constraintdef(oid) as definicion
            FROM pg_constraint 
            WHERE conrelid = 'conductores'::regclass;
        `);

        // Obtener índices
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
        // Obtener un cliente del pool
        client = await req.pool.connect();
        
        // Verificar si la tabla existe
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
        
        // Obtener los conductores con la estructura simplificada
        const result = await client.query(`
            SELECT 
                id, 
                nombre, 
                COALESCE(apellido, '') as apellido, 
                email, 
                COALESCE(telefono, '') as telefono,
                COALESCE(licencia, '') as licencia, 
                COALESCE(estado, 'disponible') as estado,
                COALESCE(archivo_url, '') as archivo_url,
                COALESCE(tipo_archivo, 'documento') as tipo_archivo,
                TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
                TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at
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
        
        // Manejar errores específicos de PostgreSQL
        let statusCode = 500;
        let errorMessage = 'Error al obtener los conductores';
        let errorCode = 'INTERNAL_SERVER_ERROR';
        
        if (error.code === '42P01') { // Tabla no existe
            statusCode = 500;
            errorMessage = 'La tabla de conductores no está configurada correctamente';
            errorCode = 'TABLE_NOT_FOUND';
        } else if (error.code === '42P07') { // Tabla duplicada
            statusCode = 500;
            errorMessage = 'Conflicto en la base de datos';
            errorCode = 'DUPLICATE_TABLE';
        }
        
        res.status(statusCode).json({ 
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
            code: errorCode
        });
        
    } finally {
        // Liberar el cliente de vuelta al pool
        if (client) {
            client.release();
        }
    }
});

// Crear un nuevo conductor con manejo de archivos simplificado
router.post('/', upload.single('archivo'), handleMulterError, async (req, res) => {
    const { 
        nombre, 
        apellido, 
        email, 
        telefono, 
        licencia, 
        estado = 'disponible',
        tipo_archivo = 'documento'
    } = req.body;
    
    // Obtener la URL del archivo si se subió uno
    const archivo_url = req.file ? `/uploads/conductores/${req.file.filename}` : '';
    
    // Validar campos requeridos
    const camposRequeridos = ['nombre', 'email', 'licencia'];
    const camposFaltantes = camposRequeridos.filter(campo => !req.body[campo]);
    
    if (camposFaltantes.length > 0) {
        // Eliminar el archivo subido si hay un error de validación
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error al eliminar archivo temporal:', err);
            });
        }
        
        return res.status(400).json({
            success: false,
            error: `Faltan campos requeridos: ${camposFaltantes.join(', ')}`
        });
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        // Eliminar el archivo subido si hay un error de validación
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
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
        
        // Validar que el email no esté ya registrado
        const emailExistente = await client.query(
            'SELECT id FROM conductores WHERE email = $1', 
            [email]
        );
        
        if (emailExistente.rows.length > 0) {
            await client.query('ROLLBACK');
            // Eliminar el archivo subido si el email ya existe
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error al eliminar archivo temporal:', err);
                });
            }
            
            return res.status(409).json({
                success: false,
                error: 'El correo electrónico ya está registrado'
            });
        }
        
        // Validar que la licencia no esté ya registrada
        const licenciaExistente = await client.query(
            'SELECT id FROM conductores WHERE licencia = $1',
            [licencia]
        );
        
        if (licenciaExistente.rows.length > 0) {
            await client.query('ROLLBACK');
            // Eliminar el archivo subido si la licencia ya existe
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error al eliminar archivo temporal:', err);
                });
            }
            
            return res.status(409).json({
                success: false,
                error: 'El número de licencia ya está registrado'
            });
        }
        
        // Insertar el nuevo conductor
        const query = `
            INSERT INTO conductores (
                nombre, apellido, email, telefono, licencia, 
                estado, archivo_url, tipo_archivo
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        
        const values = [
            nombre,
            apellido || null,
            email,
            telefono || null,
            licencia,
            estado,
            archivo_url,
            tipo_archivo
        ];
        
        const result = await client.query(query, values);
        
        // Confirmar transacción
        await client.query('COMMIT');
        
        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Conductor creado exitosamente'
        });
        
    } catch (error) {
        console.error('Error al crear conductor:', error);
        
        // Revertir transacción si hay un cliente activo
        if (client) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                console.error('Error al hacer rollback:', rollbackError);
            }
        }
        
        // Eliminar archivo subido en caso de error
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error al eliminar archivo temporal:', err);
            });
        }
        
        // Manejar errores específicos de PostgreSQL
        if (error.code === '23505') { // Violación de restricción única
            const detail = error.detail || '';
            let message = 'Error de validación: ';
            
            if (detail.includes('email')) {
                message = 'El correo electrónico ya está registrado';
            } else if (detail.includes('licencia')) {
                message = 'El número de licencia ya está registrado';
            } else {
                message = 'El registro ya existe';
            }
            
            return res.status(409).json({ 
                success: false,
                error: message 
            });
        } else if (error.code === '23502') { // Violación de NOT NULL
            return res.status(400).json({
                success: false,
                error: 'Faltan campos requeridos en la base de datos',
                details: error.column ? `Campo requerido: ${error.column}` : undefined
            });
        }
        
        // Error genérico
        console.error('Error en la base de datos:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al crear el conductor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        // Liberar el cliente de vuelta al pool
        if (client) {
            client.release();
        }
    }
});

// Obtener un conductor por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await req.pool.query('SELECT * FROM conductores WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Conductor no encontrado' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener conductor:', error);
        res.status(500).json({ error: 'Error al obtener el conductor' });
    }
});

// Actualizar un conductor
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, email, telefono, licencia, estado } = req.body;
    
    try {
        const result = await req.pool.query(
            'UPDATE conductores SET nombre = $1, apellido = $2, email = $3, telefono = $4, licencia = $5, estado = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
            [nombre, apellido, email, telefono, licencia, estado, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Conductor no encontrado' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar conductor:', error);
        res.status(500).json({ error: 'Error al actualizar el conductor' });
    }
});

// Eliminar un conductor
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await req.pool.query('DELETE FROM conductores WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Conductor no encontrado' });
        }
        
        res.status(200).json({ message: 'Conductor eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar conductor:', error);
        res.status(500).json({ error: 'Error al eliminar el conductor' });
    }
});

module.exports = router;
