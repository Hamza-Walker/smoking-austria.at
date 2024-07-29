export const formatCurrency = amount =>  {
  return new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(amount / 100)
}
