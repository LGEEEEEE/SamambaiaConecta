import prisma from '../config/prisma.js';

export const ocorrenciaController = {
  async listar(req, res) {
    try {
      const limiteTresDias = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      const ocorrencias = await prisma.ocorrencia.findMany({
        where: {
          OR: [
            { status: { not: 'RESOLVIDO' } },
            { resolvidoEm: { gte: limiteTresDias } },
            { resolvidoEm: null },
          ],
        },
        orderBy: [{ apoios: 'desc' }, { criadoEm: 'desc' }],
      });

      res.json(ocorrencias);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async criar(req, res) {
    try {
      const {
        titulo, descricao, categoria, cep, quadra, localizacao,
        latitude, longitude, imagemBase64, autor, anonimo
      } = req.body;

      const ehAnonimo = Boolean(anonimo);
      const nova = await prisma.ocorrencia.create({
        data: {
          titulo: titulo.trim(),
          descricao: descricao.trim(),
          categoria,
          cep: cep?.trim() || null,
          quadra: quadra.trim().toUpperCase(),
          localizacao: localizacao.trim(),
          latitude: Number(latitude) || -15.8755,
          longitude: Number(longitude) || -48.0860,
          imagemBase64: imagemBase64 || null,
          anonimo: ehAnonimo,
          autor: ehAnonimo ? 'Denúncia Anônima' : (autor?.trim() || 'Morador'),
        },
      });

      res.status(201).json(nova);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async apoiar(req, res) {
    try {
      const atualizada = await prisma.ocorrencia.update({
        where: { id: Number(req.params.id) },
        data: { apoios: { increment: 1 } },
      });
      res.json(atualizada);
    } catch (error) {
      res.status(400).json({ erro: 'Ocorrência não encontrada.' });
    }
  },

  async atualizarStatus(req, res) {
    try {
      const { status } = req.body;
      const atualizada = await prisma.ocorrencia.update({
        where: { id: Number(req.params.id) },
        data: {
          status,
          resolvidoEm: status === 'RESOLVIDO' ? new Date() : null,
        },
      });
      res.json(atualizada);
    } catch (error) {
      res.status(400).json({ erro: 'Erro ao atualizar status.' });
    }
  },

  async remover(req, res) {
    try {
      await prisma.ocorrencia.delete({
        where: { id: Number(req.params.id) },
      });
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ erro: 'Erro ao remover ocorrência.' });
    }
  },
};