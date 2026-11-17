export const errorHandler = (err, req, res, next) => {
  console.error('[API Error]:', err);

  if (err.code === 'P2025') {
    return res.status(404).json({ erro: 'Registro não encontrado.' });
  }

  res.status(err.status || 500).json({
    erro: err.message || 'Erro interno no servidor.',
  });
};