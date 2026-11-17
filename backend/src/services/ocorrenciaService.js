import { prisma } from '../config/prisma.js';

const STATUS_VALIDOS = ['ABERTO', 'EM_ANDAMENTO', 'RESOLVIDO'];

export const ocorrenciaService = {
  async listar({ categoria, status }) {
    return prisma.ocorrencia.findMany({
      where: {
        ...(categoria && { categoria }),
        ...(status && { status }),
      },
      orderBy: { criadoEm: 'desc' },
    });
  },

  async criar({ titulo, descricao, categoria, localizacao, autor }) {
    return prisma.ocorrencia.create({
      data: {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria: categoria.trim(),
        localizacao: localizacao.trim(),
        autor: autor?.trim() || 'Morador QR 406',
      },
    });
  },

  async apoiar(id) {
    return prisma.ocorrencia.update({
      where: { id },
      data: { apoios: { increment: 1 } },
    });
  },

  async atualizarStatus(id, status) {
    if (!STATUS_VALIDOS.includes(status)) {
      const error = new Error(`Status inválido. Use: ${STATUS_VALIDOS.join(', ')}`);
      error.status = 400;
      throw error;
    }

    return prisma.ocorrencia.update({
      where: { id },
      data: { status },
    });
  },

  async remover(id) {
    return prisma.ocorrencia.delete({ where: { id } });
  },
};