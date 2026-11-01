import { Router } from 'express';
import {
  getCompassCollections,
  getCollectionDocs,
  createCollectionDoc,
  deleteCollectionDoc,
} from '../controllers/compassController.js';

const router = Router();

router.get('/collections', getCompassCollections);
router.get('/collection/:name', getCollectionDocs);
router.post('/collection/:name', createCollectionDoc);
router.delete('/collection/:name/:id', deleteCollectionDoc);

export default router;
