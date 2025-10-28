const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ msg: 'Usuário já existe' });

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoUser = new User({ nome, email, senha: senhaHash });
    await novoUser.save();

    res.json({ msg: 'Usuário registrado com sucesso' });
  } catch (err) {
    res.status(500).json({ msg: 'Erro no servidor' });
  }
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Usuário não encontrado' });

    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) return res.status(400).json({ msg: 'Senha incorreta' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user._id, nome: user.nome, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: 'Erro no servidor' });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch {
    res.status(500).json({ msg: 'Erro no servidor' });
  }
});

module.exports = router;
