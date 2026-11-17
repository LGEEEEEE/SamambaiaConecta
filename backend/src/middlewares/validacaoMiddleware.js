const MAX_IMAGEM_BYTES = 5 * 1024 * 1024; // 5MB

export function validarImagemBase64(req, res, next) {
  const { imagemBase64 } = req.body;
  if (!imagemBase64) return next();

  if (typeof imagemBase64 !== 'string' || !imagemBase64.startsWith('data:image/')) {
    return res.status(400).json({ erro: 'Formato de imagem inválido.' });
  }

  const base64Data = imagemBase64.split(',')[1] || '';
  const tamanhoEmBytes = Math.ceil((base64Data.length * 3) / 4);

  if (tamanhoEmBytes > MAX_IMAGEM_BYTES) {
    return res.status(413).json({ erro: 'A imagem excede o limite máximo de 5MB.' });
  }
  next();
}

export function validarOcorrencia(req, res, next) {
  const { titulo, descricao, categoria, quadra, localizacao } = req.body;

  if (!titulo?.trim() || !descricao?.trim() || !categoria?.trim() || !localizacao?.trim()) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }

  if (!quadra || quadra.trim().length < 2) {
    return res.status(400).json({ erro: 'Informe a quadra ou setor de Samambaia.' });
  }

  next();
}

export function validarEvento(req, res, next) {
  const { titulo, dataEvento, quadra, local, organizador } = req.body;

  if (!titulo?.trim() || !dataEvento?.trim() || !local?.trim() || !organizador?.trim() || !quadra?.trim()) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios do evento.' });
  }

  next();
}