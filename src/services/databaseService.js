import { collection, doc, setDoc, deleteDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase.js';
const EMPTY_BUDGETS = {
  food: { limit: 0, spent: 0 },
  shopping: { limit: 0, spent: 0 },
  travel: { limit: 0, spent: 0 },
  bills: { limit: 0, spent: 0 },
  education: { limit: 0, spent: 0 },
  health: { limit: 0, spent: 0 },
  entertainment: { limit: 0, spent: 0 }
};

const isOffline = () => {
  return !import.meta.env.VITE_FIREBASE_API_KEY || 
         import.meta.env.VITE_FIREBASE_API_KEY.includes("Placeholder") || 
         import.meta.env.VITE_FIREBASE_API_KEY.includes("FakeKey");
};

export const databaseService = {
  // --- Expenses CRUD ---
  async getExpenses(userId = 'demo_user') {
    if (isOffline()) {
      const data = localStorage.getItem(`finora_expenses_${userId}`);
      if (!data) {
        localStorage.setItem(`finora_expenses_${userId}`, JSON.stringify([]));
        return [];
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
      return expensesList;
    } catch (err) {
      console.error("Firestore getExpenses failed, loading local cache.", err);
      const data = localStorage.getItem(`finora_expenses_${userId}`);
      return data ? JSON.parse(data) : [];
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
      const expenses = await this.getExpenses(userId);
      const existingIdx = expenses.findIndex(e => e.id === expenseId);
      if (existingIdx > -1) {
        expenses[existingIdx] = newExpense;
      } else {
        expenses.unshift(newExpense);
      }
      localStorage.setItem(`finora_expenses_${userId}`, JSON.stringify(expenses));
      return newExpense;
    }

    try {
      await setDoc(doc(db, 'expenses', expenseId), newExpense);
      // Update local storage backup
      const expenses = await this.getExpenses(userId);
      const existingIdx = expenses.findIndex(e => e.id === expenseId);
      if (existingIdx > -1) {
        expenses[existingIdx] = newExpense;
      } else {
        expenses.unshift(newExpense);
      }
      localStorage.setItem(`finora_expenses_${userId}`, JSON.stringify(expenses));
      return newExpense;
    } catch (err) {
      console.error("Firestore saveExpense failed:", err);
      throw err;
    }
  },

  async addExpense(expense, userId = 'demo_user') {
    return this.saveExpense(expense, userId);
  },

  async updateExpense(expense, userId = 'demo_user') {
    return this.saveExpense(expense, userId);
  },

  async deleteExpense(id, userId = 'demo_user') {
    if (isOffline()) {
      const expenses = await this.getExpenses(userId);
      const filtered = expenses.filter(e => e.id !== id);
      localStorage.setItem(`finora_expenses_${userId}`, JSON.stringify(filtered));
      return true;
    }

    try {
      await deleteDoc(doc(db, 'expenses', id));
      const expenses = await this.getExpenses(userId);
      const filtered = expenses.filter(e => e.id !== id);
      localStorage.setItem(`finora_expenses_${userId}`, JSON.stringify(filtered));
      return true;
    } catch (err) {
      console.error("Firestore deleteExpense failed:", err);
      throw err;
    }
  },

  // --- Goals CRUD ---
  async getGoals(userId = 'demo_user') {
    if (isOffline()) {
      const data = localStorage.getItem(`finora_goals_${userId}`);
      if (!data) {
        localStorage.setItem(`finora_goals_${userId}`, JSON.stringify([]));
        return [];
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
      return goalsList;
    } catch (err) {
      console.error("Firestore getGoals failed, loading local cache.", err);
      const data = localStorage.getItem(`finora_goals_${userId}`);
      return data ? JSON.parse(data) : [];
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
      const goals = await this.getGoals(userId);
      const existingIdx = goals.findIndex(g => g.id === goalId);
      if (existingIdx > -1) {
        goals[existingIdx] = newGoal;
      } else {
        goals.push(newGoal);
      }
      localStorage.setItem(`finora_goals_${userId}`, JSON.stringify(goals));
      return newGoal;
    }

    try {
      await setDoc(doc(db, 'goals', goalId), newGoal);
      // Sync local storage backup
      const goals = await this.getGoals(userId);
      const existingIdx = goals.findIndex(g => g.id === goalId);
      if (existingIdx > -1) {
        goals[existingIdx] = newGoal;
      } else {
        goals.push(newGoal);
      }
      localStorage.setItem(`finora_goals_${userId}`, JSON.stringify(goals));
      return newGoal;
    } catch (err) {
      console.error("Firestore saveGoal failed:", err);
      throw err;
    }
  },

  async createGoal(goal, userId = 'demo_user') {
    return this.saveGoal(goal, userId);
  },

  async updateGoal(goal, userId = 'demo_user') {
    return this.saveGoal(goal, userId);
  },

  async updateGoalProgress(id, current, userId = 'demo_user') {
    if (isOffline()) {
      const goals = await this.getGoals(userId);
      const updated = goals.map(g => g.id === id ? { ...g, current: parseFloat(current) || 0 } : g);
      localStorage.setItem(`finora_goals_${userId}`, JSON.stringify(updated));
      return updated;
    }

    try {
      await setDoc(doc(db, 'goals', id), { current: parseFloat(current) || 0 }, { merge: true });
      return this.getGoals(userId);
    } catch (err) {
      console.error("Firestore updateGoalProgress failed:", err);
      throw err;
    }
  },

  async deleteGoal(id, userId = 'demo_user') {
    if (isOffline()) {
      const goals = await this.getGoals(userId);
      const filtered = goals.filter(g => g.id !== id);
      localStorage.setItem(`finora_goals_${userId}`, JSON.stringify(filtered));
      return true;
    }
    try {
      await deleteDoc(doc(db, 'goals', id));
      const goals = await this.getGoals(userId);
      const filtered = goals.filter(g => g.id !== id);
      localStorage.setItem(`finora_goals_${userId}`, JSON.stringify(filtered));
      return true;
    } catch (err) {
      console.error("Firestore deleteGoal failed:", err);
      throw err;
    }
  },

  // --- Budgets (Firestore + Fallback) ---
  async saveBudgets(budgets, userId = 'demo_user') {
    const dataToSave = {
      userId,
      ...budgets,
      updatedAt: new Date().toISOString()
    };

    if (isOffline()) {
      localStorage.setItem(`finora_budgets_${userId}`, JSON.stringify(dataToSave));
      return dataToSave;
    }

    try {
      await setDoc(doc(db, 'budgets', userId), dataToSave);
      localStorage.setItem(`finora_budgets_${userId}`, JSON.stringify(dataToSave));
      return dataToSave;
    } catch (err) {
      console.error("Firestore saveBudgets failed:", err);
      throw err;
    }
  },

  async fetchBudgets(userId = 'demo_user') {
    if (isOffline()) {
      const data = localStorage.getItem(`finora_budgets_${userId}`);
      if (!data) {
        const defaultBudgets = { userId, ...EMPTY_BUDGETS };
        localStorage.setItem(`finora_budgets_${userId}`, JSON.stringify(defaultBudgets));
        return defaultBudgets;
      }
      return JSON.parse(data);
    }

    try {
      const docSnap = await getDocs(query(collection(db, 'budgets'), where('userId', '==', userId)));
      if (!docSnap.empty) {
        return docSnap.docs[0].data();
      }
      
      // Seed default empty budgets if not found
      const defaultBudgets = { userId, ...EMPTY_BUDGETS };
      await this.saveBudgets(defaultBudgets, userId);
      return defaultBudgets;
    } catch (err) {
      console.error("Firestore fetchBudgets failed, loading local cache.", err);
      const data = localStorage.getItem(`finora_budgets_${userId}`);
      return data ? JSON.parse(data) : { userId, ...EMPTY_BUDGETS };
    }
  },

  // Backwards compatibility functions for budget categories
  getBudgets() {
    const data = localStorage.getItem('finora_budgets');
    if (!data) {
      localStorage.setItem('finora_budgets', JSON.stringify(EMPTY_BUDGETS));
      return EMPTY_BUDGETS;
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

  // --- Investments CRUD ---
  async getInvestments(userId = 'demo_user') {
    if (isOffline()) {
      const data = localStorage.getItem(`finora_investments_${userId}`);
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
      const data = localStorage.getItem(`finora_investments_${userId}`);
      return data ? JSON.parse(data) : [];
    }
  },

  async fetchInvestments(userId = 'demo_user') {
    return this.getInvestments(userId);
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
      localStorage.setItem(`finora_investments_${userId}`, JSON.stringify(list));
      return newInvestment;
    }

    try {
      await setDoc(doc(db, 'investments', id), newInvestment);
      const list = await this.getInvestments(userId);
      list.unshift(newInvestment);
      localStorage.setItem(`finora_investments_${userId}`, JSON.stringify(list));
      return newInvestment;
    } catch (err) {
      console.error("Firestore saveInvestment failed:", err);
      throw err;
    }
  },

  // --- Chat History (Firestore + Fallback) ---
  async saveChatHistory(message, userId = 'demo_user') {
    const msgId = message.id || `msg_${Math.random().toString(36).substr(2, 9)}`;
    const dataToSave = {
      id: msgId,
      userId,
      sender: message.sender,
      text: message.text,
      timestamp: message.timestamp || new Date().toISOString()
    };

    if (isOffline()) {
      const history = await this.loadChatHistory(userId);
      history.push(dataToSave);
      localStorage.setItem(`finora_chat_history_${userId}`, JSON.stringify(history));
      return dataToSave;
    }

    try {
      await setDoc(doc(db, 'chatHistory', msgId), dataToSave);
      const history = await this.loadChatHistory(userId);
      history.push(dataToSave);
      localStorage.setItem(`finora_chat_history_${userId}`, JSON.stringify(history));
      return dataToSave;
    } catch (err) {
      console.error("Firestore saveChatHistory failed:", err);
      throw err;
    }
  },

  async loadChatHistory(userId = 'demo_user') {
    if (isOffline()) {
      const data = localStorage.getItem(`finora_chat_history_${userId}`);
      return data ? JSON.parse(data) : [];
    }

    try {
      const q = query(
        collection(db, 'chatHistory'),
        where('userId', '==', userId),
        orderBy('timestamp', 'asc'),
        limit(30)
      );
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push(doc.data());
      });
      return list;
    } catch (err) {
      console.error("Firestore loadChatHistory failed:", err);
      const data = localStorage.getItem(`finora_chat_history_${userId}`);
      return data ? JSON.parse(data) : [];
    }
  },

  async clearChatHistory(userId = 'demo_user') {
    if (isOffline()) {
      localStorage.removeItem(`finora_chat_history_${userId}`);
      return [];
    }

    try {
      const q = query(
        collection(db, 'chatHistory'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const deletePromises = [];
      querySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      await Promise.all(deletePromises);
      localStorage.removeItem(`finora_chat_history_${userId}`);
      return [];
    } catch (err) {
      console.error("Firestore clearChatHistory failed:", err);
      throw err;
    }
  },

  // --- Notifications ---
  async getNotifications(userId = 'demo_user') {
    if (isOffline()) {
      const data = localStorage.getItem(`finora_notifications_${userId}`);
      let notifications = data ? JSON.parse(data) : [];
      
      if (notifications.length === 0) {
        notifications = await this.generateDynamicNotifications(userId);
        localStorage.setItem(`finora_notifications_${userId}`, JSON.stringify(notifications));
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
      const data = localStorage.getItem(`finora_notifications_${userId}`);
      return data ? JSON.parse(data) : [];
    }
  },

  async generateDynamicNotifications(userId) {
    const notifications = [];
    
    const expenses = await this.getExpenses(userId);
    const goals = await this.getGoals(userId);
    const budgetData = await this.fetchBudgets(userId);
    
    const categories = ['food', 'shopping', 'travel', 'bills', 'education', 'health', 'entertainment'];
    
    categories.forEach(cat => {
      const budget = budgetData[cat];
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
      localStorage.setItem(`finora_notifications_${userId}`, JSON.stringify(updated));
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
      localStorage.setItem(`finora_notifications_${userId}`, JSON.stringify([]));
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
