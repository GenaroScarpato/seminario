const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const loginConductor = async (req, res) => {
    const { dni, password } = req.body;
    if (!dni || !password) {
        return res.status(400).json({ msg: 'DNI y contraseña requeridos' });
    }
    try {
        const pool = req.pool;

        const result = await pool.query('SELECT * FROM conductores WHERE dni = $1', [dni]);
        if (result.rows.length === 0) {
            return res.status(401).json({ msg: 'DNI o contraseña incorrectos' });
        }
        const conductor = result.rows[0];
        const match = await bcrypt.compare(password, conductor.password);
        if (!match) {
            return res.status(401).json({ msg: 'DNI o contraseña incorrectos' });
        }

        // Generar token con datos mínimos
        const token = jwt.sign(
            { id: conductor.id, dni: conductor.dni }, // Solo datos esenciales
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        // Eliminar la contraseña del objeto conductor antes de enviarlo
        delete conductor.password;

        // Enviar token + todos los datos del conductor
        res.json({ 
            token,
            user: {
                id: conductor.id,
                nombre: conductor.nombre,
                apellido: conductor.apellido,
                dni: conductor.dni,
                telefono: conductor.telefono,
                email: conductor.email,
                direccion: conductor.direccion,
                url_licencia: conductor.url_licencia,
                estado: conductor.estado,
                vehiculo_id: conductor.vehiculo_id,
                created_at: conductor.created_at
            }
        });
    } catch (error) {
        console.error('Error en login:', error.message);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
};

module.exports = { loginConductor };