import { Router } from 'express';
import { eventoController } from '../controllers/eventoController.js';
import { validateEvento } from '../middlewares/validateBody.js';

const router = Router();

router.get('/', eventoController.listar);
router.post('/', validateEvento, eventoController.criar);
router.delete('/:id', eventoController.remover);

export default router;