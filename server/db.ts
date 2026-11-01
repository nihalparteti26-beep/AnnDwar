import { 
  FarmerProfile, 
  DocumentItem, 
  PaymentRecord, 
  MandiSlot, 
  ProcurementStage, 
  MandiCenter, 
  LogisticsConsolidation, 
  GodownStock,
  CropPreCheckResult 
} from '../src/types.js';
import { dispatchRealNotification } from './services/notificationService.js';

// In-Memory & Persistent MongoDB-compatible collection store
class MongoCollection<T extends { id: string }> {
  name: string;
  documents: Map<string, T> = new Map();

  constructor(name: string, initialData: T[] = []) {
    this.name = name;
    initialData.forEach(item => this.documents.set(item.id, { ...item }));
  }

  async find(filter: Partial<T> = {}): Promise<T[]> {
    const list = Array.from(this.documents.values());
    if (Object.keys(filter).length === 0) return list;
    return list.filter(item => {
      for (const [key, val] of Object.entries(filter)) {
        if ((item as any)[key] !== val) return false;
      }
      return true;
    });
  }

  async findById(id: string): Promise<T | null> {
    return this.documents.get(id) || null;
  }

  async findOne(filter: Partial<T> = {}): Promise<T | null> {
    const results = await this.find(filter);
    return results[0] || null;
  }

  async create(doc: T): Promise<T> {
    this.documents.set(doc.id, { ...doc });
    return doc;
  }

