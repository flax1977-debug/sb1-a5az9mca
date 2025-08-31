export interface Deal {
  id: string;
  title: string;
  description: string;
  retailer: string;
  retailerLogo: string;
  originalPrice: number;
  currentPrice: number;
  discount: number;
  discountPercentage: number;
  category: string;
  image: string;
  dealType: 'clearance' | 'voucher' | 'cashback' | 'seasonal';
  expiryDate?: string;
  availability: 'in-stock' | 'limited' | 'out-of-stock';
  deliveryCost: number;
  collectInStore: boolean;
  vatIncluded: boolean;
  region: string[];
  priceHistory: PricePoint[];
  cashbackRate?: number;
  voucherCode?: string;
  features: string[];
}

export interface PricePoint {
  date: string;
  price: number;
  retailer: string;
}

export interface Retailer {
  id: string;
  name: string;
  logo: string;
  category: string[];
  trusted: boolean;
  averageDeliveryTime: string;
  freeDeliveryThreshold: number;
}