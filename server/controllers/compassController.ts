import { Request, Response } from 'express';
import { db } from '../db.js';

// Returns collection names, document counts, and schema inspection for MERN / Compass fidelity
export const getCompassCollections = async (req: Request, res: Response) => {
  try {
    const collections = [
      { name: 'farmers', count: await db.farmers.count(), description: 'Farmer KYC & Land Registration records' },
      { name: 'documents', count: await db.documents.count(), description: 'UIDAI, Bhulekh, NPCI linked digital certificates' },
      { name: 'payments', count: await db.payments.count(), description: 'DBT Payment records & bank UTRs' },
      { name: 'slots', count: await db.slots.count(), description: 'Booked Mandi entry slots & active tokens' },
      { name: 'stages', count: await db.stages.count(), description: '7-Stage transparent procurement lifecycle state' },
      { name: 'mandis', count: await db.mandis.count(), description: 'Procurement centers, live queue capacities & scales' },
      { name: 'logistics', count: await db.logistics.count(), description: 'Load consolidation, routes & vehicle tracking' },
      { name: 'godown_stocks', count: await db.godownStocks.count(), description: 'Central warehouse silos and grain inventories' },
      { name: 'crop_prechecks', count: await db.cropChecks.count(), description: 'AI grain quality inspection audit logs' },
    ];
    res.json({
      database: 'anndwar_production',
      connectionUri: 'mongodb://localhost:27017/anndwar_production',
      collections,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get all documents in a collection
export const getCollectionDocs = async (req: Request, res: Response) => {
  try {
    const name = req.params.name;
    const target = (db as any)[name];
    if (!target) {
      return res.status(404).json({ error: `Collection ${name} not found` });
    }
    const docs = await target.find();
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new document in a collection
export const createCollectionDoc = async (req: Request, res: Response) => {
  try {
    const name = req.params.name;
    const target = (db as any)[name];
    if (!target) {
      return res.status(404).json({ error: `Collection ${name} not found` });
    }
    const doc = { id: 'doc_' + Date.now(), ...req.body };
    await target.create(doc);
    res.json({ success: true, document: doc });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a document in a collection
export const deleteCollectionDoc = async (req: Request, res: Response) => {
  try {
    const { name, id } = req.params;
    const target = (db as any)[name];
    if (!target) {
      return res.status(404).json({ error: `Collection ${name} not found` });
    }
    const ok = await target.deleteOne(id);
    res.json({ success: ok });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
