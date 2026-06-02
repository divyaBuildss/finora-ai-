import { collection, doc, setDoc, deleteDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

const INITIAL_EXPENSES = [
  { id: '1', description: 'Institutional Dinner Banquet', category: 'Food', amount: 8500, date: '2026-06-01', createdAt: new Date().toISOString() },
  { id: '2', description: 'Venture Conference Travel', category: 'Travel', amount: 32000, date: '2026-05-28', createdAt: new Date().toISOString() },
  { id: '3', description: 'Bloomberg terminal premium subscription', category: 'Bills', amount: 18500, date: '2026-05-25', createdAt: new Date().toISOString() },
  { id: '4', description: 'Algorithmic Arbitrage Course', category: 'Education', amount: 15000, date: '2026-05-20', createdAt: new Date().toISOString() }
];

const INITIAL_BUDGETS = {
  food: { limit: 30000, spent: 8500 },
  shopping: { limit: 50000, spent: 12000 },
  travel: { limit: 80000, spent: 32000 },
  bills: { limit: 100000, spent: 18500 },
  education: { limit: 50000, spent: 15000 },
  health: { limit: 25000, spent: 0 },
  entertainment: { limit: 30000, spent: 0 }
};

const INITIAL_GOALS = [
  { id: '1', name: 'Private Equity Fund Entry', target: 5000000, current: 3200000, deadline: '2026-12-31' },
  { id: '2', name: 'Luxury Seaside Villa', target: 20000000, current: 8500000, deadline: '2028-06-30' },
  { id: '3', name: 'Generational Trust Foundation', target: 100000000, current: 24000000, deadline: '2035-01-01' }
];

const isOffline = () => {
  return !import.meta.env.VITE_FIREBASE_API_KEY || 
         import.meta.env.VITE_FIREBASE_API_KEY.includes("Placeholder") || 
         import.meta.env.VITE_FIREBASE_API_KEY.includes("FakeKey");
};

export const databaseService = {
  // --- Expenses ---
  async getExpenses(userId = 'demo_user') {
    if (isOffline()) {
      const data = localStorage.getItem('finora_expenses');
      if (!data) {
        localStorage.setItem('finora_expenses', JSON.stringify(INITIAL_EXPENSES));
        return INITIAL_EXPENSES;
      }
      return JSON.parse(data);
    }

    try {
      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const expensesList = [];
      querySnapshot.forEach((doc) => {
        expensesList.push({ id: doc.id, ...doc.data() });
      });
      
      if (expensesList.length === 0) {
        // Seed default transactions in Firestore for visual richness
        for (const exp of INITIAL_EXPENSES) {
          await this.saveExpense({ ...exp, userId });
        }
        return INITIAL_EXPENSES;
      }
      return expensesList;
    } catch (err) {
      console.error("Firestore getExpenses failed, loading local cache.", err);
      const data = localStorage.getItem('finora_expenses');
      return data ? JSON.parse(data) : INITIAL_EXPENSES;
    }
  },

  async saveExpense(expense, userId = 'demo_user') {
    const expenseId = expense.id || `exp_${Math.random().toString(36).substr(2, 9)}`;
    const newExpense = {
      id: expenseId,
      userId: expense.userId || userId,
      amount: parseFloat(expense.amount) || 0,
      category: expense.category || 'Food',
      description: expense.description || 'Outflow transaction',
      date: expense.date || new Date().toISOString().split('T')[0],
      createdAt: expense.createdAt || new Date().toISOString()
    };

    if (isOffline()) {
      const expenses = await this.getExpenses();
      const existingIdx = expenses.findIndex(e => e.id === expenseId);
      if (existingIdx > -1) {
        expenses[existingIdx] = newExpense;
      } else {
        expenses.unshift(newExpense);
      }
      localStorage.setItem('finora_expenses', JSON.stringify(expenses));
      return newExpense;
    }

    try {
      await setDoc(doc(db, 'expenses', expenseId), newExpense);
      return newExpense;
    } catch (err) {
      console.error("Firestore saveExpense failed:", err);
      throw err;
    }
  },

  async deleteExpense(id) {
    if (isOffline()) {
      const expenses = await this.getExpenses();
      const filtered = expenses.filter(e => e.id !== id);
      localStorage.setItem('finora_expenses', JSON.stringify(filtered));
      return true;
    }

    try {
      await deleteDoc(doc(db, 'expenses', id));
      return true;
    } catch (err) {
      console.error("Firestore deleteExpense failed:", err);
      throw err;
    }
  },

  // --- Budgets ---
  getBudgets() {
    const data = localStorage.getItem('finora_budgets');
    if (!data) {
      localStorage.setItem('finora_budgets', JSON.stringify(INITIAL_BUDGETS));
      return INITIAL_BUDGETS;
    }
    return JSON.parse(data);
  },

  updateBudgetLimit(category, limit) {
    const budgets = this.getBudgets();
    if (budgets[category]) {
      budgets[category].limit = parseFloat(limit) || 0;
      localStorage.setItem('finora_budgets', JSON.stringify(budgets));
    }
    return budgets;
  },

  // --- Goals ---
  async getGoals(userId = 'demo_user') {
    if (isOffline()) {
      const data = localStorage.getItem('finora_goals');
      if (!data) {
        localStorage.setItem('finora_goals', JSON.stringify(INITIAL_GOALS));
        return INITIAL_GOALS;
      }
      return JSON.parse(data);
    }

    try {
      const q = query(
        collection(db, 'goals'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const goalsList = [];
      querySnapshot.forEach((doc) => {
        goalsList.push({ id: doc.id, ...doc.data() });
      });
      
      if (goalsList.length === 0) {
        for (const goal of INITIAL_GOALS) {
          await this.saveGoal({ ...goal, userId });
        }
        return INITIAL_GOALS;
      }
      return goalsList;
    } catch (err) {
      console.error("Firestore getGoals failed, loading local cache.", err);
      const data = localStorage.getItem('finora_goals');
      return data ? JSON.parse(data) : INITIAL_GOALS;
    }
  },

  async saveGoal(goal, userId = 'demo_user') {
    const goalId = goal.id || `goal_${Math.random().toString(36).substr(2, 9)}`;
    const newGoal = {
      ...goal,
      id: goalId,
      userId: goal.userId || userId,
      target: parseFloat(goal.target) || 0,
      current: parseFloat(goal.current) || 0
    };

    if (isOffline()) {
      const goals = await this.getGoals();
      const existingIdx = goals.findIndex(g => g.id === goalId);
      if (existingIdx > -1) {
        goals[existingIdx] = newGoal;
      } else {
        goals.push(newGoal);
      }
      localStorage.setItem('finora_goals', JSON.stringify(goals));
      return newGoal;
    }

    try {
      await setDoc(doc(db, 'goals', goalId), newGoal);
      return newGoal;
    } catch (err) {
      console.error("Firestore saveGoal failed:", err);
      throw err;
    }
  },

  async updateGoalProgress(id, current) {
    if (isOffline()) {
      const goals = await this.getGoals();
      const updated = goals.map(g => g.id === id ? { ...g, current: parseFloat(current) || 0 } : g);
      localStorage.setItem('finora_goals', JSON.stringify(updated));
      return updated;
    }

    try {
      await setDoc(doc(db, 'goals', id), { current: parseFloat(current) || 0 }, { merge: true });
      return this.getGoals();
    } catch (err) {
      console.error("Firestore updateGoalProgress failed:", err);
      throw err;
    }
  },

  async deleteGoal(id) {
    if (isOffline()) {
      const goals = await this.getGoals();
      const filtered = goals.filter(g => g.id !== id);
      localStorage.setItem('finora_goals', JSON.stringify(filtered));
      return true;
    }
    try {
      await deleteDoc(doc(db, 'goals', id));
      return true;
    } catch (err) {
      console.error("Firestore deleteGoal failed:", err);
      throw err;
    }
  },

  // --- Investments ---
  async getInvestments(userId = 'demo_user') {
    if (isOffline()) {
      const data = localStorage.getItem('finora_investments');
      return data ? JSON.parse(data) : [];
    }

    try {
      const q = query(
        collection(db, 'investments'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    } catch (err) {
      console.error("Firestore getInvestments failed:", err);
      const data = localStorage.getItem('finora_investments');
      return data ? JSON.parse(data) : [];
    }
  },

  async saveInvestment(investment, userId = 'demo_user') {
    const id = investment.id || `inv_${Math.random().toString(36).substr(2, 9)}`;
    const newInvestment = {
      id,
      userId: investment.userId || userId,
      riskProfile: investment.riskProfile || 'balanced',
      monthlyAmount: parseFloat(investment.monthlyAmount) || 0,
      allocation: investment.allocation || [],
      createdAt: investment.createdAt || new Date().toISOString()
    };

    if (isOffline()) {
      const list = await this.getInvestments(userId);
      list.unshift(newInvestment);
      localStorage.setItem('finora_investments', JSON.stringify(list));
      return newInvestment;
    }

    try {
      await setDoc(doc(db, 'investments', id), newInvestment);
      return newInvestment;
    } catch (err) {
      console.error("Firestore saveInvestment failed:", err);
      throw err;
    }
  },

  // --- Notifications ---
  async getNotifications(userId = 'demo_user') {
    if (isOffline()) {
      const data = localStorage.getItem('finora_notifications');
      let notifications = data ? JSON.parse(data) : [];
      
      if (notifications.length === 0) {
        notifications = await this.generateDynamicNotifications(userId);
        localStorage.setItem('finora_notifications', JSON.stringify(notifications));
      }
      return notifications;
    }

    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      if (list.length === 0) {
        const generated = await this.generateDynamicNotifications(userId);
        for (const n of generated) {
          await setDoc(doc(db, 'notifications', n.id), n);
        }
        return generated;
      }
      return list;
    } catch (err) {
      console.error("Firestore getNotifications failed:", err);
      const data = localStorage.getItem('finora_notifications');
      return data ? JSON.parse(data) : [];
    }
  },

  async generateDynamicNotifications(userId) {
    const notifications = [];
    
    const expenses = await this.getExpenses(userId);
    const goals = await this.getGoals(userId);
    
    const budgets = this.getBudgets();
    const categories = ['food', 'shopping', 'travel', 'bills', 'education', 'health', 'entertainment'];
    
    categories.forEach(cat => {
      const budget = budgets[cat];
      if (!budget) return;
      
      const spent = expenses.filter(e => e.category.toLowerCase() === cat).reduce((sum, e) => sum + e.amount, 0);
      const pct = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      
      if (pct >= 90) {
        notifications.push({
          id: `notif_b_${cat}_${Date.now()}`,
          userId,
          title: 'Budget Alert',
          message: `⚠️ ${cat.charAt(0).toUpperCase() + cat.slice(1)} budget reached ${pct.toFixed(0)}%`,
          type: 'budget_alert',
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    goals.forEach(goal => {
      const pct = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
      if (pct >= 50) {
        notifications.push({
          id: `notif_g_${goal.id}_${Date.now()}`,
          userId,
          title: 'Goal Reminder',
          message: `🎯 You completed ${pct.toFixed(0)}% of your ${goal.name} goal`,
          type: 'goal_reminder',
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    const localUser = localStorage.getItem('finora_user');
    let income = 150000;
    let risk = 'balanced';
    if (localUser) {
      const parsed = JSON.parse(localUser);
      income = parsed.monthlyIncome || 150000;
      risk = parsed.riskProfile || 'balanced';
    }
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const savings = income - totalSpent;
    if (savings > 0) {
      notifications.push({
        id: `notif_s_${Date.now()}`,
        userId,
        title: 'Saving Achievement',
        message: `💰 You saved ₹${savings.toLocaleString('en-IN')} this month`,
        type: 'saving_achievement',
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    notifications.push({
      id: `notif_i_${Date.now()}`,
      userId,
      title: 'Investment Suggestion',
      message: `💡 Portfolio allocation rebalance recommended: ${risk.toUpperCase()} risk profile is active.`,
      type: 'investment_suggestion',
      read: false,
      createdAt: new Date().toISOString()
    });

    return notifications;
  },

  async markNotificationAsRead(id, userId = 'demo_user') {
    if (isOffline()) {
      const notifications = await this.getNotifications(userId);
      const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('finora_notifications', JSON.stringify(updated));
      return updated;
    }

    try {
      await setDoc(doc(db, 'notifications', id), { read: true }, { merge: true });
      return this.getNotifications(userId);
    } catch (err) {
      console.error("Firestore markNotificationAsRead failed:", err);
      return [];
    }
  },

  async clearNotifications(userId = 'demo_user') {
    if (isOffline()) {
      localStorage.setItem('finora_notifications', JSON.stringify([]));
      return [];
    }

    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const deletePromises = [];
      querySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      await Promise.all(deletePromises);
      return [];
    } catch (err) {
      console.error("Firestore clearNotifications failed:", err);
      return [];
    }
  }
};
