export const INITIAL_EXPENSES = [
  { id: '1', description: 'Institutional Dinner Banquet', category: 'Food', amount: 8500, date: '2026-06-01', createdAt: new Date().toISOString() },
  { id: '2', description: 'Venture Conference Travel', category: 'Travel', amount: 32000, date: '2026-05-28', createdAt: new Date().toISOString() },
  { id: '3', description: 'Bloomberg terminal premium subscription', category: 'Bills', amount: 18500, date: '2026-05-25', createdAt: new Date().toISOString() },
  { id: '4', description: 'Algorithmic Arbitrage Course', category: 'Education', amount: 15000, date: '2026-05-20', createdAt: new Date().toISOString() }
];

export const INITIAL_BUDGETS = {
  food: { limit: 30000, spent: 8500 },
  shopping: { limit: 50000, spent: 12000 },
  travel: { limit: 80000, spent: 32000 },
  bills: { limit: 100000, spent: 18500 },
  education: { limit: 50000, spent: 15000 },
  health: { limit: 25000, spent: 0 },
  entertainment: { limit: 30000, spent: 0 }
};

export const INITIAL_GOALS = [
  { id: '1', name: 'Private Equity Fund Entry', target: 5000000, current: 3200000, deadline: '2026-12-31' },
  { id: '2', name: 'Luxury Seaside Villa', target: 20000000, current: 8500000, deadline: '2028-06-30' },
  { id: '3', name: 'Generational Trust Foundation', target: 100000000, current: 24000000, deadline: '2035-01-01' }
];

export const seedDemoData = async (databaseService, userId) => {
  for (const exp of INITIAL_EXPENSES) {
    await databaseService.saveExpense({ ...exp, userId }, userId);
  }
  for (const goal of INITIAL_GOALS) {
    await databaseService.saveGoal({ ...goal, userId }, userId);
  }
  await databaseService.saveBudgets({ userId, ...INITIAL_BUDGETS }, userId);
};
