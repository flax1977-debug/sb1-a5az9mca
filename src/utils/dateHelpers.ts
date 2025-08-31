export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB');
}

export function getDaysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(expiryDate: string, daysThreshold: number = 3): boolean {
  return getDaysUntilExpiry(expiryDate) <= daysThreshold;
}

export function getUKSaleSeasons() {
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();

  // UK sale periods
  if (month === 11 && day >= 20) return 'Black Friday';
  if (month === 11 && day >= 26) return 'Boxing Day Prep';
  if (month === 0 && day <= 31) return 'January Sales';
  if (month === 8 && day >= 1 && day <= 15) return 'Back to School';
  if (month === 6 && day >= 15) return 'Summer Sales';
  
  return null;
}