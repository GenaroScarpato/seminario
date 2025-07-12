const jwt = require('jsonwebtoken');

const validarJWT = (req, res, next) => {
  const token = req.header('x-token') || req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ msg: 'No hay token en la petición' });
  }

  try {
    // Si el token viene con "Bearer ", lo quitamos
    const tokenSinBearer = token.startsWith('Bearer ') ? token.slice(7) : token;

    const payload = jwt.verify(tokenSinBearer, process.env.JWT_SECRET);
    req.user = payload; // guardamos data del token para usar en rutas
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Token no válido' });
  }
};

module.exports = validarJWT;
