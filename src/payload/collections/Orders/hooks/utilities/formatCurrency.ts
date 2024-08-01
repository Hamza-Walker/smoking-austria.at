export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(amount / 100)
}
