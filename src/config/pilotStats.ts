export interface PilotStatItem {
  id: string;
  labelEn: string;
  number: string;
  labelHi: string;
}

export const pilotStatsConfig: PilotStatItem[] = [
  {
    id: 'meals-served',
    labelEn: 'MEALS SERVED',
    number: '~100',
    labelHi: 'बाँटा गया खाना',
  },
  {
    id: 'active-ngos',
    labelEn: 'ACTIVE NGOs',
    number: '~80',
    labelHi: 'वडोदरा में जुड़े NGO',
  },
  {
    id: 'time-to-accept',
    labelEn: 'TIME TO ACCEPT',
    number: '10 min',
    labelHi: 'स्वीकार करने का समय',
  },
  {
    id: 'safe-delivery',
    labelEn: 'SAFE DELIVERY',
    number: '~95%',
    labelHi: 'सुरक्षित डिलीवरी',
  },
];
