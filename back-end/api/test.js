const express = require('express');
const app = express();
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ ok: true, rota: 'auth funcionando!' });
});

app.use('/api/auth', router);

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
