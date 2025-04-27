export interface Unit {
  id: number;
  name: string;
  category: string;
  era: string;
  maintenance: number;
  movement: number;
  sight: number;
  buildTime: number;
  prereqTechId: number;
} 