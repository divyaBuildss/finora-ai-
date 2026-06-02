/**
 * Analyzes expenses to detect monthly recurring subscriptions.
 * A subscription is identified when there are 2 or more expenses with the same/similar
 * description, similar amounts, and a roughly monthly interval (25-35 days, or calendar month difference of 1).
 * 
 * @param {Array<Object>} expenses - List of expense documents
 * @returns {Array<Object>} List of detected subscriptions
 */
export const detectSubscriptions = (expenses) => {
  if (!expenses || expenses.length === 0) return [];

  // Group expenses by normalized description/merchant name
  const groups = {};

  expenses.forEach(e => {
    if (!e.description || !e.amount || !e.date) return;

    // Normalize description: lowercase and trimmed
    const descNormalized = e.description.toLowerCase().trim();

    // Grouping keys with simple fuzzy containment check
    let groupKey = Object.keys(groups).find(k => 
      k === descNormalized || 
      k.includes(descNormalized) || 
      descNormalized.includes(k)
    );

    if (!groupKey) {
      groupKey = descNormalized;
      groups[groupKey] = [];
    }

    groups[groupKey].push({
      id: e.id,
      description: e.description,
      amount: parseFloat(e.amount),
      date: new Date(e.date),
      dateStr: e.date,
      category: e.category
    });
  });

  const subscriptions = [];

  // Inspect each group for a recurring pattern
  Object.keys(groups).forEach(key => {
    const items = groups[key];
    if (items.length < 2) return;

    // Sort by date ascending
    items.sort((a, b) => a.date - b.date);

    let monthlyMatches = 0;
    const lastItem = items[items.length - 1];

    for (let i = 1; i < items.length; i++) {
      const prev = items[i - 1];
      const curr = items[i];

      // 1. Amount tolerance: within 15% range
      const diffPercent = Math.abs(prev.amount - curr.amount) / Math.max(prev.amount, curr.amount);
      if (diffPercent > 0.15) continue;

      // 2. Date intervals: difference in days
      const diffTime = Math.abs(curr.date - prev.date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 3. Calendar month difference
      const prevMonth = prev.date.getMonth();
      const prevYear = prev.date.getFullYear();
      const currMonth = curr.date.getMonth();
      const currYear = curr.date.getFullYear();
      const monthDiff = (currYear - prevYear) * 12 + (currMonth - prevMonth);

      // Check if intervals look monthly (1 month diff and days between 15 and 45)
      if (monthDiff >= 1 && monthDiff <= 2 && diffDays >= 15 && diffDays <= 45) {
        monthlyMatches++;
      }
    }

    if (monthlyMatches >= 1) {
      // Pick original display name from the first occurrence
      const name = items[0].description;
      const amount = lastItem.amount;
      const category = lastItem.category || 'Subscription';

      subscriptions.push({
        name,
        amount,
        category,
        frequency: "Monthly",
        lastPaid: lastItem.dateStr
      });
    }
  });

  return subscriptions;
};
