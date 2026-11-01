import { Request, Response } from 'express';
import { db } from '../db.js';

// Mandi centers & load balancing
export const getMandis = async (req: Request, res: Response) => {
  try {
    const mandis = await db.mandis.find();
    res.json(mandis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
