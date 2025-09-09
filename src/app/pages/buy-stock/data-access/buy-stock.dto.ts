import { City, Country } from "../../../shared/model";

export interface CountryRef { id: string; name: string; code: string; }
export interface CityRef { id: string; name: string; }
export interface PurchaseEntry {
  id?: string;
  purchaseDate: string;
  customerName: string;
  placeOfPurchase: string;
  stockDestination: string;
  truckNo: string;
  driverName: string;
  metricTon: number;
  builtyImage: string;
}

export interface PurchaseEntryPayload {
  purchaseDate: string;        // ISO date string e.g. "2025-07-31"
  customerId: number;          // FK
  placeOfPurchaseId: number;   // FK
  stockDestinationId: number;  // FK
  truckNo: string;             
  driverId: number;            // FK
  metricTon: number;           
  builtyImage?: File;
  status: 'partial' | 'complete'; // enum for purchase status
}

export interface PurchaseRate {
  id?: string;
  freightPerTon: number;
  expense: string;
  advancePayment: number;
  amountAFN: number;
  exchangeRate: number;
  amountPKR: number;
}

export type PurchaseStatus = 'partial' | 'complete';

export interface FullPurchaseEntry {
  id?: string;
  purchaseData: PurchaseEntry;
  purchaseRate?: PurchaseRate;
  status: PurchaseStatus;
}

export interface CustomEntry {
  paymentDate: string;
  customAmount: number;
  customImage: string;
}

export type Customer = {
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
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

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
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}