export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(price);
}

export function calculateVAT(priceExVAT: number): number {
  return priceExVAT * 0.20; // UK VAT rate is 20%
}

export function addVAT(priceExVAT: number): number {
  return priceExVAT * 1.20;
}

export function calculateFinalPrice(
  basePrice: number, 
  deliveryCost: number, 
  collectInStore: boolean
): number {
  return basePrice + (collectInStore ? 0 : deliveryCost);
}