// Utility for GPS distance calculations, coordinate interpolation, and live movement simulation

export interface LatLng {
  lat: number;
  lng: number;
}

// Calculate distance between two coordinates in kilometers (Haversine formula)
export function calculateDistanceKm(point1: LatLng, point2: LatLng): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLon = ((point2.lng - point1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Number(d.toFixed(2));
}

// Calculate estimated travel time in minutes assuming average city vehicle speed of 22 km/h
export function calculateEtaMinutes(distanceKm: number): number {
  const avgSpeedKmh = 22; // City speed with traffic
  const hours = distanceKm / avgSpeedKmh;
  const minutes = Math.ceil(hours * 60);
  return Math.max(1, minutes);
}

// Default Vadodara points for fallback
export const VADODARA_CENTRAL: LatLng = { lat: 22.3072, lng: 73.1812 };
export const VADODARA_COMMUNITY_SHELTER: LatLng = { lat: 22.2985, lng: 73.205 };

// Generate realistic intermediate street waypoints between start and destination for smooth simulation
export function generateRoutePoints(start: LatLng, end: LatLng, stepsCount = 20): LatLng[] {
  const points: LatLng[] = [];

  // Intermediate dogleg points to simulate navigating city road turns instead of a raw straight flight line
  const midLat = (start.lat + end.lat) / 2 + (start.lng - end.lng) * 0.15;
  const midLng = (start.lng + end.lng) / 2 - (start.lat - end.lat) * 0.15;

  const waypoints = [
    start,
    { lat: start.lat * 0.7 + midLat * 0.3, lng: start.lng * 0.7 + midLng * 0.3 },
    { lat: midLat, lng: midLng },
    { lat: midLat * 0.4 + end.lat * 0.6, lng: midLng * 0.4 + end.lng * 0.6 },
    end,
  ];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const subSteps = Math.floor(stepsCount / (waypoints.length - 1));

    for (let s = 0; s < subSteps; s++) {
      const t = s / subSteps;
      points.push({
        lat: p1.lat + (p2.lat - p1.lat) * t,
        lng: p1.lng + (p2.lng - p1.lng) * t,
      });
    }
  }

  points.push(end);
  return points;
}
