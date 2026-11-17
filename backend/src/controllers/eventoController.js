import prisma from '../config/prisma.js';

export const eventoController = {
  async listar(req, res) {
    try {
      const eventos = await prisma.evento.findMany({
        orderBy: { criadoEm: 'desc' },
      });
      res.json(eventos);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async criar(req, res) {
    try {
      const {
        titulo,
        descricao,
        dataEvento,
        cep,
        quadra,
        local,
        latitude,
        longitude,
        imagemBase64,
        organizador,
      } = req.body;

      const novo = await prisma.evento.create({
        data: {
          titulo: titulo.trim(),
          descricao: descricao?.trim() || '',
          dataEvento: dataEvento.trim(),
          cep: cep?.trim() || null,
          quadra: quadra.trim().toUpperCase(),
          local: local.trim(),
          latitude: Number(latitude) || -15.8755,
          longitude: Number(longitude) || -48.0860,
          imagemBase64: imagemBase64 || null,
          organizador: organizador.trim(),
        },
      });
      res.status(201).json(novo);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async remover(req, res) {
    try {
      await prisma.evento.delete({
        where: { id: Number(req.params.id) },
      });
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ erro: 'Erro ao remover evento.' });
    }
  },
};  ''