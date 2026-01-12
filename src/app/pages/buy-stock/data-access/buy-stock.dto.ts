import { ActionConfig } from "../../../shared/components/action-cell-renderer/action-cell-renderer.component";
import { City, Country } from "../../../shared/model";

// ----------------- BASE REFERENCES -----------------

export interface CountryRef {
  id: string;
  name: string;
  code: string;
}

export interface CityRef {
  id: string;
  name: string;
}

// ----------------- PURCHASE ENTRY -----------------

export interface Purchase {
  id?: string;
  purchaseDate: string;
  coalType: string;
  customerName: string;
  placeOfPurchase: string;
  stockDestination: string;
  truckNo: string;
  driverName: string;
  metricTon: number;
  ratePerTon: number;
  permanentRate?: number | null;
  temporaryExchangeRate?: number;
  totalPurchaseAmount?: number;
  totalPurchaseAmountInPak?: number | null;
  builtyImage: string;
}

export interface CreateOrUpdatePurchasePayload {
  purchaseDate: string;        // ISO date string e.g. "2025-07-31"
  customerId: number;          // FK
  placeOfPurchaseId: number;   // FK
  stockDestinationId: number;  // FK
  truckNo: string;
  driverId: number;            // FK
  metricTon: number;
  builtyImage?: File;
  status: PurchaseStatus;      // enum
}

// ----------------- PURCHASE FREIGHT -----------------

export interface PurchaseFreight {
  id?: string;
  freightPerTon: number;
  expense: number;
  advancePayment: number;
  totalFreightAmount?: number;
}

// ----------------- PURCHASE STATUS -----------------

export type PurchaseStatus =
  | 'initial_purchase'
  | 'add_freight'
  | 'add_gumrak'
  | 'add_custom'
  | 'complete';

// ----------------- FULL PURCHASE ENTRY -----------------

export interface PurchaseWithDetails {
  id?: string;
  purchase: Purchase;
  purchaseFreight?: PurchaseFreight | null;   // single object (1:1)
  gumrakEntry?: GumrakEntry | null;
  status: PurchaseStatus;

  actions?: ActionConfig[];
}

// ----------------- CUSTOM ENTRY -----------------

export interface CustomEntry {
  paymentDate: string;
  customAmount: number;
  customImage: string;
}
export interface PakCustomEntry {
   id?: number;
  gdNumber: string;
  month: string;
  head: string;
  grossWeight: number;
  netWeight: number;
  currency: string;
  hsCode: string;
  exchangeRate: number;
  importValue: number;
  psidAmount?: number;
  packages?: number;
  stockOut?: number;
  stockBalance?: number;
  sales?: number;
  balance?: number;
  taxPerVehicle?: number;
  createdAt?: string;
  updatedAt?: string;
}
// ----------------- GUMRAK ENTRY -----------------
export interface GumrakEntry {
  id?: number;
  purchaseEntryId?: number;
  islamicDate: string;
  englishDate: string;
  invoiceExpense: number;
  otherExpense: number;
  afghanTax: number;
  commission: number;
  totalGumrakAmount: number;
  gumrakImage?: File | null;
  createdAt?: string;
  updatedAt?: string;
}

// ----------------- CUSTOMER -----------------

export interface Customer {
  id: number;
  idCardNo?: number;
  fullName: string;
  countryId: string;
  province?: string;
  cityId: string;
  areaAddress: string;
  picture?: File;
  phoneNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrUpdateCustomerPayload {
  id?: string;
  fullName: string;
  phoneNumber: string;
  countryId: string;
  cityId: string;
  address: string;
}

// ----------------- DRIVER -----------------

export interface Driver {
  id: string;
  idCardNo: string;
  name: string;
  driverFatherName?: string;
  province?: string;
  areaAddress?: string;
  afghanContactNo?: string;
  pakistanContactNo?: string;
  country?: Country | null;
  city?: City | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrUpdateDriverPayload {
  idCardNo: string;
  name: string;
  driverFatherName?: string;
  province?: string;
  areaAddress?: string;
  afghanContactNo?: string;
  pakistanContactNo?: string;
  countryId: string;
  cityId: string;
}

// ----------------- WAREHOUSE -----------------

export interface Warehouse {
  id: number;
  name: string;
  countryId: number;
  cityId: number;
  warehouseLocation: string;
  country?: Country;
  city?: City;
}

export interface CreateOrUpdateWarehousePayload {
  name: string;
  countryId: string;
  cityId: string;
  warehouseLocation: string;
}

// ----------------- API RESPONSE -----------------

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
export interface ExchangeRate {
  id?: number;
  startDate: string;
  endDate: string;
  permanentRate: number;
}