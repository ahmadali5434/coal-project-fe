export interface CustomEntryTax {
    id: string;
    customEntryId: number;
    taxCode: string;
    calculationType: string;
    baseValue: string;
    rate: string | null;
    calculatedAmount: string;
    createdAt: string;
  }
  
