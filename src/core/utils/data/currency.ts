const currencySymbols: { [key: string]: string } = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

export const formatCurrency = (
  amount: number,
  currencyCode: string = "USD"
) => {
  const symbol = currencySymbols[currencyCode.toUpperCase()] || currencyCode;
  const formattedAmount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${symbol}${formattedAmount}`;
}; 