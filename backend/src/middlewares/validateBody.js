const REGIOES_VALIDAS = [
  'QR 402', 'QR 404', 'QR 406', 'QR 408',
  'QR 410', 'QR 412', 'QR 414', 'QR 416', 'SMT'
];

const MAX_BYTES_IMAGEM = 5 * 1024 * 1024; // 5 MB reais decodificados

function validarImagemBase64(imagemBase64) {
  if (!imagemBase64) return null;

  const match = imagemBase64.match(/^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    return 'Formato de imagem inválido. Envie JPEG, PNG ou WebP.';
  }

  const bytesReais = Buffer.byteLength(match[2], 'base64');
  if (bytesReais > MAX_BYTES_IMAGEM) {
    return `Imagem excede o limite de 5MB (${(bytesReais / (1024 * 1024)).toFixed(2)}MB enviados).`;
  }

  return null;
}

export const validateOcorrencia = (req, res, next) => {
  const { titulo, descricao, categoria, quadra, localizacao, imagemBase64 } = req.body;

  if (!titulo?.trim() || !descricao?.trim() || !categoria?.trim() || !localizacao?.trim()) {
    return res.status(400).json({ erro: 'Preencha título, descrição, categoria e localização.' });
  }

  if (!REGIOES_VALIDAS.includes(quadra)) {
    return res.status(400).json({ erro: 'Selecione uma quadra válida (QR 402 a 416 ou SMT).' });
  }

  const erroImagem = validarImagemBase64(imagemBase64);
  if (erroImagem) return res.status(400).json({ erro: erroImagem });

  next();
};

export const validateEvento = (req, res, next) => {
  const { titulo, dataEvento, quadra, local, organizador, imagemBase64 } = req.body;

  if (!titulo?.trim() || !dataEvento?.trim() || !local?.trim() || !organizador?.trim()) {
    return res.status(400).json({ erro: 'Preencha título, data, local e organizador.' });
  }

  if (!REGIOES_VALIDAS.includes(quadra)) {
    return res.status(400).json({ erro: 'Selecione uma quadra válida (QR 402 a 416 ou SMT).' });
  }

  const erroImagem = validarImagemBase64(imagemBase64);
  if (erroImagem) return res.status(400).json({ erro: erroImagem });

  next();
};