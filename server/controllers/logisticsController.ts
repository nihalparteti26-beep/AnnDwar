import { Request, Response } from 'express';
import { db } from '../db.js';

// Logistics loads & transport pooling
export const getLogistics = async (req: Request, res: Response) => {
  try {
    const loads = await db.logistics.find();
    res.json(loads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
