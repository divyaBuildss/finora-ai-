// Premium financial helpers and mathematical models

/**
 * Formats a number into Indian Rupees (INR) format
 */
export function formatINR(value) {
  if (value === undefined || value === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * SIP Calculator: Calculates maturity wealth, total investments, and wealth gained.
 * P = Monthly investment
 * r = Monthly interest rate (annual rate / 12 / 100)
 * n = Number of payments (years * 12)
 * Formula: M = P * [ ( (1 + r)^n - 1 ) / r ] * (1 + r)
 */
export function calculateSIP(monthlyInvestment, annualRate, years) {
  const P = parseFloat(monthlyInvestment) || 0;
  const r = (parseFloat(annualRate) || 0) / 12 / 100;
  const n = (parseFloat(years) || 0) * 12;

  if (P <= 0 || r <= 0 || n <= 0) {
    return { totalInvestment: 0, totalWealth: 0, wealthGained: 0 };
  }

  const totalInvestment = P * n;
  const totalWealth = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  const wealthGained = totalWealth - totalInvestment;

  return {
    totalInvestment: Math.round(totalInvestment),
    totalWealth: Math.round(totalWealth),
    wealthGained: Math.round(wealthGained)
  };
}

/**
 * Calculates a basic credit/financial health score based on active budgets and expenses.
 */
export function calculateHealthScore(budgets, expenses) {
  if (!budgets || !expenses) return 94.2;
  
  // Calculate average percentage of budget utilized
  let totalLimit = 0;
  let totalSpent = 0;
  
  Object.keys(budgets).forEach(cat => {
    totalLimit += budgets[cat].limit || 0;
    totalSpent += budgets[cat].spent || 0;
  });

  if (totalLimit === 0) return 90.0;
  
  const utilization = totalSpent / totalLimit;
  
  // Ideal utilization is 40% - 60%. Penalize high or very low utilization.
  let score = 100 - Math.abs(utilization - 0.5) * 40;
  
  // Adjust based on total number of recent transactions (active tracking is good)
  score += Math.min(expenses.length * 0.5, 5);
  
  return parseFloat(Math.min(Math.max(score, 50), 99.8).toFixed(1));
}
