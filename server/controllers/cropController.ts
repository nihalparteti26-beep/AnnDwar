import { Request, Response } from 'express';
import { db } from '../db.js';
import { analyzeCropQuality } from '../gemini.js';

// AI Crop Pre-Check endpoint (Gemini Powered + Calibrated CV)
export const cropCheck = async (req: Request, res: Response) => {
  try {
    const { cropType, imageBase64, additionalNotes } = req.body;
    
    // Log inspection request safely (without exposing large base64 or secrets)
    console.log(`[AI Crop Check] Request received for crop: "${cropType || 'Wheat'}", notes: "${additionalNotes || ''}", hasImage: ${Boolean(imageBase64)}`);

    const result = await analyzeCropQuality(
      cropType || 'गेहूँ (Wheat)',
      imageBase64,
      additionalNotes
    );

    console.log(`[AI Crop Check] Result for "${result.cropType}": isValid=${result.isValidCropImage}, score=${result.qualityScore}, grade=${result.grade}`);

    // Persist to local database
    await db.cropChecks.create(result);
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/ai/crop-check:', err);
    res.status(500).json({ error: 'Crop check analysis failed', details: err.message });
  }
};
