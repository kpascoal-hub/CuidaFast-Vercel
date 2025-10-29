const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/UsuarioModel');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'change_this_access_secret';

module.exports = async function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) return res.status(401).json({ message: 'Token ausente' });

  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET);
    const user = await UsuarioModel.getById(payload.id);
    if (!user) return res.status(401).json({ message: 'Usuário não encontrado' });

    delete user.senha;
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};
