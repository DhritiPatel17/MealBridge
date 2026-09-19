import { FoodCategory, PerishabilityState } from '../types';
import { supabase } from '../lib/supabase';

export type DonationStatus =
  | 'waiting'
  | 'accepted'
  | 'picked_up'
  | 'delivered'
  | 'cancelled'
  | 'not_accepted'
  | 'expired';

export interface DonationRating {
  stars: number; // 1 to 5
  comment?: string;
  ratedAt: string;
}

export interface DonationRecord {
  id: string;
  donorId: string;
  donorBusinessName?: string;
  donorName: string;
  donorPhone: string;
  donorAddress: string;
  donorArea?: string;
  distanceKm?: number;
  landmark?: string;
  donorNote?: string;
  latitude?: number;
  longitude?: number;
  category: FoodCategory;
  perishability: PerishabilityState;
  servings: number;
  netMassKg: number;
  packaging: string;
  packingTypes?: string[];
  cookedAt: string;
  safeUntil: string;
  safeUntilTimestamp?: number;
  pickupTime?: string;
  specialInstructions?: string;
  foodStorage?: string;
  status: DonationStatus;
  createdAt: string;
  expiresAt: number; // 10 minutes from creation (timestamp)

  // Filled when NGO accepts
  acceptedByNgoId?: string;
  ngoName?: string;
  ngoPhone?: string;
  ngoAddress?: string;
  ngoRegNumber?: string;
  isNgoVerified?: boolean;
  ngoLatitude?: number;
  ngoLongitude?: number;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  deliveryProofPhoto?: string;
  ngoDone?: boolean;

  // Donor rating
  rating?: DonationRating;
}

const STORAGE_KEY = 'mealbridge_shared_donations';
const EVENT_NAME = 'mealbridge_donations_updated';

// Helper to notify listeners across tabs and local components
function emitChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }
}

