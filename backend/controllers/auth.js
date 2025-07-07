const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const loginConductor = async (req, res) => {
    const { dni, password } = req.body;
console.log(dni, password)
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
            return res.status(401).json({ msg: 'DNI o contraseña incorrectoss' });
        }

        const token = jwt.sign(
            { id: conductor.id, nombre: conductor.nombre, dni: conductor.dni },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Error en login:', error.message);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
};

module.exports = { loginConductor };
