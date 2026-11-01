export type Language = 'hi' | 'en' | 'bn' | 'te' | 'mr' | 'ta' | 'gu' | 'kn' | 'ml' | 'pa' | 'or' | 'as';

export type UserRole = 'farmer' | 'mandi_operator' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  phoneOrEmail?: string;
  stationOrCenter?: string;
  token?: string;
}

export interface FarmerProfile {
  id: string;
  nameHi: string;
  nameEn: string;
  phone: string;
  aadhaarMasked: string;
  samagraId: string;
  village: string;
  district: string;
  totalLandAcres: number;
  registeredCrop: string;
  registeredQuantityLimit: number;
  isKycVerified: boolean;
  isBhulekhSynced: boolean;
  isNpciSeeded: boolean;
}

export interface DocumentItem {
  id: string;
  titleHi: string;
  titleEn: string;
  subtitleHi: string;
  subtitleEn: string;
  statusTextHi: string;
  statusTextEn: string;
  isVerified: boolean;
  docNumber?: string;
  iconType: 'aadhaar' | 'bhulekh' | 'bank' | 'samagra';
}
export type FarmerDocument = DocumentItem;

export interface PaymentRecord {
  id: string;
  cropNameHi: string;
  cropNameEn: string;
  quantityQuintal: number;
  totalAmount: number;
  date: string;
  seasonHi: string;
  seasonEn: string;
  status: 'credit_successful' | 'processing' | 'pending' | 'in_progress';
  utrNumber: string;
  mandiName: string;
  receiptNumber: string;
}

export interface MandiSlot {
  id: string;
  tokenNumber: string;
  farmerId: string;
  farmerName: string;
  date: string;
  timeSlot: string;
  gateArrivalExpected: string;
  mandiCenterName: string;
  gateNumber: string;
  laneNumber: string;
  cropName: string;
  cropGrade: string;
  quantityQuintal: number;
  mspRatePerQuintal: number;
  totalEstimatedValue: number;
  vehicleNumber: string;
  vehicleType: string;
  status: 'confirmed' | 'arrived' | 'in_progress' | 'completed' | 'rescheduled';
  bookingTimestamp: string;
  qrCodeData: string;
}

export interface ProcurementStage {
  id: string;
  step: number;
  titleHi: string;
  titleEn: string;
  subHi: string;
  subEn: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  time?: string;
  details?: string;
  iconType: 'farmer' | 'slot' | 'gate' | 'quality' | 'weigh' | 'receipt' | 'dbt';
}

export interface MandiCenter {
  id: string;
  name: string;
  district: string;
  activeScales: number;
  avgWaitMinutes: number;
  loadPercent: number;
  congestionLevel: 'low' | 'medium' | 'high';
  distanceKm: number;
  dailyCapacityQuintal: number;
  procuredTodayQuintal: number;
}

export interface CropPreCheckResult {
  id: string;
  cropType: string;
  qualityScore: number; // 0-100
  moisturePercent: number;
  foreignMatterPercent: number;
  brokenGrainsPercent: number;
  grade: 'Grade-A' | 'Grade-B' | 'Rejection Risk';
  isMspEligible: boolean;
  rejectionRiskLevel: 'Low' | 'Moderate' | 'High';
  estimatedRatePerQuintal: number;
  recommendationsHi: string[];
  recommendationsEn: string[];
  weatherAlertHi: string;
  weatherAlertEn: string;
  imageUrl?: string;
  isValidCropImage?: boolean;
  errorMessage?: string;
  detectedCrop?: string;
}

export interface LogisticsConsolidation {
  id: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  capacityQuintal: number;
  loadedQuintal: number;
  farmerStops: Array<{
    farmerName: string;
    village: string;
    quintal: number;
    pickupTime: string;
    status: 'picked' | 'en_route' | 'pending';
  }>;
  destinationMandi: string;
  fuelSavedPercent: number;
  emptyTripsEliminated: number;
  liveStatus: 'loading' | 'in_transit' | 'reached_mandi';
}
export type LogisticsLoad = LogisticsConsolidation;


export interface GodownStock {
  id: string;
  godownName: string;
  siloNumber: string;
  cropType: string;
  storedQuintals: number;
  maxCapacityQuintals: number;
  lastStockEntry: string;
  bagCount: number;
  qualityGrade: string;
}
