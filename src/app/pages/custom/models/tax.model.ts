export interface Tax {
  id: string;
  code: string;
  name: string;
  calculationType: CalculationType;
}

export enum CalculationType {
  PERCENTAGE = 'Percentage',
  FIXED = 'Fixed',
  DERIVED = 'Derived',
  COMPOSITE = 'Composite'
}
