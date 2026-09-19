export interface VadodaraNgo {
  id: string;
  name: string;
  area: string;
  focus: string;
  address: string;
  latitude?: number;
  longitude?: number;
  isRegisteredOnMealBridge?: boolean;
}

export const vadodaraNgos: VadodaraNgo[] = [
  {
    id: 'ngo-1',
    name: 'United Way of Baroda',
    area: 'Gorwa',
    focus: 'Community health, education, women empowerment and rural development.',
    address: 'Ground Floor 1965, Alembic City, Building 1965, Alembic Road, Gorwa, Vadodara, Gujarat - 390003',
    latitude: 22.3341,
    longitude: 73.1585,
    isRegisteredOnMealBridge: false,
  },
  {
    id: 'ngo-2',
    name: 'Happy Faces Vadodara',
    area: 'Manjalpur',
    focus: 'Relief kits and support for underprivileged people, the elderly and people with disabilities.',
    address: 'Vinayak Commercial Complex, Next to Saraswati Complex, Manjalpur, Vadodara, Gujarat - 390011',
    latitude: 22.2709,
    longitude: 73.1970,
    isRegisteredOnMealBridge: false,
  },
  {
    id: 'ngo-3',
    name: 'Shroffs Foundation Trust',
    area: 'Kalali',
    focus: 'Rural development since 1980: health services, livelihood for rural women and water management.',
    address: 'Kalali-Talsat Road, Kalali, Vadodara, Gujarat - 390012',
    latitude: 22.2736,
    longitude: 73.1528,
    isRegisteredOnMealBridge: false,
  },
  {
    id: 'ngo-4',
    name: 'The Akshaya Patra Foundation',
    area: 'Gotri',
    focus: 'Runs mid-day meal kitchens for government school children.',
    address: 'Plot No 42, Sevashram Society, Gotri Road, Near Hari Nagar, Vadodara, Gujarat - 390021',
    latitude: 22.3168,
    longitude: 73.1492,
    isRegisteredOnMealBridge: false,
  },
  {
    id: 'ngo-5',
    name: 'Pratibha Foundation',
    area: 'Old Chhani Road',
    focus: "Women's development, education and skill training for girls.",
    address: 'B-12 MBC and Das Patel Residency, Near Saint Joseph School, Old Chhani Road, Vadodara, Gujarat - 390002',
    latitude: 22.3385,
    longitude: 73.1915,
    isRegisteredOnMealBridge: false,
  },
  {
    id: 'ngo-6',
    name: 'Astha Foundation',
    area: 'Waghodia',
    focus: 'Runs Parivartan School for specially abled children: education, training and rehabilitation.',
    address: 'Aditya Avenue, F-6, Ajwa Road, Near Mahavir Hall, Chandranagar Society, Waghodia, Vadodara, Gujarat - 390019',
    latitude: 22.3060,
    longitude: 73.2350,
    isRegisteredOnMealBridge: false,
  },
  {
    id: 'ngo-7',
    name: 'Koshish Milap Trust',
    area: 'Diwalipura',
    focus: 'Child rights, community awareness and support for vulnerable families.',
    address: '10, Gotri Road, Ganga Park, Inside Pashabhai Park, Race Course, Paris Nagar, Diwalipura, Vadodara, Gujarat - 390007',
    latitude: 22.3012,
    longitude: 73.1588,
    isRegisteredOnMealBridge: false,
  },
];
