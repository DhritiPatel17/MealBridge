export type TabType =
  | 'donate'
  | 'my-donations'
  | 'new-requests'
  | 'my-pickups'
  | 'profile'
  | 'home'
  | 'claim'
  | 'tracking'
  | 'impact'
  | 'admin';

export type FoodCategory = 'pure-veg' | 'non-veg' | 'mixed';

export type PerishabilityState = 'cooked' | 'dairy' | 'bakery' | 'packaged' | 'raw';

export type PackagingFormat = 'containers' | 'loose';

export interface DonationOrder {
  id: string;
  title: string;
  category: FoodCategory;
  perishability: PerishabilityState;
  servings: number;
  netMassKg: number;
  safeUntil: string;
  packingTypes?: string[];
  safeUntilTimestamp?: number;
  expiryDateOnPack?: string;
  cookedDay?: 'Today' | 'Yesterday';
  ambientTemp: string;
  packaging: PackagingFormat;
  cookedAt: string;
  donorName: string;
  donorAddress: string;
  donorDistance: string;
  donorRating: number;
  donorRescues: number;
  donorPhone: string;
  specialInstructions: string;
  photoUrl: string;
  photoFilename: string;
  pickupTime: string;
  status: 'reported' | 'matched' | 'accepted' | 'in_transit' | 'delivered';
  currentStep: number;
  totalSteps: number;
  stepPercentage: number;
  ngoName: string;
  ngoChapter: string;
  ngoCapacityRemaining: number;
  ngoMaxCapacity: number;
  riderName: string;
  riderVehicle: string;
  riderRating: number;
  riderRuns: number;
  riderPhone: string;
  latitude?: number;
  longitude?: number;
  eta: string;
  etaRemainingMinutes: number;
  distanceKm: number;
  handoverChecklist: {
    temperatureChecked: boolean;
    tempValue: string;
    photoUploaded: boolean;
    portionsConfirmed: boolean;
    portionsRatio: string;
  };
  rating?: {
    stars: number;
    feedback: string;
    submitted: boolean;
  };
}

export interface ImpactStats {
  mealsSaved: number;
  activeNgos: number;
  avgMatchMinutes: number;
  safeDeliveryPercent: number;
  co2SavedKg: number;
  waterSavedLiters: number;
}
