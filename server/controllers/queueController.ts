import { Request, Response } from 'express';
import {
  db,
  getActiveSlot,
  updateStageStatus,
  getQueueList,
  getDirective,
  getNotificationsList,
  updateOperatorAction,
  activeFarmerId
} from '../db.js';

// Yard infrastructure constants (physical facility, not farmer data)
const ACTIVE_SCALES_COUNT = 4;
const YARD_CAPACITY = 50; // max vehicles the yard can comfortably hold
const BASE_PROCESSING_RATE_MIN = 3; // minutes per trolley per scale, baseline

// Live Queue & Token Tracker stats — now derived from the real, live operator queue
// instead of hardcoded numbers.
export const getLiveQueue = async (req: Request, res: Response) => {
  try {
    const activeSlot = await getActiveSlot();
    const queue = getQueueList();

    const totalVehicles = queue.length;

    // Find this farmer's own entry in the live queue (falls back to the first entry)
    const activeItem = queue.find(it => it.farmerId === activeFarmerId) || queue[0];

    // "Farmers ahead" = other farmers in the queue who haven't reached the final
    // "ready" (MSP slip issued) stage yet.
    const queueOrder = queue.filter(
      it => it.farmerId !== activeItem?.farmerId && it.stageType !== 'ready'
    ).length;

    // Processing rate improves slightly with more active scales; kept simple & bounded.
    const avgProcessingRateMin = Number((BASE_PROCESSING_RATE_MIN / ACTIVE_SCALES_COUNT * 2).toFixed(1));

    const estimatedWaitMinutes = Math.max(0, Math.round(queueOrder * avgProcessingRateMin));

    const yardLoadPercent = Math.min(100, Math.round((totalVehicles / YARD_CAPACITY) * 100));

    let yardLoadLevelHi = 'सुगम यातायात';
    let yardLoadLevelEn = 'Smooth Flow';
    if (yardLoadPercent >= 75) {
      yardLoadLevelHi = 'उच्च भार';
      yardLoadLevelEn = 'Heavy Load';
    } else if (yardLoadPercent >= 40) {
      yardLoadLevelHi = 'मध्यम भार';
      yardLoadLevelEn = 'Moderate Load';
    }

    const tokenNumber = activeItem?.token?.replace('#', '') || activeSlot?.tokenNumber || 'MP-2409';

    res.json({
      tokenNumber,
      vehicleNumber: activeItem?.vehicleNo || activeSlot?.vehicleNumber || 'MP-09-GE-4102',
      cropName: activeSlot?.cropName || activeItem?.crop || 'गेहूं (Sharbati)',
      mandiPremise: `${activeItem?.mandiName || activeSlot?.mandiCenterName || 'सांवेर उपार्जन केंद्र'} यार्ड परिसर - गेहूं उपार्जन सत्र 2025-26`,
      yardDirective:
        activeItem?.stage ||
        'कृपया अपना वाहन वे-ब्रिज लेन #02 की ओर ले जाएं। आपका टोकन #' + tokenNumber + ' गेट पर सफलतापूर्वक सत्यापित हो चुका है एवं नमी परीक्षण दल आपके वाहन की प्रतीक्षा कर रहा है।',
      queueOrder,
      totalVehicles,
      totalVehiclesInYard: totalVehicles,
      waitMinutes: estimatedWaitMinutes,
      estimatedWaitMinutes,
      rateMin: avgProcessingRateMin,
      avgProcessingRateMin,
      yardLoadPercent,
      yardLoadLevelHi,
      yardLoadLevelEn,
      activeScales: ACTIVE_SCALES_COUNT,
      activeScalesCount: ACTIVE_SCALES_COUNT,
      scalesStatusNote: `सभी ${ACTIVE_SCALES_COUNT} इलेक्ट्रॉनिक वे-स्केल सुचारू कार्यरत`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 7-Stage Procurement Lifecycle stages
export const getStages = async (req: Request, res: Response) => {
  try {
    const stages = await db.stages.find();
    stages.sort((a, b) => a.step - b.step);
    res.json(stages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update specific stage status (for operator terminal or admin control)
export const updateStage = async (req: Request, res: Response) => {
  try {
    const { stepNumber, stageId, status, subHi, subEn, details } = req.body;
    const targetStep = Number(stepNumber ?? stageId);
    const stages = await updateStageStatus(targetStep, status, { subHi, subEn, details });
    stages.sort((a, b) => a.step - b.step);
    res.json({ success: true, stages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Advance lifecycle stage (for operator terminal or simulation)
export const advanceStage = async (req: Request, res: Response) => {
  try {
    const { stepNumber, moistureVal, grossWeight } = req.body;
    const stages = await db.stages.find();
    for (const stage of stages) {
      if (stage.step < stepNumber) {
        stage.status = 'completed';
      } else if (stage.step === stepNumber) {
        stage.status = 'in_progress';
        if (moistureVal && stage.step === 4) {
          stage.subHi = `नमी: ${moistureVal}% (मानक योग्य पास)`;
          stage.subEn = `Moisture: ${moistureVal}% (Standard Pass)`;
        }
        if (grossWeight && stage.step === 5) {
          stage.subHi = `सकल तौल: ${grossWeight} क्विंटल (कांटा #02)`;
        }
      } else {
        stage.status = 'upcoming';
      }
      await db.stages.updateOne(stage.id, stage);
    }
    const updatedStages = await db.stages.find();
    updatedStages.sort((a, b) => a.step - b.step);
    res.json(updatedStages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get dynamically registered farmers for Mandi Operator terminal (NO dummy names)
export const getOperatorQueue = async (req: Request, res: Response) => {
  try {
    const list = getQueueList();
    res.json({ success: true, count: list.length, farmers: list });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get latest yard directive for Farmer Portal (Orange alert box)
export const getLatestDirective = async (req: Request, res: Response) => {
  try {
    const directive = getDirective();
    res.json({ success: true, directive });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get WhatsApp & SMS notification logs for Farmer
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { farmerId, phone } = req.query;
    let list = getNotificationsList();
    if (farmerId) {
      list = list.filter(n => n.farmerId === farmerId);
    } else if (phone) {
      list = list.filter(n => n.phone === phone);
    }
    res.json({ success: true, count: list.length, notifications: list });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Process Mandi Operator action on a farmer (Call to scale, Gate arrival, etc.)
export const postOperatorAction = async (req: Request, res: Response) => {
  try {
    const { token, actionType, scale } = req.body;
    const queue = getQueueList();
    if (!token && queue.length === 0) {
      return res.status(400).json({ error: 'No active farmers in queue' });
    }
    const targetToken = token || queue[0]?.token;
    const result = await updateOperatorAction(targetToken, actionType, scale);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
