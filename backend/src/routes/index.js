import { Router } from 'express';
import ocorrenciaRoutes from './ocorrenciaRoutes.js';
import eventoRoutes from './eventoRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    projeto: 'Samambaia Conecta – Portal QR 406-416 + SMT',
    timestamp: new Date(),
  });
});

router.use('/ocorrencias', ocorrenciaRoutes);
router.use('/eventos', eventoRoutes);

export default router;