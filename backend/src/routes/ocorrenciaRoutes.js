import { Router } from 'express';
import { ocorrenciaController } from '../controllers/ocorrenciaController.js';
import { validateOcorrencia } from '../middlewares/validateBody.js';

const router = Router();

router.get('/', ocorrenciaController.listar);
router.post('/', validateOcorrencia, ocorrenciaController.criar);
router.patch('/:id/apoiar', ocorrenciaController.apoiar);
router.patch('/:id/status', ocorrenciaController.atualizarStatus);
router.delete('/:id', ocorrenciaController.remover);

export default router;