exports.obtenerTodos = async (pool) => {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY id');
    return result.rows;
};

exports.crear = async (pool, data) => {
    const result = await pool.query(
        'INSERT INTO vehicles (name, capacity) VALUES ($1, $2) RETURNING *',
        [data.name, data.capacity]
    );
    return result.rows[0];
};

exports.actualizar = async (pool, id, data) => {
    const result = await pool.query(
        'UPDATE vehicles SET name = $1, capacity = $2 WHERE id = $3 RETURNING *',
        [data.name, data.capacity, id]
    );
    return result.rows[0];
};

exports.eliminar = async (pool, id) => {
    await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
};
