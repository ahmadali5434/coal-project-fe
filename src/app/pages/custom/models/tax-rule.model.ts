export type ImporterType = 'INDIVIDUAL' | 'COMPANY';

export interface TaxRule {
  id: string;
  taxId: string;
  importerType: ImporterType;
  rate: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
}
