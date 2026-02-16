export interface Tax {
  id: string;
  code: string;
  name: string;
  calculationType: CalculationType;
}

export enum CalculationType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
  COMPOSITE = 'COMPOSITE'
}
