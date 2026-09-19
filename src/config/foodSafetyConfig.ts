export interface FoodSafetyRule {
  maxHours: number;
  unitChoices: ('Minutes' | 'Hours' | 'Days')[];
  defaultUnit: 'Minutes' | 'Hours' | 'Days';
  defaultDuration: number;
  labelEn: string;
  labelHi: string;
}

export const FOOD_SAFETY_RULES: Record<string, FoodSafetyRule> = {
  cooked: {
    maxHours: 4,
    unitChoices: ['Minutes', 'Hours'],
    defaultUnit: 'Hours',
    defaultDuration: 4,
    labelEn: 'Cooked Food / पका हुआ खाना',
    labelHi: 'पका हुआ खाना (अधिकतम 4 घंटे)',
  },
  dairy: {
    maxHours: 4,
    unitChoices: ['Minutes', 'Hours'],
    defaultUnit: 'Hours',
    defaultDuration: 4,
    labelEn: 'Dairy / दूध से बना',
    labelHi: 'दूध से बना (अधिकतम 4 घंटे)',
  },
  bakery: {
    maxHours: 24,
    unitChoices: ['Hours'],
    defaultUnit: 'Hours',
    defaultDuration: 12,
    labelEn: 'Bakery / बेकरी',
    labelHi: 'बेकरी (अधिकतम 24 घंटे)',
  },
  raw: {
    maxHours: 72, // 3 days = 72 hours
    unitChoices: ['Hours', 'Days'],
    defaultUnit: 'Days',
    defaultDuration: 2,
    labelEn: 'Raw / कच्चा सामान',
    labelHi: 'कच्चा सामान (अधिकतम 3 दिन)',
  },
  packaged: {
    maxHours: 999999, // until printed expiry date
    unitChoices: ['Days'],
    defaultUnit: 'Days',
    defaultDuration: 7,
    labelEn: 'Packed / पैकेट वाला',
    labelHi: 'पैकेट वाला (पैकेट पर लिखी एक्सपायरी तक)',
  },
};

export const PACKING_OPTIONS = [
  'Tiffin / Lunch box / टिफिन',
  'Steel or Aluminium vessel / स्टील या एल्युमिनियम बर्तन',
  'Aluminium foil / एल्युमिनियम फॉइल',
  'Plastic container / प्लास्टिक डिब्बा',
  'Plastic bag / प्लास्टिक थैली',
  'Paper box / कागज़ का डिब्बा',
  'Original sealed pack / कंपनी की सील पैक',
  'Other / दूसरा',
];
