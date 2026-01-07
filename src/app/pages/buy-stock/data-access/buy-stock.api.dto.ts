import { PurchaseFreight, GumrakEntry, PurchaseStatus } from './buy-stock.dto';

export interface PurchaseApiResponse {
  id: number;
  purchaseDate: string;
  coalType: string;
  truckNo: string;
  metricTon: number;
  ratePerTon: number;
  totalPurchaseAmount: string;
  permanentRate: number | null;
  temporaryExchangeRate: string | null;
  builtyImage: string | null;

  customer?: {
    id: number;
    name: string;
  };

  driver?: {
    id: number;
    name: string;
  };

  placeOfPurchase?: {
    id: number;
    name: string;
  };

  stockDestination?: {
    id: number;
    name: string;
  };

  purchaseFreight?: PurchaseFreight | null;
  gumrakEntry?: GumrakEntry | null;
  status: PurchaseStatus;
}
