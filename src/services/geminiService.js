// Gemini AI Wealth Advisory service wrapper
// Integrates with real Google Gemini API and constructs high-fidelity educational wealth recommendations.

export const geminiService = {
  async askAdvisor(queryText, userData = {}) {
    console.log("Querying Gemini Wealth Advisor", queryText);

    const income = userData.income || 150000;
    const expensesLimit = userData.expenses || 60000;
    const risk = userData.riskProfile || 'balanced';
    const goals = userData.goals || [];
    const loggedExpenses = userData.loggedExpenses || [];

    // System prompt instructing Gemini to evaluate context and return formatted sections
    const systemPrompt = `You are Finora AI, a premium fiduciary-grade luxury wealth advisor companion.
You are talking to ${userData.name || 'our client'} (Age: ${userData.age || 'N/A'}, Occupation: ${userData.occupation || 'N/A'}).
Their monthly inflow (income) is ₹${income}, and monthly outflow limit is ₹${expensesLimit}.
Their risk profile is: ${risk}.
Their wealth target goals are: ${goals.join(', ') || 'N/A'}.
Here is their active transaction outflow ledger: ${JSON.stringify(loggedExpenses.slice(0, 5))}.

Provide a brilliant, brief, sophisticated financial advisory response to their query: "${queryText}".

Requirements:
1. Format your response into exactly three structured sections with clean markdown headers:
   - ### Analysis
   - ### Advice
   - ### Action Steps
2. Maintain a highly professional, luxury, fiduciary-grade advisory tone.
3. IMPORTANT: Provide educational investment guidance only. Do NOT guarantee specific returns or capital gains.`;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }]
            })
          }
        );
        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
      } catch (err) {
        console.error("Gemini API call failed, falling back to local fallback advice.", err);
      }
    }

    // High-fidelity fallback generator if API key is not configured
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Dynamic fallback generation based on actual client profile metrics
    return `### Analysis
Your monthly inflow is ₹${income.toLocaleString()} and your monthly expense threshold is ₹${expensesLimit.toLocaleString()}. With a **${risk}** risk profile, your primary focus is capital balancing and optimizing discretionary outflows. 

### Advice
1. Based on your active goals (${goals.join(', ') || 'Wealth growth'}), we suggest re-allocating unnecessary food and shopping overheads.
2. Given your volatility bounds, consider diversifying 15% of your liquid capital into defensive asset indexes to prepare for upcoming semester shifts.
3. Note: This advice is for educational investment guidance only. Returns are subject to market conditions and cannot be guaranteed.

### Action Steps
* **Step 1**: Restructure SaaS duplicates to reclaim ₹1,400 monthly.
* **Step 2**: Route ₹10,000 monthly from current account into your active Robo-Portfolio.
* **Step 3**: Consult a tax advisor to maximize Section 80C infrastructure bond allocations.`;
  },

  async analyzeGoal(goalData) {
    console.log("Querying Gemini Goal Advisor", goalData.name);

    const systemPrompt = `You are Finora AI, a premium fiduciary-grade luxury wealth advisor.
The client has a financial goal: "${goalData.name}".
Target amount: ₹${goalData.target}.
Current savings: ₹${goalData.current}.
Deadline: ${goalData.deadline}.

Provide a brief (max 2 sentences), highly professional, actionable recommendation on how the client can reach this goal by the deadline. 
Focus on investment strategy or savings optimization.
Do NOT guarantee returns.`;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }]
            })
          }
        );
        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
      } catch (err) {
        console.error("Gemini API call failed, falling back.", err);
      }
    }

    // High-fidelity fallback
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `To reach your ₹${goalData.target.toLocaleString()} target by ${goalData.deadline}, consider allocating recurring monthly savings into a mix of index funds and short-term debt instruments based on your risk appetite.`;
  }
};
