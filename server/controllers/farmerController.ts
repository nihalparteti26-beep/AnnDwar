// OTP Verification bypassed for seamless onboarding
import { Request, Response } from 'express';
import { 
  db, 
  getActiveFarmer, 
  registerFarmerData, 
  updateDbtPaymentStatus, 
  dbtPaymentStatus, 
  dbtUtrNumber,
  activeFarmerId,
  syncQueueWithFarmer,
  operatorQueueList
} from '../db.js';
import { AuthUser } from '../../src/types.js';

// Get active farmer profile
export const getFarmerProfile = async (req: Request, res: Response) => {
  try {
    const farmer = await getActiveFarmer();
    res.json(farmer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update farmer profile
export const updateFarmerProfile = async (req: Request, res: Response) => {
  try {
    const farmer = await getActiveFarmer();
    if (farmer) {
      const updated = await db.farmers.updateOne(farmer.id, req.body);
      const slot = (await db.slots.findById('slot_' + farmer.id)) || (await db.slots.findOne());
      try {
        syncQueueWithFarmer(updated, slot);
      } catch (err) {
        console.error('Profile queue sync error:', err);
      }
      return res.json(updated);
    }
    res.status(404).json({ error: 'Farmer profile not found' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get farmer KYC digital documents
export const getFarmerDocuments = async (req: Request, res: Response) => {
  try {
    const docs = await db.documents.find();
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get farmer payment history
export const getFarmerPayments = async (req: Request, res: Response) => {
  try {
    const payments = await db.payments.find();
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Register a new farmer with all details (no hardcoded fixed values)
export const registerFarmer = async (req: Request, res: Response) => {
  try {
    const phone = req.body.phone;
    // Direct registration without OTP requirement
    const result = await registerFarmerData(req.body);
    const authUser: AuthUser = {
      id: result.farmer.id,
      name: `${result.farmer.nameHi} (${result.farmer.nameEn || result.farmer.nameHi})`,
      role: 'farmer',
      phoneOrEmail: result.farmer.phone,
      stationOrCenter: `${result.slot.mandiCenterName} (${result.slot.gateNumber})`
    };
    res.json({
      success: true,
      user: authUser,
      farmer: result.farmer,
      slot: result.slot,
      documents: result.documents,
      stages: result.stages,
      payment: result.payment
    });
  } catch (error: any) {
    console.error('Registration failed:', error);
    res.status(500).json({ error: error.message });
  }
};

// Farmer login endpoint
export const loginFarmer = async (req: Request, res: Response) => {
  try {
    const { identifier, pin } = req.body;
    const cleanId = (identifier || '').trim().toLowerCase();
    
    // Look for matching farmer in db
    const farmers = await db.farmers.find();
    const matched = farmers.find(f => 
      f.phone.includes(cleanId) || 
      f.id.toLowerCase() === cleanId || 
      f.nameHi.includes(cleanId) ||
      (f.nameEn && f.nameEn.toLowerCase().includes(cleanId))
    );

    const farmerToUse = matched || await getActiveFarmer();
    if (!farmerToUse) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    const slot = (await db.slots.findById('slot_' + farmerToUse.id)) || (await db.slots.findOne());
    const authUser: AuthUser = {
      id: farmerToUse.id,
      name: `${farmerToUse.nameHi} (${farmerToUse.nameEn || farmerToUse.nameHi})`,
      role: 'farmer',
      phoneOrEmail: farmerToUse.phone,
      stationOrCenter: slot ? `${slot.mandiCenterName} (${slot.gateNumber})` : 'सांवेर उपार्जन केंद्र (गेट #02)'
    };

    // Real-time synchronization with Mandi Operator Yard Queue
    try {
      syncQueueWithFarmer(farmerToUse, slot);
    } catch (qErr) {
      console.error('Queue sync error on login:', qErr);
    }

    res.json({
      success: true,
      user: authUser,
      farmer: farmerToUse,
      slot
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Admin / Mandi Operator update DBT payment status
export const updateFarmerDbt = async (req: Request, res: Response) => {
  try {
    const rawStatus = req.body.status;
    const status = (rawStatus === 'paid' || rawStatus === 'credit_successful') ? 'credit_successful' : rawStatus;
    const utr = req.body.utr || req.body.utrNumber;
    const result = await updateDbtPaymentStatus(status, utr);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
