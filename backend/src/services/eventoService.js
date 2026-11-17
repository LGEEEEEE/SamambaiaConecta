import { prisma } from '../config/prisma.js';

export const eventoService = {
  async listar() {
    return prisma.evento.findMany({
      orderBy: { criadoEm: 'desc' },
    });
  },

  async criar({ titulo, descricao, dataEvento, local, organizador }) {
    return prisma.evento.create({
      data: {
        titulo: titulo.trim(),
        descricao: descricao?.trim() || '',
        dataEvento: dataEvento.trim(),
        local: local.trim(),
        organizador: organizador.trim(),
      },
    });
  },

  async remover(id) {
    return prisma.evento.delete({ where: { id } });
  },
};