export const donationStore = {
  getDonations(): DonationRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: DonationRecord[] = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      const now = Date.now();
      let changed = false;

      // Auto-expire requests if 10-min countdown reached or food safe window passed
      const updated = parsed.map((item) => {
        if (item.status === 'waiting') {
          // Check 10-minute accept countdown
          if (item.expiresAt && now >= item.expiresAt) {
            changed = true;
            return { ...item, status: 'not_accepted' as DonationStatus };
          }
          // Check food safe expiry
          if (item.safeUntilTimestamp && now >= item.safeUntilTimestamp) {
            changed = true;
            return { ...item, status: 'expired' as DonationStatus };
          }
        }
        return item;
      });

      if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }

      return updated;
    } catch {
      return [];
    }
  },

  saveDonations(donations: DonationRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(donations));
      emitChange();
    } catch (e) {
      console.error('Failed to save donations to localStorage:', e);
    }
  },

  async syncDonationToSupabase(record: DonationRecord) {
    try {
      await supabase.from('mealbridge_donations').upsert([
        {
          id: record.id,
          donor_id: record.donorId,
          donor_name: record.donorName,
          donor_phone: record.donorPhone,
          donor_address: record.donorAddress,
          latitude: record.latitude,
          longitude: record.longitude,
          servings: record.servings,
          status: record.status,
          category: record.category,
          perishability: record.perishability,
          created_at: record.createdAt,
          record_data: record,
        },
      ]);
    } catch (err) {
      console.warn('Supabase donation sync skipped/failed:', err);
    }
  },

  addDonation(
    payload: Omit<DonationRecord, 'id' | 'createdAt' | 'status' | 'expiresAt'> & {
      expiresAt?: number;
    }
  ): DonationRecord {
    const donations = this.getDonations();
    const now = Date.now();
    const createdIso = new Date(now).toISOString();
    const tenMinutesLater = now + 10 * 60 * 1000;

    const newRecord: DonationRecord = {
      ...payload,
      id: `MB-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'waiting',
      createdAt: createdIso,
      expiresAt: payload.expiresAt || tenMinutesLater,
      distanceKm: payload.distanceKm || 1.4,
    };

    donations.unshift(newRecord);
    this.saveDonations(donations);
    this.syncDonationToSupabase(newRecord);
    return newRecord;
  },

  cancelDonation(id: string): boolean {
    const donations = this.getDonations();
    const index = donations.findIndex((d) => d.id === id);
    if (index === -1) return false;

    // Donor can only cancel before it is accepted
    if (donations[index].status === 'waiting') {
      donations[index].status = 'cancelled';
      this.saveDonations(donations);
      return true;
    }
    return false;
  },

  acceptDonation(
    id: string,
    ngo: { id: string; name: string; phone: string; address?: string; regNumber?: string; isVerified?: boolean; latitude?: number; longitude?: number }
  ): { success: boolean; reason?: 'already_taken' | 'expired' | 'not_found' } {
    const donations = this.getDonations();
    const index = donations.findIndex((d) => d.id === id);
    if (index === -1) {
      return { success: false, reason: 'not_found' };
    }

    const record = donations[index];
    const now = Date.now();

    // Check if timed out
    if (record.expiresAt && now >= record.expiresAt) {
      record.status = 'not_accepted';
      this.saveDonations(donations);
      this.syncDonationToSupabase(record);
      return { success: false, reason: 'expired' };
    }

    // Check if food expired
    if (record.safeUntilTimestamp && now >= record.safeUntilTimestamp) {
      record.status = 'expired';
      this.saveDonations(donations);
      this.syncDonationToSupabase(record);
      return { success: false, reason: 'expired' };
    }

    // Check if another NGO already accepted
    if (record.status !== 'waiting') {
      return { success: false, reason: 'already_taken' };
    }

    record.status = 'accepted';
    record.acceptedByNgoId = ngo.id;
    record.ngoName = ngo.name;
    record.ngoPhone = ngo.phone;
    record.ngoAddress = ngo.address;
    record.ngoRegNumber = ngo.regNumber;
    record.isNgoVerified = Boolean(ngo.isVerified);
    record.ngoLatitude = ngo.latitude;
    record.ngoLongitude = ngo.longitude;
    record.acceptedAt = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    this.saveDonations(donations);
    this.syncDonationToSupabase(record);
    return { success: true };
  },

  markPickedUp(id: string): boolean {
    const donations = this.getDonations();
    const index = donations.findIndex((d) => d.id === id);
    if (index === -1) return false;

    if (donations[index].status === 'accepted') {
      donations[index].status = 'picked_up';
      donations[index].pickedUpAt = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      this.saveDonations(donations);
      this.syncDonationToSupabase(donations[index]);
      return true;
    }
    return false;
  },

  markDelivered(id: string): boolean {
    const donations = this.getDonations();
    const index = donations.findIndex((d) => d.id === id);
    if (index === -1) return false;

    if (donations[index].status === 'picked_up' || donations[index].status === 'accepted') {
      donations[index].status = 'delivered';
      donations[index].deliveredAt = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      this.saveDonations(donations);
      this.syncDonationToSupabase(donations[index]);
      return true;
    }
    return false;
  },

  updateProofPhoto(id: string, photoUrl: string): boolean {
    const donations = this.getDonations();
    const index = donations.findIndex((d) => d.id === id);
    if (index === -1) return false;

    donations[index].deliveryProofPhoto = photoUrl;
    this.saveDonations(donations);
    return true;
  },

  markNgoDone(id: string): boolean {
    const donations = this.getDonations();
    const index = donations.findIndex((d) => d.id === id);
    if (index === -1) return false;

    donations[index].ngoDone = true;
    this.saveDonations(donations);
    return true;
  },

  rateDonation(id: string, stars: number, comment?: string): boolean {
    const donations = this.getDonations();
    const index = donations.findIndex((d) => d.id === id);
    if (index === -1) return false;

    // Only allow rating once per donation
    if (donations[index].rating) return false;

    donations[index].rating = {
      stars,
      comment: comment?.trim() || undefined,
      ratedAt: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
    };
    this.saveDonations(donations);
    return true;
  },

  getNgoRatingStats(ngoId?: string, ngoName?: string): { count: number; average: number | null } {
    const donations = this.getDonations();
    const rated = donations.filter((d) => {
      if (!d.rating) return false;
      if (ngoId && d.acceptedByNgoId === ngoId) return true;
      if (ngoName && d.ngoName === ngoName) return true;
      return false;
    });

    const count = rated.length;
    if (count < 3) {
      return { count, average: null }; // Show average only after 3 or more ratings
    }

    const sum = rated.reduce((acc, curr) => acc + (curr.rating?.stars || 0), 0);
    const average = Number((sum / count).toFixed(1));
    return { count, average };
  },

  getDismissedForNgo(ngoId: string): string[] {
    try {
      const raw = localStorage.getItem(`mealbridge_dismissed_${ngoId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  dismissForNgo(ngoId: string, donationId: string) {
    try {
      const list = this.getDismissedForNgo(ngoId);
      if (!list.includes(donationId)) {
        list.push(donationId);
        localStorage.setItem(`mealbridge_dismissed_${ngoId}`, JSON.stringify(list));
        emitChange();
      }
    } catch (e) {
      console.error('Failed to dismiss for NGO:', e);
    }
  },

  subscribe(callback: () => void): () => void {
    const handler = () => callback();
    if (typeof window !== 'undefined') {
      window.addEventListener(EVENT_NAME, handler);
      window.addEventListener('storage', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(EVENT_NAME, handler);
        window.removeEventListener('storage', handler);
      }
    };
  },
};