  async updateOne(id: string, updates: Partial<T>): Promise<T | null> {
    const existing = this.documents.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteOne(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  async count(): Promise<number> {
    return this.documents.size;
  }
}

// Initial Seed Data accurately aligned with user's screenshots
export const initialFarmer: FarmerProfile = {
  id: 'farmer_001',
  nameHi: 'राम सिंह',
  nameEn: 'Ram Singh',
  phone: '98260XXXXX',
  aadhaarMasked: 'XXXX-XXXX-4812',
  samagraId: '48921008',
  village: 'धर्मराजपुरा, सांवेर',
  district: 'इन्दौर (मध्य प्रदेश)',
  totalLandAcres: 8.5,
  registeredCrop: 'शरबती गेहूँ (ग्रेड-A)',
  registeredQuantityLimit: 120,
  isKycVerified: true,
  isBhulekhSynced: true,
  isNpciSeeded: true
};

export const initialDocuments: DocumentItem[] = [
  {
    id: 'doc_1',
    titleHi: 'आधार कार्ड (Aadhaar Card)',
    titleEn: 'Aadhaar Card',
    subtitleHi: 'UIDAI e-KYC ओटीपी मान्य',
    subtitleEn: 'UIDAI e-KYC OTP Validated',
    statusTextHi: 'सत्यापित',
    statusTextEn: 'Verified',
    isVerified: true,
    docNumber: 'XXXX-XXXX-4812',
    iconType: 'aadhaar'
  },
  {
    id: 'doc_2',
    titleHi: 'भू-अभिलेख खसरा / खतौनी',
    titleEn: 'Land Record Khasra / Khatauni',
    subtitleHi: 'MP Bhulekh डेटा सिंक OK',
    subtitleEn: 'MP Bhulekh Data Sync OK',
    statusTextHi: 'सिंक पूर्ण',
    statusTextEn: 'Sync Complete',
    isVerified: true,
    docNumber: 'खसरा क्र: 124/2, 125/1 (रकबा 3.4 हे.)',
    iconType: 'bhulekh'
  },
  {
    id: 'doc_3',
    titleHi: 'बैंक पासबुक / निरस्त चेक',
    titleEn: 'Bank Passbook / Cancelled Cheque',
    subtitleHi: 'NPCI Seeding OK',
    subtitleEn: 'NPCI Seeding OK',
    statusTextHi: 'आधार लिंक सक्रिय',
    statusTextEn: 'Aadhaar Linked Active',
    isVerified: true,
    docNumber: 'SBI A/c: *******4921 (IFSC: SBIN000124)',
    iconType: 'bank'
  },
  {
    id: 'doc_4',
    titleHi: 'समग्र परिवार आईडी (Samagra)',
    titleEn: 'Samagra Family ID',
    subtitleHi: 'सदस्य आईडी: 48921008',
    subtitleEn: 'Member ID: 48921008',
    statusTextHi: 'प्रमाणित',
    statusTextEn: 'Certified',
    isVerified: true,
    docNumber: '48921008',
    iconType: 'samagra'
  }
];

export const initialPayments: PaymentRecord[] = [
  {
    id: 'pay_01',
    cropNameHi: 'चना उपार्जन (30 क्विंटल)',
    cropNameEn: 'Gram / Chana Procurement (30 Quintal)',
    quantityQuintal: 30,
    totalAmount: 163200,
    date: '14 मार्च 2025',
    seasonHi: 'रबी विपणन',
    seasonEn: 'Rabi Marketing',
    status: 'credit_successful',
    utrNumber: 'SBIN004829104',
    mandiName: 'सांवेर उपार्जन केंद्र',
    receiptNumber: 'RCP-RABI-2025-0912'
  },
  {
    id: 'pay_02',
    cropNameHi: 'सोयाबीन उपार्जन (25 क्विंटल)',
    cropNameEn: 'Soybean Procurement (25 Quintal)',
    quantityQuintal: 25,
    totalAmount: 122250,
    date: '22 नवंबर 2024',
    seasonHi: 'खरीफ विपणन',
    seasonEn: 'Kharif Marketing',
    status: 'credit_successful',
    utrNumber: 'SBIN003910482',
    mandiName: 'इंदौर कृषि उपज मंडी',
    receiptNumber: 'RCP-KHARIF-2024-8841'
  }
];

export const initialActiveSlot: MandiSlot = {
  id: 'slot_active',
  tokenNumber: 'MP-2409',
  farmerId: 'farmer_001',
  farmerName: 'राम सिंह',
  date: '26 अक्टूबर 2025',
  timeSlot: '11:00 AM – 12:30 PM',
  gateArrivalExpected: '10:45 AM',
  mandiCenterName: 'सांवेर उपार्जन केंद्र',
  gateNumber: 'गेट क्र. 02',
  laneNumber: 'लेन #02 (ट्रॉली लेन)',
  cropName: 'शरबती गेहूँ',
  cropGrade: 'ग्रेड-A',
  quantityQuintal: 45,
  mspRatePerQuintal: 2400,
  totalEstimatedValue: 108000,
  vehicleNumber: 'MP-09-GE-4102',
  vehicleType: 'ट्रैक्टर ट्रॉली',
  status: 'arrived',
  bookingTimestamp: '2025-10-25T14:20:00Z',
  qrCodeData: 'ANNDWAR|MP-2409|FARMER_001|WHEAT|45Q|SANWER_GATE02'
};

export const initialStages: ProcurementStage[] = [
  {
    id: 'stage_1',
    step: 1,
    titleHi: 'किसान सत्यापन',
    titleEn: 'Farmer Verification',
    subHi: 'पूर्ण • 08:30 AM (सत्यापित)',
    subEn: 'Completed • 08:30 AM (Approved)',
    status: 'completed',
    time: '08:30 AM',
    details: 'पोर्टल द्वारा स्वीकृत एवं भू-अभिलेख सत्यापित',
    iconType: 'farmer'
  },
  {
    id: 'stage_2',
    step: 2,
    titleHi: 'स्लॉट बुकिंग',
    titleEn: 'Slot Booking',
    subHi: 'सत्यापित (#SLOT-8)',
    subEn: 'Verified (#SLOT-8)',
    status: 'completed',
    time: 'स्लॉट: 11:00 AM',
    details: 'सांवेर उपार्जन केंद्र - गेट 02',
    iconType: 'slot'
  },
  {
    id: 'stage_3',
    step: 3,
    titleHi: 'मंडी गेट प्रवेश',
    titleEn: 'Mandi Gate Entry',
    subHi: 'सम्पन्न • 10:45 AM',
    subEn: 'Pass • 10:45 AM',
    // status: 'completed',
    status: 'in_progress',
    time: '10:45 AM',
    details: 'RFID गेट #01 स्कैन व यार्ड मार्शल सत्यापन',
    iconType: 'gate'
  },
  {
    id: 'stage_4',
    step: 4,
    titleHi: 'गुणवत्ता व नमी जांच',
    titleEn: 'Quality & Moisture Test',
    subHi: 'नमी: 11.4% (मानक योग्य पास)',
    subEn: 'Moisture: 11.4% (Pass Standard)',
    // status: 'in_progress',
      status: 'upcoming',
    time: 'प्रगति पर (11:12 AM)',
    details: 'डिजिटल नमी मापक #03 द्वारा परीक्षण जारी',
    iconType: 'quality'
  },
  {
    id: 'stage_5',
    step: 5,
    titleHi: 'इलेक्ट्रॉनिक तौल',
    titleEn: 'Electronic Weighment',
    subHi: 'कांटा #02 पर कतार में',
    subEn: 'Gross/Tare at Scale #02',
    status: 'upcoming',
    time: 'प्रतीक्षारत',
    details: 'सकल एवं शुद्ध तौल (Gross & Tare)',
    iconType: 'weigh'
  },
  {
    id: 'stage_6',
    step: 6,
    titleHi: 'ई-उपार्जन पावती',
    titleEn: 'Digital MSP Slip',
    subHi: 'तौल उपरांत तुरंत तैयार',
    subEn: 'Ready Post Weighment',
    status: 'upcoming',
    time: 'प्रतीक्षारत',
    details: 'डिजिटल रसीद व SMS प्रेषण',
    iconType: 'receipt'
  },
  {
    id: 'stage_7',
    step: 7,
    titleHi: 'DBT बैंक भुगतान',
    titleEn: 'Direct Benefit Transfer',
    subHi: 'आधार लिंक्ड बैंक खाता',
    subEn: 'Direct to Bank Account',
    status: 'upcoming',
    time: '24-48 कार्य घंटे',
    details: 'PFMS/NPCI गेटवे द्वारा प्रत्यक्ष अंतरण',
    iconType: 'dbt'
  }
];

export const initialMandis: MandiCenter[] = [
  {
    id: 'mandi_sanwer',
    name: 'सांवेर उपार्जन केंद्र',
    district: 'इन्दौर',
    activeScales: 4,
    avgWaitMinutes: 25,
    loadPercent: 48,
    congestionLevel: 'low',
    distanceKm: 4.2,
    dailyCapacityQuintal: 4500,
    procuredTodayQuintal: 2150
  },
  {
    id: 'mandi_indore_main',
    name: 'इंदौर कृषि उपज मंडी (चोइथराम)',
    district: 'इन्दौर',
    activeScales: 6,
    avgWaitMinutes: 65,
    loadPercent: 88,
    congestionLevel: 'high',
    distanceKm: 18.5,
    dailyCapacityQuintal: 9000,
    procuredTodayQuintal: 7900
  },
  {
    id: 'mandi_depalpur',
    name: 'देपालपुर उपार्जन केंद्र',
    district: 'इन्दौर',
    activeScales: 3,
    avgWaitMinutes: 30,
    loadPercent: 52,
    congestionLevel: 'medium',
    distanceKm: 14.0,
    dailyCapacityQuintal: 3500,
    procuredTodayQuintal: 1820
  },
  {
    id: 'mandi_mhow',
    name: 'महू उपार्जन केंद्र',
    district: 'इन्दौर',
    activeScales: 3,
    avgWaitMinutes: 20,
    loadPercent: 38,
    congestionLevel: 'low',
    distanceKm: 22.0,
    dailyCapacityQuintal: 3000,
    procuredTodayQuintal: 1140
  }
];

export const initialLogistics: LogisticsConsolidation[] = [
  {
    id: 'log_01',
    vehicleNumber: 'MP-09-LA-5582',
    driverName: 'विक्रम सिंह',
    driverPhone: '9893112233',
    capacityQuintal: 120,
    loadedQuintal: 110,
    farmerStops: [
      { farmerName: 'राम सिंह', village: 'धर्मराजपुरा', quintal: 45, pickupTime: '09:00 AM', status: 'picked' },
      { farmerName: 'गोपाल पटेल', village: 'अजरोदा', quintal: 35, pickupTime: '09:45 AM', status: 'picked' },
      { farmerName: 'कैलाश वर्मा', village: 'लसूडिया', quintal: 30, pickupTime: '10:30 AM', status: 'en_route' }
    ],
    destinationMandi: 'सांवेर उपार्जन केंद्र',
    fuelSavedPercent: 34,
    emptyTripsEliminated: 2,
    liveStatus: 'in_transit'
  }
];

export const initialGodownStocks: GodownStock[] = [
  {
    id: 'stock_01',
    godownName: 'MPWLC केंद्रीय गोदाम परिसर #03',
    siloNumber: 'साइलो ब्लॉक B-14',
    cropType: 'शरबती गेहूँ (ग्रेड-A)',
    storedQuintals: 14200,
    maxCapacityQuintals: 20000,
    lastStockEntry: 'आज 10:15 AM',
    bagCount: 28400,
    qualityGrade: 'A+'
  },
  {
    id: 'stock_02',
    godownName: 'MPWLC केंद्रीय गोदाम परिसर #03',
    siloNumber: 'साइलो ब्लॉक B-15',
    cropType: 'सोयाबीन (पीला सोना)',
    storedQuintals: 8500,
    maxCapacityQuintals: 15000,
    lastStockEntry: 'कल 05:40 PM',
    bagCount: 17000,
    qualityGrade: 'A'
  }
];

// Initialize Collections
export const db = {
  farmers: new MongoCollection<FarmerProfile>('farmers', [initialFarmer]),
  documents: new MongoCollection<DocumentItem>('documents', initialDocuments),
  payments: new MongoCollection<PaymentRecord>('payments', initialPayments),
  slots: new MongoCollection<MandiSlot>('slots', [initialActiveSlot]),
  stages: new MongoCollection<ProcurementStage>('stages', initialStages),
  mandis: new MongoCollection<MandiCenter>('mandis', initialMandis),
  logistics: new MongoCollection<LogisticsConsolidation>('logistics', initialLogistics),
  godownStocks: new MongoCollection<GodownStock>('godown_stocks', initialGodownStocks),
  cropChecks: new MongoCollection<CropPreCheckResult>('crop_prechecks', [])
};

export interface RegisterFarmerInput {
  nameHi: string;
  nameEn?: string;
  phone: string;
  pin?: string;
  aadhaar: string;
  samagraId: string;
  village: string;
  district: string;
  totalLandAcres: number;
  registeredCrop: string;
  registeredQuantityLimit: number;
  mandiCenterName: string;
  slotDate: string;
  slotTime: string;
  vehicleNumber: string;
  vehicleType: string;
  khasraNumber?: string;
  bankName?: string;
  bankAccount?: string;
  ifscCode?: string;
}

export function getCropMsp(cropName?: string): number {
  if (!cropName) return 2400;
  if (cropName.includes('चना')) return 5440;
  if (cropName.includes('सरसों') || cropName.includes('राई')) return 5650;
  if (cropName.includes('सोयाबीन')) return 4892;
  if (cropName.includes('धान')) return 2300;
  return 2400; // Wheat default
}

export let activeFarmerId = 'farmer_001';
export let activeSlotId = 'slot_active';
export let dbtPaymentStatus: 'pending' | 'in_progress' | 'credit_successful' = 'in_progress';
export let dbtUtrNumber: string = '';

export interface FarmerQueueItem {
  id: string;
  farmerId: string;
  token: string;
  farmerName: string;
  phone: string;
  vehicleNo: string;
  crop: string;
  quantity: number;
  mandiName: string;
  arrivalTime: string;
  stage: string;
  stageType: 'gate_wait' | 'quality' | 'weighment' | 'unloading' | 'ready';
  currentScale?: string;
  actionType: 'gate_call' | 'call_scale' | 'record_weight' | 'slip_recommend' | 'completed';
  actionLabel: string;
}

export interface YardDirective {
  id: string;
  farmerId: string;
  farmerName: string;
  token: string;
  textHi: string;
  textEn: string;
  scaleNumber?: string;
  time: string;
  action: string;
}

export interface AppNotification {
  id: string;
  farmerId: string;
  farmerName: string;
  phone: string;
  type: 'whatsapp' | 'sms';
  sender: string;
  title: string;
  message: string;
  timestamp: string;
}

export const initialQueueItems: FarmerQueueItem[] = [
  {
    id: 'q_farmer_001',
    farmerId: 'farmer_001',
    token: '#MP-2409',
    farmerName: 'राम सिंह (Ram Singh)',
    phone: '9826100001',
    vehicleNo: 'MP-09-GE-4102',
    crop: 'गेहूँ शरबती (45 Qt)',
    quantity: 45,
    mandiName: 'सांवेर उपार्जन केंद्र (गेट #02)',
    arrivalTime: '10:45 AM',
    stage: 'गेट प्रवेश स्वीकृत (लैब प्रतीक्षारत)',
    stageType: 'quality',
    currentScale: 'तौल कांटा क्र. 02',
    actionType: 'call_scale',
    actionLabel: 'कांटा #02 बुलावा भेजें',
  },
  {
    id: 'q_mp_88210',
    farmerId: 'MP-88210',
    token: '#MP-88210',
    farmerName: 'रमेश पटेल (Ramesh Patel)',
    phone: '9826199999',
    vehicleNo: 'MP-09-EA-5542',
    crop: 'सोयाबीन (55 Qt)',
    quantity: 55,
    mandiName: 'सांवेर उपार्जन केंद्र',
    arrivalTime: '11:00 AM',
    stage: 'गेट आगमन प्रतीक्षारत',
    stageType: 'gate_wait',
    currentScale: 'तौल कांटा क्र. 01',
    actionType: 'gate_call',
    actionLabel: 'गेट बुलावा भेजें',
  },
  {
    id: 'q_mp_5120',
    farmerId: 'MP-5120',
    token: '#MP-5120',
    farmerName: 'मुकेश शर्मा (Mukesh Sharma)',
    phone: '9893112233',
    vehicleNo: 'MP-09-LA-5582',
    crop: 'चना (30 Qt)',
    quantity: 30,
    mandiName: 'सांवेर उपार्जन केंद्र',
    arrivalTime: '09:30 AM',
    stage: 'इलेक्ट्रॉनिक तौल प्रगति पर',
    stageType: 'weighment',
    currentScale: 'तौल कांटा क्र. 03',
    actionType: 'record_weight',
    actionLabel: 'वजन दर्ज करें',
  },
  {
    id: 'q_mp_4402',
    farmerId: 'MP-4402',
    token: '#MP-4402',
    farmerName: 'सुरेश पटेल (Suresh Patel)',
    phone: '9425012345',
    vehicleNo: 'MP-11-AB-9088',
    crop: 'गेहूँ (60 Qt)',
    quantity: 60,
    mandiName: 'हातोद उपार्जन केंद्र',
    arrivalTime: '09:00 AM',
    stage: 'MSP ई-उपार्जन पर्ची तैयार',
    stageType: 'ready',
    currentScale: 'तौल कांटा क्र. 02',
    actionType: 'slip_recommend',
    actionLabel: 'MSP रसीद जारी करें',
  }
];

export let operatorQueueList: FarmerQueueItem[] = [...initialQueueItems];

export function syncQueueWithFarmer(farmer: any, slot?: any, extra?: Partial<FarmerQueueItem>) {
  if (!farmer) return;
  const rawToken = slot?.tokenNumber || farmer.id;
  const token = String(rawToken).startsWith('#') ? String(rawToken) : `#${rawToken}`;

  const existingIdx = operatorQueueList.findIndex(
    it => it.farmerId === farmer.id || it.token === token || (farmer.phone && it.phone === farmer.phone)
  );
  const timeStr = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

  const updatedItem: FarmerQueueItem = {
    id: existingIdx >= 0 ? operatorQueueList[existingIdx].id : 'q_' + farmer.id,
    farmerId: farmer.id,
    token,
    farmerName: farmer.nameHi || farmer.nameEn || 'किसान भाई',
    phone: farmer.phone || '9826199999',
    vehicleNo: slot?.vehicleNumber || (existingIdx >= 0 ? operatorQueueList[existingIdx].vehicleNo : 'MP-09-EA-5542'),
    crop: slot ? `${slot.cropName} (${slot.quantityQuintal} Qt)` : (farmer.registeredCrop || 'गेहूँ (45 Qt)'),
    quantity: slot?.quantityQuintal || farmer.registeredQuantityLimit || 45,
    mandiName: slot?.mandiCenterName || (existingIdx >= 0 ? operatorQueueList[existingIdx].mandiName : 'सांवेर उपार्जन केंद्र'),
    arrivalTime: slot?.timeSlot || (existingIdx >= 0 ? operatorQueueList[existingIdx].arrivalTime : timeStr),
    stage: existingIdx >= 0 ? operatorQueueList[existingIdx].stage : 'गेट आगमन प्रतीक्षारत',
    stageType: existingIdx >= 0 ? operatorQueueList[existingIdx].stageType : 'gate_wait',
    currentScale: existingIdx >= 0 ? operatorQueueList[existingIdx].currentScale : 'तौल कांटा क्र. 02',
    actionType: existingIdx >= 0 ? operatorQueueList[existingIdx].actionType : 'gate_call',
    actionLabel: existingIdx >= 0 ? operatorQueueList[existingIdx].actionLabel : 'गेट बुलावा भेजें',
    ...extra
  };

  if (existingIdx >= 0) {
    operatorQueueList[existingIdx] = updatedItem;
  } else {
    operatorQueueList.unshift(updatedItem);
  }
  return updatedItem;
}

export function syncQueueStageUpdate(stepNumber: number, status: 'completed' | 'in_progress' | 'upcoming', extra?: { subHi?: string; subEn?: string; details?: string }) {
  const activeItem = operatorQueueList.find(it => it.farmerId === activeFarmerId) || operatorQueueList[0];
  if (!activeItem) return;

  if (stepNumber === 3) {
    if (status === 'completed') {
      activeItem.stage = 'गेट प्रवेश स्वीकृत (लैब प्रतीक्षारत)';
      activeItem.stageType = 'quality';
      activeItem.actionType = 'call_scale';
      activeItem.actionLabel = 'कांटा #02 बुलावा भेजें';
    } else if (status === 'in_progress') {
      activeItem.stage = 'गेट पर आगमन (सत्यापन जारी)';
      activeItem.stageType = 'gate_wait';
      activeItem.actionType = 'gate_call';
      activeItem.actionLabel = 'गेट बुलावा भेजें';
    }
  } else if (stepNumber === 4) {
    if (status === 'completed') {
      activeItem.stage = 'गुणवत्ता पास (तौल हेतु तैयार)';
      activeItem.stageType = 'weighment';
      activeItem.actionType = 'record_weight';
      activeItem.actionLabel = 'वजन दर्ज करें';
    } else if (status === 'in_progress') {
      activeItem.stage = 'गुणवत्ता व नमी परीक्षण प्रगति पर';
      activeItem.stageType = 'quality';
      activeItem.actionType = 'call_scale';
      activeItem.actionLabel = 'कांटा बुलावा भेजें';
    }
  } else if (stepNumber === 5) {
    if (status === 'completed') {
      activeItem.stage = 'तौल पूर्ण (ई-पर्ची जनरेटेड)';
      activeItem.stageType = 'ready';
      activeItem.actionType = 'slip_recommend';
      activeItem.actionLabel = 'MSP पर्ची जारी करें';
    } else if (status === 'in_progress') {
      activeItem.stage = 'कांटा #02 पर वजन माप जारी';
      activeItem.stageType = 'weighment';
      activeItem.actionType = 'record_weight';
      activeItem.actionLabel = 'वजन दर्ज करें';
    }
  } else if (stepNumber === 6) {
    if (status === 'completed') {
      activeItem.stage = 'MSP ई-उपार्जन पर्ची तैयार';
      activeItem.stageType = 'ready';
      activeItem.actionType = 'slip_recommend';
      activeItem.actionLabel = 'DBT भुगतान जारी करें';
    }
  } else if (stepNumber === 7) {
    if (status === 'completed') {
      activeItem.stage = 'DBT भुगतान सफल (क्रेडिट सम्पन्न)';
      activeItem.stageType = 'ready';
      activeItem.actionType = 'completed';
      activeItem.actionLabel = '✓ प्रक्रिया पूर्ण';
    } else if (status === 'in_progress') {
      activeItem.stage = 'DBT भुगतान प्रक्रियाधीन';
      activeItem.stageType = 'ready';
      activeItem.actionType = 'completed';
      activeItem.actionLabel = 'ट्रेजरी क्लियरेंस...';
    }
  }
}
export let latestDirective: YardDirective | null = null;
export let notificationsLog: AppNotification[] = [];

export function getQueueList(): FarmerQueueItem[] {
  return operatorQueueList;
}

export function getDirective(): YardDirective | null {
  return latestDirective;
}

export function getNotificationsList(): AppNotification[] {
  return notificationsLog;
}

export async function getActiveFarmer(): Promise<FarmerProfile | null> {
  return (await db.farmers.findById(activeFarmerId)) || (await db.farmers.findById('farmer_001'));
}

export async function getActiveSlot(): Promise<MandiSlot | null> {
  return (await db.slots.findById(activeSlotId)) || (await db.slots.findById('slot_active')) || (await db.slots.findOne());
}

export async function registerFarmerData(input: any) {
  const farmerId = 'MP-' + Math.floor(10000 + Math.random() * 90000);
  const tokenNumber = 'MP-' + Math.floor(1000 + Math.random() * 9000);
  const cropStr = String(input.registeredCrop || input.crop || 'गेहूँ (Wheat MP-Sharbati)');
  const mspRate = getCropMsp(cropStr);
  const qty = Number(input.registeredQuantityLimit || input.quantity) || 45;
  const bonus = cropStr.includes('गेहूँ') ? 125 : 0;
  const totalVal = qty * (mspRate + bonus);

  const nameHi = input.nameHi || input.name || 'किसान भाई';
  const nameEn = input.nameEn || (input.name && !input.nameHi ? input.name : nameHi);
  const phone = String(input.phone || input.mobile || '9876543210');
  const aadhaarRaw = String(input.aadhaar || '123456789012');
  const aadhaarMasked = aadhaarRaw.length >= 4 ? `XXXX-XXXX-${aadhaarRaw.slice(-4)}` : aadhaarRaw;

  const farmer: FarmerProfile = {
    id: farmerId,
    nameHi,
    nameEn,
    phone,
    aadhaarMasked,
    samagraId: input.samagraId || '48921008',
    village: input.village || 'धर्मराजपुरा, सांवेर',
    district: input.district || 'इन्दौर (मध्य प्रदेश)',
    totalLandAcres: Number(input.totalLandAcres || input.landArea) || 5,
    registeredCrop: cropStr,
    registeredQuantityLimit: qty,
    isKycVerified: true,
    isBhulekhSynced: true,
    isNpciSeeded: true
  };

  const slot: MandiSlot = {
    id: 'slot_' + farmerId,
    tokenNumber,
    farmerId: farmer.id,
    farmerName: farmer.nameHi,
    date: input.slotDate || input.date || '26 अक्टूबर 2025',
    timeSlot: input.slotTime || input.timeSlot || '11:00 AM – 12:30 PM',
    gateArrivalExpected: (input.slotTime || input.timeSlot) ? (input.slotTime || input.timeSlot).split('–')[0]?.trim() : '10:45 AM',
    mandiCenterName: input.mandiCenterName || input.mandi || 'सांवेर उपार्जन केंद्र',
    gateNumber: 'गेट क्र. 02',
    laneNumber: 'लेन #02 (ट्रॉली लेन)',
    cropName: cropStr,
    cropGrade: 'ग्रेड-A',
    quantityQuintal: qty,
    mspRatePerQuintal: mspRate,
    totalEstimatedValue: totalVal,
    vehicleNumber: input.vehicleNumber || input.vehicleNo || 'MP-09-GE-4102',
    vehicleType: input.vehicleType || 'ट्रैक्टर ट्रॉली',
    status: 'confirmed',
    bookingTimestamp: new Date().toISOString(),
    qrCodeData: `ANNDWAR|${tokenNumber}|${farmer.id}|${cropStr}|${qty}Q|${input.mandiCenterName || input.mandi || 'सांवेर उपार्जन केंद्र'}`
  };

  const docs: DocumentItem[] = [
    {
      id: 'doc_1',
      titleHi: 'आधार कार्ड (Aadhaar Card)',
      titleEn: 'Aadhaar Card',
      subtitleHi: input.aadhaarDocName ? `अपलोड: ${input.aadhaarDocName}` : 'UIDAI e-KYC ओटीपी मान्य',
      subtitleEn: input.aadhaarDocName ? `Uploaded: ${input.aadhaarDocName}` : 'UIDAI e-KYC OTP Validated',
      statusTextHi: 'सत्यापित',
      statusTextEn: 'Verified',
      isVerified: true,
      docNumber: farmer.aadhaarMasked,
      iconType: 'aadhaar'
    },
    {
      id: 'doc_2',
      titleHi: 'भू-अभिलेख खसरा / खतौनी',
      titleEn: 'Land Record Khasra / Khatauni',
      subtitleHi: input.khasraDocName ? `अपलोड: ${input.khasraDocName}` : 'MP Bhulekh डेटा सिंक OK',
      subtitleEn: input.khasraDocName ? `Uploaded: ${input.khasraDocName}` : 'MP Bhulekh Data Sync OK',
      statusTextHi: 'सिंक पूर्ण',
      statusTextEn: 'Sync Complete',
      isVerified: true,
      docNumber: input.khasraNumber ? `खसरा क्र: ${input.khasraNumber} (रकबा ${input.totalLandAcres || 5} एकड़)` : `खसरा क्र: 124/2, 125/1 (रकबा ${input.totalLandAcres || 5} एकड़)`,
      iconType: 'bhulekh'
    },
    {
      id: 'doc_3',
      titleHi: 'बैंक पासबुक / निरस्त चेक',
      titleEn: 'Bank Passbook / Cancelled Cheque',
      subtitleHi: input.bankDocName ? `अपलोड: ${input.bankDocName}` : 'NPCI Seeding OK',
      subtitleEn: input.bankDocName ? `Uploaded: ${input.bankDocName}` : 'NPCI Seeding OK',
      statusTextHi: 'आधार लिंक सक्रिय',
      statusTextEn: 'Aadhaar Linked Active',
      isVerified: true,
      docNumber: `${input.bankName || 'SBI'} A/c: *******${input.bankAccount ? String(input.bankAccount).slice(-4) : '4921'} (IFSC: ${input.ifscCode || 'SBIN000124'})`,
      iconType: 'bank'
    },
    {
      id: 'doc_4',
      titleHi: 'समग्र परिवार आईडी (Samagra)',
      titleEn: 'Samagra Family ID',
      subtitleHi: input.samagraDocName ? `अपलोड: ${input.samagraDocName}` : `सदस्य आईडी: ${input.samagraId || '48921008'}`,
      subtitleEn: input.samagraDocName ? `Uploaded: ${input.samagraDocName}` : `Member ID: ${input.samagraId || '48921008'}`,
      statusTextHi: 'प्रमाणित',
      statusTextEn: 'Certified',
      isVerified: true,
      docNumber: input.samagraId || '48921008',
      iconType: 'samagra'
    }
  ];

  const stages: ProcurementStage[] = [
    {
      id: 'stage_1',
      step: 1,
      titleHi: 'किसान सत्यापन',
      titleEn: 'Farmer Verification',
      subHi: 'पूर्ण (सत्यापित)',
      subEn: 'Completed (Approved)',
      status: 'completed',
      time: '08:30 AM',
      details: 'पोर्टल द्वारा स्वीकृत एवं भू-अभिलेख सत्यापित',
      iconType: 'farmer'
    },
    {
      id: 'stage_2',
      step: 2,
      titleHi: 'स्लॉट बुकिंग',
      titleEn: 'Slot Booking',
      subHi: `सत्यापित (#${tokenNumber})`,
      subEn: `Verified (#${tokenNumber})`,
      status: 'completed',
      time: slot.timeSlot,
      details: `${slot.mandiCenterName} - ${slot.gateNumber}`,
      iconType: 'slot'
    },
    {
      id: 'stage_3',
      step: 3,
      titleHi: 'मंडी गेट प्रवेश',
      titleEn: 'Mandi Gate Entry',
      subHi: 'प्रवेश प्रतीक्षारत',
      subEn: 'Awaiting Gate Arrival',
      status: 'in_progress',
      time: slot.gateArrivalExpected,
      details: `RFID गेट स्कैन व यार्ड आगमन - वाहन: ${slot.vehicleNumber}`,
      iconType: 'gate'
    },
    {
      id: 'stage_4',
      step: 4,
      titleHi: 'गुणवत्ता व नमी जांच',
      titleEn: 'Quality & Moisture Test',
      subHi: 'प्रतीक्षारत',
      subEn: 'Pending Inspection',
      status: 'upcoming',
      time: 'गेट पश्चात',
      details: `${slot.cropName} नमी मापक व गुणवत्ता ग्रेडिंग`,
      iconType: 'quality'
    },
    {
      id: 'stage_5',
      step: 5,
      titleHi: 'इलेक्ट्रॉनिक तौल',
      titleEn: 'Electronic Weighment',
      subHi: 'प्रतीक्षारत',
      subEn: 'Pending Weighment',
      status: 'upcoming',
      time: 'प्रतीक्षारत',
      details: `सकल एवं शुद्ध तौल (अनुमानित ${qty} क्विंटल)`,
      iconType: 'weigh'
    },
    {
      id: 'stage_6',
      step: 6,
      titleHi: 'ई-उपार्जन पावती',
      titleEn: 'Digital MSP Slip',
      subHi: 'तौल उपरांत तैयार',
      subEn: 'Ready Post Weighment',
      status: 'upcoming',
      time: 'प्रतीक्षारत',
      details: 'डिजिटल रसीद व SMS प्रेषण',
      iconType: 'receipt'
    },
    {
      id: 'stage_7',
      step: 7,
      titleHi: 'DBT बैंक भुगतान',
      titleEn: 'Direct Benefit Transfer',
      subHi: 'आधार लिंक्ड बैंक खाता',
      subEn: 'Direct to Bank Account',
      status: 'upcoming',
      time: '24-48 कार्य घंटे',
      details: 'ट्रेजरी व APB गेटवे द्वारा प्रत्यक्ष अंतरण',
      iconType: 'dbt'
    }
  ];

  const payment: PaymentRecord = {
    id: 'pay_' + farmerId,
    cropNameHi: `${cropStr} उपार्जन (${qty} क्विंटल)`,
    cropNameEn: `${cropStr} Procurement (${qty} Quintal)`,
    quantityQuintal: qty,
    totalAmount: totalVal,
    date: input.slotDate || input.date || '26 अक्टूबर 2025',
    seasonHi: 'रबी विपणन 2025-26',
    seasonEn: 'Rabi Marketing 2025-26',
    status: 'in_progress',
    utrNumber: '',
    mandiName: input.mandiCenterName || input.mandi || 'सांवेर उपार्जन केंद्र',
    receiptNumber: `RCP-2025-${tokenNumber}`
  };

  // Save to in-memory collections
  await db.farmers.create(farmer);
  await db.slots.create(slot);

  // Clear previous docs/stages and insert fresh ones
  const existingDocs = await db.documents.find();
  for (const ed of existingDocs) {
    await db.documents.deleteOne(ed.id);
  }
  for (const d of docs) {
    await db.documents.create(d);
  }

  const existingStages = await db.stages.find();
  for (const es of existingStages) {
    await db.stages.deleteOne(es.id);
  }
  for (const s of stages) {
    await db.stages.create(s);
  }

  await db.payments.create(payment);

  activeFarmerId = farmer.id;
  activeSlotId = slot.id;
  dbtPaymentStatus = 'in_progress';
  dbtUtrNumber = '';

  const timeStr = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

  // Record newly registered farmer in Mandi Operator's live queue (NO DUMMY NAMES)
  const queueItem: FarmerQueueItem = {
    id: 'q_' + farmer.id,
    farmerId: farmer.id,
    token: `#${tokenNumber}`,
    farmerName: farmer.nameHi,
    phone: farmer.phone,
    vehicleNo: slot.vehicleNumber,
    crop: `${slot.cropName} (${slot.quantityQuintal} Qt)`,
    quantity: slot.quantityQuintal,
    mandiName: slot.mandiCenterName,
    arrivalTime: timeStr,
    stage: 'गेट प्रतीक्षारत',
    stageType: 'gate_wait',
    currentScale: 'कांटा क्र. 02',
    actionType: 'gate_call',
    actionLabel: '🚪 गेट आगमन दर्ज',
  };
  syncQueueWithFarmer(farmer, slot, {
    stage: 'गेट आगमन प्रतीक्षारत',
    stageType: 'gate_wait',
    currentScale: 'तौल कांटा क्र. 02',
    actionType: 'gate_call',
    actionLabel: 'गेट बुलावा भेजें'
  });

  // Set initial Live Directive for the farmer dashboard
  latestDirective = {
    id: 'dir_' + Date.now(),
    farmerId: farmer.id,
    farmerName: farmer.nameHi,
    token: `#${tokenNumber}`,
    textHi: `टोकन #${tokenNumber}: स्लॉट पुष्ट हुआ! कृपया निर्धारित समय (${slot.timeSlot}) पर ${slot.mandiCenterName} के गेट क्र. 02 पर पहुंचें।`,
    textEn: `Token #${tokenNumber}: Slot confirmed! Please reach Gate #02 of ${slot.mandiCenterName} at ${slot.timeSlot}.`,
    scaleNumber: 'गेट क्र. 02',
    time: timeStr,
    action: 'slot_confirmed'
  };

  // Dispatch Registration WhatsApp & SMS Messages to registered mobile
  const waReg: AppNotification = {
    id: 'notif_wa_' + Date.now(),
    farmerId: farmer.id,
    farmerName: farmer.nameHi,
    phone: farmer.phone,
    type: 'whatsapp',
    sender: 'AnnDwar - Kisan se Desh Tak',
    title: '🌾 AnnDwar स्लॉट पंजीकरण पुष्टि',
    message: `🌾 AnnDwar - किसान से देश तक: नमस्ते ${farmer.nameHi}, आपका उपार्जन स्लॉट सफलतापूर्वक बुक हो गया है! टोकन #${tokenNumber}, मंडी केंद्र: ${slot.mandiCenterName}, समय: ${slot.timeSlot}, वाहन: ${slot.vehicleNumber}।`,
    timestamp: timeStr
  };

  const smsReg: AppNotification = {
    id: 'notif_sms_' + (Date.now() + 1),
    farmerId: farmer.id,
    farmerName: farmer.nameHi,
    phone: farmer.phone,
    type: 'sms',
    sender: 'VM-ANNDWR',
    title: 'SMS: AnnDwar टोकन पुष्टि',
    message: `VM-ANNDWR: AnnDwar - किसान ${farmer.nameHi}, आपका टोकन #${tokenNumber} जारी हुआ। केंद्र: ${slot.mandiCenterName}, समय: ${slot.timeSlot}। - AnnDwar`,
    timestamp: timeStr
  };

  notificationsLog = [waReg, smsReg, ...notificationsLog];
  dispatchRealNotification(farmer.phone, waReg.message, waReg.title).catch(err => console.error('Dispatch error:', err));

  return {
    farmer,
    slot,
    documents: docs,
    stages,
    payment
  };
}

export async function updateOperatorAction(token: string, actionType: string, customScale?: string) {
  let targetToken = (token || '').trim();
  if (targetToken.startsWith('#')) targetToken = targetToken.slice(1);
  const item = operatorQueueList.find(it => it.token === `#${targetToken}` || it.token === targetToken || (targetToken && it.token.includes(targetToken))) || operatorQueueList[0];
  const cleanToken = item?.token || (targetToken && targetToken !== 'undefined' ? `#${targetToken}` : '#MP-88210');
  const farmerName = item?.farmerName || 'किसान भाई';
  const phone = item?.phone || '9826199999';
  const timeStr = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
  const scale = customScale || 'कांटा क्र. 02';

  if (actionType === 'gate_call' || actionType === 'gate_entry') {
    if (item) {
      item.stage = '✓ गेट आगमन दर्ज';
      item.stageType = 'quality';
      item.actionType = 'call_scale';
      item.actionLabel = 'कांटा पर बुलाएं';
    }
    await updateStageStatus(3, 'completed', { subHi: `प्रवेश सम्पन्न • ${timeStr}` });
    await updateStageStatus(4, 'in_progress', { subHi: 'नमी परीक्षण चालू' });

    latestDirective = {
      id: 'dir_' + Date.now(),
      farmerId: item?.farmerId || activeFarmerId,
      farmerName,
      token: cleanToken,
      textHi: `🔔 गेट आगमन स्वीकृत! टोकन ${cleanToken} (${farmerName}) - वाहन यार्ड परिसर में प्रविष्ट हुआ। कृपया नमूना जांच हेतु नमी लैब पर उपस्थित रहें।`,
      textEn: `Gate arrival approved! Token ${cleanToken} (${farmerName}) - Vehicle entered yard. Please report to Moisture Lab.`,
      scaleNumber: 'गेट क्र. 02',
      time: timeStr,
      action: 'gate_entry'
    };

    notificationsLog.unshift(
      {
        id: 'wa_' + Date.now(),
        farmerId: item?.farmerId || activeFarmerId,
        farmerName,
        phone,
        type: 'whatsapp',
        sender: 'AnnDwar - Kisan se Desh Tak',
        title: '🌾 गेट प्रवेश पुष्टि',
        message: `🌾 AnnDwar - Kisan se Desh Tak: नमस्ते ${farmerName}, आपका टोकन ${cleanToken} गेट क्र. 02 पर प्रविष्ट हो चुका है। कृपया वाहन को नमी परीक्षण काउंटर / लैब की ओर ले जाएं।`,
        timestamp: timeStr
      },
      {
        id: 'sms_' + (Date.now() + 1),
        farmerId: item?.farmerId || activeFarmerId,
        farmerName,
        phone,
        type: 'sms',
        sender: 'VM-ANNDWR',
        title: 'SMS: गेट प्रवेश सम्पन्न',
        message: `VM-ANNDWR: AnnDwar - टोकन ${cleanToken} गेट प्रवेश सम्पन्न। नमूना जांच हेतु वाहन लैब पर लाएं। - AnnDwar (किसान से देश तक)`,
        timestamp: timeStr
      }
    );
    dispatchRealNotification(phone, `🌾 AnnDwar - Kisan se Desh Tak: नमस्ते ${farmerName}, आपका टोकन ${cleanToken} गेट क्र. 02 पर प्रविष्ट हो चुका है। कृपया वाहन को नमी परीक्षण काउंटर / लैब की ओर ले जाएं।`, '🌾 गेट प्रवेश पुष्टि').catch(console.error);
  } else if (actionType === 'call_scale') {
    if (item) {
      item.stage = `✓ ${scale} पर बुलाया गया`;
      item.stageType = 'weighment';
      item.currentScale = scale;
      item.actionType = 'record_weight';
      item.actionLabel = 'तौल दर्ज करें';
    }
    await updateStageStatus(4, 'completed', { subHi: 'नमी 11.2% (मानक पास ✓)' });
    await updateStageStatus(5, 'in_progress', { subHi: `${scale} पर तौल जारी` });

    latestDirective = {
      id: 'dir_' + Date.now(),
      farmerId: item?.farmerId || activeFarmerId,
      farmerName,
      token: cleanToken,
      textHi: `तत्काल निर्देश: टोकन ${cleanToken} (${farmerName}) - कृपया अपना वाहन तुरंत ${scale} पर ले जाएं। तौल की बारी आ गई है!`,
      textEn: `Urgent Directive: Token ${cleanToken} (${farmerName}) - Please move your vehicle to ${scale} immediately. It is your turn for weighment!`,
      scaleNumber: scale,
      time: timeStr,
      action: 'call_scale'
    };

    notificationsLog.unshift(
      {
        id: 'wa_' + Date.now(),
        farmerId: item?.farmerId || activeFarmerId,
        farmerName,
        phone,
        type: 'whatsapp',
        sender: 'AnnDwar - Kisan se Desh Tak',
        title: '📢 तौलकांटा बुलावा अलर्ट',
        message: `📢 AnnDwar - किसान से देश तक: आवश्यक सूचना! ${farmerName}, आपका टोकन #${cleanToken} ${scale} पर बुलाया गया है। कृपया बिना विलंब वाहन ${scale} पर ले जाएं।`,
        timestamp: timeStr
      },
      {
        id: 'sms_' + (Date.now() + 1),
        farmerId: item?.farmerId || activeFarmerId,
        farmerName,
        phone,
        type: 'sms',
        sender: 'VM-ANNDWR',
        title: 'SMS: तौलकांटा बुलावा',
        message: `VM-ANNDWR: AnnDwar - टोकन #${cleanToken} को ${scale} पर तुरंत आमंत्रित किया गया है। वाहन तौलकांटे पर लाएं। - AnnDwar (किसान से देश तक)`,
        timestamp: timeStr
      }
    );
    dispatchRealNotification(phone, `📢 AnnDwar - किसान से देश तक: आवश्यक सूचना! ${farmerName}, आपका टोकन #${cleanToken} ${scale} पर बुलाया गया है। कृपया बिना विलंब वाहन ${scale} पर ले जाएं।`, '📢 तौलकांटा बुलावा अलर्ट').catch(console.error);
  } else if (actionType === 'record_weight') {
    if (item) {
      item.stage = 'अनलोडिंग व अंतिम सत्यापन';
      item.stageType = 'unloading';
      item.actionType = 'slip_recommend';
      item.actionLabel = 'पावती व DBT जारी करें';
    }
    await updateStageStatus(5, 'completed', { subHi: 'सकल तौल दर्ज ✓' });
    await updateStageStatus(6, 'in_progress', { subHi: 'ई-उपार्जन पावती तैयार' });

    latestDirective = {
      id: 'dir_' + Date.now(),
      farmerId: item?.farmerId || activeFarmerId,
      farmerName,
      token: cleanToken,
      textHi: `तौल पूर्ण: टोकन ${cleanToken} (${farmerName}) - सकल भार 58.4 क्विंटल सत्यापित हुआ। अनलोडिंग के बाद पावती प्राप्त करें।`,
      textEn: `Weighment recorded for Token ${cleanToken} (${farmerName})! Gross and net weight verified.`,
      scaleNumber: scale,
      time: timeStr,
      action: 'record_weight'
    };

    notificationsLog.unshift(
      {
        id: 'wa_' + Date.now(),
        farmerId: item?.farmerId || activeFarmerId,
        farmerName,
        phone,
        type: 'whatsapp',
        sender: 'AnnDwar - Kisan se Desh Tak',
        title: '⚖️ तौल सत्यापन रिपोर्ट',
        message: `⚖️ AnnDwar - किसान से देश तक: ${farmerName}, टोकन #${cleanToken} का तौल कार्य पूर्ण हो गया है। ई-उपार्जन पावती तैयार की जा रही है।`,
        timestamp: timeStr
      },
      {
        id: 'sms_' + (Date.now() + 1),
        farmerId: item?.farmerId || activeFarmerId,
        farmerName,
        phone,
        type: 'sms',
        sender: 'VM-ANNDWR',
        title: 'SMS: तौल सत्यापन',
        message: `VM-ANNDWR: AnnDwar - टोकन #${cleanToken} का तौल माप 58.4 क्विंटल दर्ज हुआ। - AnnDwar`,
        timestamp: timeStr
      }
    );
    dispatchRealNotification(phone, `⚖️ AnnDwar - किसान से देश तक: ${farmerName}, टोकन #${cleanToken} का तौल कार्य पूर्ण हो गया है।`, '⚖️ तौल सत्यापन रिपोर्ट').catch(console.error);
  } else if (actionType === 'slip_recommend') {
    if (item) {
      item.stage = 'उपार्जन पूर्ण (Ready for DBT)';
      item.stageType = 'ready';
      item.actionType = 'completed';
      item.actionLabel = '✓ पूर्ण';
    }
    await updateStageStatus(6, 'completed', { subHi: 'पावती जारी ✓' });
    await updateStageStatus(7, 'completed', { subHi: 'DBT भुगतान प्रेषित ₹1,09,125' });

    latestDirective = {
      id: 'dir_' + Date.now(),
      farmerId: item?.farmerId || activeFarmerId,
      farmerName,
      token: cleanToken,
      textHi: `उपार्जन पूर्ण: टोकन ${cleanToken} (${farmerName}) - अनाज स्वीकृति व ई-पावती पूर्ण हो चुकी है। DBT द्वारा भुगतान बैंक में भेजा जा रहा है।`,
      textEn: `Procurement Complete: Token ${cleanToken} (${farmerName}) - Grain accepted. DBT payout initiated.`,
      scaleNumber: 'मुख्यालय',
      time: timeStr,
      action: 'slip_recommend'
    };

    notificationsLog.unshift(
      {
        id: 'wa_' + Date.now(),
        farmerId: item?.farmerId || activeFarmerId,
        farmerName,
        phone,
        type: 'whatsapp',
        sender: 'AnnDwar - Kisan se Desh Tak',
        title: '💰 उपार्जन स्वीकृति व DBT प्रेषण',
        message: `🎉 AnnDwar - किसान से देश तक: बधाई ${farmerName}! आपका खाद्यान्न उपार्जन स्वीकार कर लिया गया है। उपार्जन राशि ₹1,09,125 DBT द्वारा सीधे आपके बैंक खाते में भेजी जा रही है।`,
        timestamp: timeStr
      },
      {
        id: 'sms_' + (Date.now() + 1),
        farmerId: item?.farmerId || activeFarmerId,
        farmerName,
        phone,
        type: 'sms',
        sender: 'VM-ANNDWR',
        title: 'SMS: DBT भुगतान',
        message: `VM-ANNDWR: AnnDwar - टोकन #${cleanToken} उपार्जन स्वीकृत। राशि ₹1,09,125 DBT द्वारा बैंक खाता में प्रेषित। UTR: RBI2025091104821. - AnnDwar`,
        timestamp: timeStr
      }
    );
    dispatchRealNotification(phone, `🎉 AnnDwar - किसान से देश तक: बधाई ${farmerName}! आपका खाद्यान्न उपार्जन स्वीकार कर लिया गया है। उपार्जन राशि ₹1,09,125 DBT द्वारा आपके बैंक खाते में भेजी जा रही है।`, '💰 DBT भुगतान प्रेषण').catch(console.error);
  }

  return {
    queueItem: item,
    directive: latestDirective,
    queue: operatorQueueList
  };
}

export async function updateStageStatus(stepNumber: number, status: 'completed' | 'in_progress' | 'upcoming', extra?: { subHi?: string; subEn?: string; details?: string }) {
  const stages = await db.stages.find();
  stages.sort((a, b) => a.step - b.step);

  for (const st of stages) {
    if (st.step === stepNumber) {
      st.status = status;
      if (extra?.subHi) st.subHi = extra.subHi;
      if (extra?.subEn) st.subEn = extra.subEn;
      if (extra?.details) st.details = extra.details;
      if (status === 'completed' && !extra?.subHi) {
        st.subHi = 'सम्पन्न ✓';
      }
    } else if (st.step < stepNumber && status === 'completed') {
      st.status = 'completed';
    }
    await db.stages.updateOne(st.id, st);
  }

  // If step 7 is marked completed, update DBT payment status
  if (stepNumber === 7 && status === 'completed') {
    dbtPaymentStatus = 'credit_successful';
    dbtUtrNumber = 'SBIN' + Math.floor(100000000 + Math.random() * 900000000);
    const activePayment = await db.payments.findById('pay_' + activeFarmerId) || await db.payments.findOne();
    if (activePayment) {
      activePayment.status = 'credit_successful';
      activePayment.utrNumber = dbtUtrNumber;
      await db.payments.updateOne(activePayment.id, activePayment);
    }
  }

  syncQueueStageUpdate(stepNumber, status, extra);
  return await db.stages.find();
}

export async function updateDbtPaymentStatus(status: 'pending' | 'in_progress' | 'credit_successful', utr?: string) {
  dbtPaymentStatus = status;
  const timeStr = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

  const activeQueueItem = operatorQueueList.find(it => it.farmerId === activeFarmerId) || operatorQueueList[0];
  if (activeQueueItem) {
    if (status === 'credit_successful') {
      activeQueueItem.stage = 'DBT भुगतान सफल (क्रेडिट सम्पन्न)';
      activeQueueItem.stageType = 'ready';
      activeQueueItem.actionType = 'completed';
      activeQueueItem.actionLabel = '✓ भुगतान सफल';
    } else if (status === 'in_progress') {
      activeQueueItem.stage = 'DBT भुगतान प्रक्रियाधीन';
      activeQueueItem.stageType = 'ready';
    }
  }

  if (status === 'credit_successful') {
    dbtUtrNumber = utr || 'SBIN' + Math.floor(100000000 + Math.random() * 900000000);
    await updateStageStatus(7, 'completed', { subHi: 'भुगतान सफल ✓', details: `UTR: ${dbtUtrNumber}` });

    const activeFarmer = await getActiveFarmer();
    const farmerName = activeFarmer?.nameHi || 'किसान भाई';
    const phone = activeFarmer?.phone || '9826199999';

    latestDirective = {
      id: 'dir_' + Date.now(),
      farmerId: activeFarmerId,
      farmerName,
      token: dbtUtrNumber ? `#${dbtUtrNumber.slice(-4)}` : '#MP-88210',
      textHi: `💰 DBT भुगतान सफल! PFMS/APB द्वारा राशि किसान के आधार लिंक बैंक खाते में अंतरित कर दी गई है (UTR: ${dbtUtrNumber})।`,
      textEn: `DBT Payment Successful! Funds credited via PFMS/APB (UTR: ${dbtUtrNumber}).`,
      time: timeStr,
      action: 'dbt_credited'
    };

    notificationsLog.unshift(
      {
        id: 'wa_' + Date.now(),
        farmerId: activeFarmerId,
        farmerName,
        phone,
        type: 'whatsapp',
        sender: 'AnnDwar - Kisan se Desh Tak',
        title: '💰 DBT बैंक भुगतान सफल',
        message: `💰 AnnDwar - Kisan se Desh Tak: शुभ समाचार! ${farmerName}, आपके आधार लिंक्ड बैंक खाते में MSP उपार्जन राशि DBT द्वारा अंतरित कर दी गई है (UTR: ${dbtUtrNumber})। - AnnDwar: किसान से देश तक`,
        timestamp: timeStr
      },
      {
        id: 'sms_' + (Date.now() + 1),
        farmerId: activeFarmerId,
        farmerName,
        phone,
        type: 'sms',
        sender: 'VM-ANNDWR',
        title: 'SMS: DBT भुगतान सफल',
        message: `VM-ANNDWR: AnnDwar - बैंक खाता क्रेडिट सफल! MSP उपार्जन राशि DBT द्वारा UTR ${dbtUtrNumber} से जमा हुई। - किसान से देश तक`,
        timestamp: timeStr
      }
    );
  } else if (status === 'in_progress') {
    await updateStageStatus(7, 'in_progress', { subHi: 'प्रक्रियाधीन (ट्रेजरी क्लियरेंस)', details: 'ट्रेजरी व APB गेटवे द्वारा प्रत्यक्ष अंतरण' });
  } else {
    await updateStageStatus(7, 'upcoming', { subHi: 'प्रतीक्षारत', details: 'तौल व बिल सत्यापन उपरांत' });
  }

  const activePayment = await db.payments.findById('pay_' + activeFarmerId) || await db.payments.findOne();
  if (activePayment) {
    activePayment.status = status;
    if (dbtUtrNumber) activePayment.utrNumber = dbtUtrNumber;
    await db.payments.updateOne(activePayment.id, activePayment);
  }

  return { dbtPaymentStatus, dbtUtrNumber };
}

