import { Request, Response } from 'express';
import { db } from '../db.js';

// Godown stocks & silos
export const getGodownStocks = async (req: Request, res: Response) => {
  try {
    const stocks = await db.godownStocks.find();
    res.json(stocks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
