export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatNumber = (number: number): string => {
  if (number >= 10000000) {
    return `${(number / 10000000).toFixed(2)} Cr`;
  } else if (number >= 100000) {
    return `${(number / 100000).toFixed(2)} L`;
  } else if (number >= 1000) {
    return `${(number / 1000).toFixed(2)} K`;
  }
  return number.toString();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

export const calculateFinancialMetrics = (data: FinancialData) => {
  const totalExpenses = Object.values(data.expenses).reduce((a, b) => a + b, 0);
  const totalInvestments = Object.values(data.investments).reduce((a, b) => a + b, 0);
  const totalDebts = Object.values(data.debts).reduce((a, b) => a + b, 0);
  const monthlySavings = data.income - totalExpenses;
  const debtToIncome = data.income > 0 ? (totalDebts / data.income) * 100 : 0;
  const savingsRate = data.income > 0 ? (monthlySavings / data.income) * 100 : 0;

  return {
    totalExpenses,
    totalInvestments,
    totalDebts,
    monthlySavings,
    debtToIncome,
    savingsRate,
  };
};
