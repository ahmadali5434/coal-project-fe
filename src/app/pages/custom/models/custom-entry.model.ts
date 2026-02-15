import { CustomEntryTax } from './custom-entry-tax.model';

export interface CustomEntry {
  id: number;
  purchaseEntryId: number;
  gdNumber: string;
  gdDate: string;
  importValue: string;
  importerType: 'INDIVIDUAL' | 'COMPANY';
  packages: number;
  createdAt: string;
  updatedAt: string;

  taxes?: CustomEntryTax[];
}