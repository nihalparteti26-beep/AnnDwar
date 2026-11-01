import { Request, Response } from 'express';
import { db, getActiveFarmer, getActiveSlot as getActiveSlotFromDb, syncQueueWithFarmer } from '../db.js';
import { sendNotification } from '../services/notificationService.js';

// AI Auto-Reschedule Predictions Engine
export const getAiRecommendations = async (req: Request, res: Response) => {
  try {
    const activeSlot = await getActiveSlotFromDb();
    
    // AI Congestion & Weather model predictions
    const predictions = {
      optimalSlot: {
        date: '27 अक्टूबर 2025',
        dateEn: '27 October 2025',
        timeSlot: '09:00 AM - 10:30 AM',
        mandiCenterName: 'सांवेर उपार्जन केंद्र',
        gateNumber: 'गेट क्र. 02',
        laneNumber: 'लेन #01 (त्वरित AI लेन)',
        predictedWaitMinutes: 12,
        currentWaitMinutes: 55,
        timeSavedMinutes: 43,
        congestionIndex: 18, // 18% congestion (Very Low)
        currentCongestionIndex: 74, // 74% congestion (High)
        weatherForecast: {
          condition: 'खिली धूप (Clear Sunny)',
          rainProbability: 0,
          humidity: 42,
          grainSafetyIndex: 'उत्कृष्ट (Safe dry storage)',
        },
        confidenceScore: 98,
        aiReasoning: 'प्रातः काल में यार्ड खाली रहता है और नमी का स्तर मानक 12% पर रहता है। कतार में 43 मिनट की बचत होगी।',
        aiReasoningEn: 'Early morning session experiences lowest yard congestion and optimal grain moisture. Saves 43 minutes wait time.',
      },
      alternativeSlots: [
        {
          id: 'alt_1',
          date: '28 अक्टूबर 2025',
          timeSlot: '11:00 AM - 12:30 PM',
          mandiCenterName: 'सांवेर उपार्जन केंद्र',
          predictedWaitMinutes: 20,
          congestionIndex: 28,
          weatherForecast: { condition: 'साफ मौसम', rainProbability: 5 },
          vacantSpots: 85,
        },
        {
          id: 'alt_2',
          date: '27 अक्टूबर 2025',
          timeSlot: '02:00 PM - 03:30 PM',
          mandiCenterName: 'धार नाका उपार्जन केंद्र',
          predictedWaitMinutes: 15,
          congestionIndex: 22,
          weatherForecast: { condition: 'धूप खिली रहेगी', rainProbability: 0 },
          vacantSpots: 19,
        }
      ],
      yardLiveStatus: {
        trucksInQueue: 7,
        avgWeighmentTimeMin: 4.2,
        throughputRate: '3.4x faster'
      }
    };

    res.json({ success: true, activeSlot, predictions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get active confirmed slot
export const getActiveSlot = async (req: Request, res: Response) => {
  try {
    const slot = await getActiveSlotFromDb();
    res.json(slot);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Book a new slot
export const bookSlot = async (req: Request, res: Response) => {
  try {
    const { date, timeSlot, mandiCenterName, cropName, quantityQuintal, vehicleNumber } = req.body;
    const tokenNumber = 'MP-' + Math.floor(1000 + Math.random() * 9000);
    const newSlot = {
      id: 'slot_' + Date.now(),
      tokenNumber,
      farmerId: 'farmer_001',
      farmerName: 'राम सिंह',
      date: date || '27 अक्टूबर 2025',
      timeSlot: timeSlot || '11:00 AM - 12:30 PM',
      gateArrivalExpected: '10:45 AM',
      mandiCenterName: mandiCenterName || 'सांवेर उपार्जन केंद्र',
      gateNumber: 'गेट क्र. 02',
      laneNumber: 'लेन #02 (ट्रॉली लेन)',
      cropName: cropName || 'शरबती गेहूँ (ग्रेड-A)',
      cropGrade: 'ग्रेड-A',
      quantityQuintal: Number(quantityQuintal) || 45,
      mspRatePerQuintal: 2400,
      totalEstimatedValue: (Number(quantityQuintal) || 45) * 2400,
      vehicleNumber: vehicleNumber || 'MP-09-EA-3142',
      vehicleType: 'ट्रैक्टर ट्रॉली',
      status: 'confirmed' as const,
      bookingTimestamp: new Date().toISOString(),
      qrCodeData: `ANNDWAR|${tokenNumber}|RAM_SINGH|${quantityQuintal || 45}Q|${mandiCenterName || 'SANWER'}`,
    };

    await db.slots.create(newSlot);

    // Notify registered farmer on their registered mobile number
    const farmer = await db.farmers.findOne();
    const farmerPhone = farmer?.phone;
    if (farmerPhone) {
      await sendNotification(
        farmerPhone,
        `प्रिय किसान भाई, आपका अन्नद्वार मंडी उपार्जन स्लॉट सफलतापूर्वक बुक हो गया है। ई-टोकन: ${tokenNumber}, दिनांक: ${newSlot.date}, समय: ${newSlot.timeSlot}, केंद्र: ${newSlot.mandiCenterName}। कृपया समय पर पहुंचें। - AnnDwar`,
        { title: 'स्लॉट बुकिंग टोकन', type: 'both' }
      );
    }

    // Real-time synchronization with Mandi Operator Yard Queue
    try {
      const currentFarmer = (await db.farmers.findById(newSlot.farmerId)) || (await getActiveFarmer());
      if (currentFarmer) {
        syncQueueWithFarmer(currentFarmer, newSlot, {
          stage: 'गेट आगमन प्रतीक्षारत',
          stageType: 'gate_wait',
          currentScale: 'तौल कांटा क्र. 02',
          actionType: 'gate_call',
          actionLabel: 'गेट बुलावा भेजें'
        });
      }
    } catch (e) {
      console.error('Queue sync on bookSlot error:', e);
    }

    res.json({ success: true, slot: newSlot });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Reschedule slot (with AI suggestion support & Registered Farmer Notification)
export const rescheduleSlot = async (req: Request, res: Response) => {
  try {
    const { newDate, newTimeSlot, newMandi, isAiSuggested } = req.body;
    const active = await db.slots.findOne();
    if (active) {
      const updated = await db.slots.updateOne(active.id, {
        date: newDate || '27 अक्टूबर 2025',
        timeSlot: newTimeSlot || '09:00 AM - 10:30 AM',
        mandiCenterName: newMandi || active.mandiCenterName,
        status: 'confirmed',
      });

      // Dispatch alert to the registered farmer's mobile number
      const farmer = await db.farmers.findOne();
      const farmerPhone = farmer?.phone;
      if (farmerPhone) {
        const notifMsg = isAiSuggested
          ? `प्रिय किसान भाई, AnnDwar AI स्मार्ट सुझाव के अनुसार आपका मंडी स्लॉट सफलतापूर्वक री-शेड्यूल किया गया है। नई दिनांक: ${updated.date}, समय: ${updated.timeSlot}, केंद्र: ${updated.mandiCenterName}। अनुमानित प्रतीक्षा समय में 43 मिनट की बचत होगी। ई-टोकन: ${updated.tokenNumber}। - AnnDwar`
          : `प्रिय किसान भाई, आपका अन्नद्वार मंडी स्लॉट री-शेड्यूल कर दिया गया है। नई दिनांक: ${updated.date}, समय: ${updated.timeSlot}, केंद्र: ${updated.mandiCenterName}। ई-टोकन: ${updated.tokenNumber}। - AnnDwar`;

        await sendNotification(farmerPhone, notifMsg, {
          title: 'स्लॉट री-शेड्यूल पुष्टि',
          type: 'both'
        });
      }

      // Real-time synchronization with Mandi Operator Yard Queue
      try {
        const currentFarmer = (await db.farmers.findById(updated.farmerId)) || (await getActiveFarmer());
        if (currentFarmer) {
          syncQueueWithFarmer(currentFarmer, updated, {
            arrivalTime: updated.timeSlot,
            mandiName: updated.mandiCenterName,
            stage: isAiSuggested ? 'स्मार्ट री-शेड्यूल (गेट प्रतीक्षारत)' : 'री-शेड्यूल स्लॉट (गेट प्रतीक्षारत)'
          });
        }
      } catch (e) {
        console.error('Queue sync on rescheduleSlot error:', e);
      }

      return res.json({ success: true, slot: updated, isAiSuggested });
    }
    res.status(404).json({ error: 'No active slot found to reschedule' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
