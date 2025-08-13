// Budget Templates Configuration
export const BUDGET_TEMPLATES = {
  'classic-50-30-20': {
    id: 'classic-50-30-20',
    name: '50/30/20 Rule (Classic)',
    description: 'The traditional approach: 50% needs, 30% wants, 20% savings',
    icon: '📊',
    allocations: {
      needs: 50,
      wants: 30,
      savings: 20
    },
    categories: {
      needs: ['Rent/Mortgage', 'Groceries', 'Utilities', 'Healthcare', 'Transportation', 'Insurance', 'Minimum Debt Payments'],
      wants: ['Entertainment', 'Dining Out', 'Shopping', 'Hobbies', 'Subscriptions', 'Travel'],
      savings: ['Emergency Fund', 'Retirement', 'Investments', 'Goals']
    },
    recommendedFor: 'General purpose budgeting for most income levels'
  },
  
  'student-budget': {
    id: 'student-budget',
    name: 'Student Budget',
    description: 'Optimized for students with limited income and education expenses',
    icon: '🎓',
    allocations: {
      needs: 65,
      wants: 15,
      savings: 20
    },
    categories: {
      needs: ['Tuition/Books', 'Rent/Dorm', 'Groceries', 'Transportation', 'Phone', 'Healthcare'],
      wants: ['Entertainment', 'Dining Out', 'Social Activities'],
      savings: ['Emergency Fund', 'Future Goals', 'Post-Graduation Fund']
    },
    recommendedFor: 'Students with part-time income or financial aid'
  },
  
  'aggressive-saver': {
    id: 'aggressive-saver',
    name: 'Aggressive Saver',
    description: 'Maximize savings and investments for early retirement',
    icon: '💰',
    allocations: {
      needs: 40,
      wants: 20,
      savings: 40
    },
    categories: {
      needs: ['Rent/Mortgage', 'Groceries', 'Utilities', 'Transportation', 'Insurance'],
      wants: ['Minimal Entertainment', 'Basic Dining Out'],
      savings: ['Emergency Fund', 'Investments', 'Retirement', 'Real Estate', 'Side Business']
    },
    recommendedFor: 'High earners focused on FIRE (Financial Independence, Retire Early)'
  },
  
  'family-budget': {
    id: 'family-budget',
    name: 'Family Budget',
    description: 'Balanced approach for families with children',
    icon: '👨‍👩‍👧‍👦',
    allocations: {
      needs: 55,
      wants: 25,
      savings: 20
    },
    categories: {
      needs: ['Mortgage/Rent', 'Groceries', 'Utilities', 'Childcare', 'Healthcare', 'Transportation', 'Insurance'],
      wants: ['Family Entertainment', 'Children Activities', 'Dining Out', 'Family Vacations'],
      savings: ['Emergency Fund', 'Children Education', 'Retirement', 'Family Goals']
    },
    recommendedFor: 'Families with children and higher essential expenses'
  },
  
  'debt-payoff': {
    id: 'debt-payoff',
    name: 'Debt Payoff Focus',
    description: 'Aggressive debt elimination strategy',
    icon: '💳',
    allocations: {
      needs: 50,
      wants: 10,
      savings: 40 // Will be allocated to debt payoff
    },
    categories: {
      needs: ['Rent/Mortgage', 'Groceries', 'Utilities', 'Transportation', 'Minimum Payments'],
      wants: ['Basic Entertainment', 'Essential Personal'],
      savings: ['Debt Payoff', 'Small Emergency Fund', 'Future Savings']
    },
    recommendedFor: 'People with significant debt looking to pay it off quickly'
  },
  
  'young-professional': {
    id: 'young-professional',
    name: 'Young Professional',
    description: 'Balance career building, lifestyle, and future planning',
    icon: '💼',
    allocations: {
      needs: 45,
      wants: 35,
      savings: 20
    },
    categories: {
      needs: ['Rent', 'Groceries', 'Utilities', 'Transportation', 'Professional Development'],
      wants: ['Entertainment', 'Dining Out', 'Fashion', 'Technology', 'Social Activities', 'Travel'],
      savings: ['Emergency Fund', 'Career Development', 'Investments', 'Future Goals']
    },
    recommendedFor: 'Young professionals in early career phase'
  },
  
  'retirement-focused': {
    id: 'retirement-focused',
    name: 'Retirement Focused',
    description: 'Catch-up strategy for those closer to retirement',
    icon: '🏖️',
    allocations: {
      needs: 45,
      wants: 20,
      savings: 35
    },
    categories: {
      needs: ['Mortgage/Rent', 'Groceries', 'Utilities', 'Healthcare', 'Insurance'],
      wants: ['Hobbies', 'Travel', 'Entertainment'],
      savings: ['Retirement Catch-up', 'Health Savings', 'Emergency Fund', 'Legacy Planning']
    },
    recommendedFor: 'People 50+ focusing on retirement preparation'
  },
  
  'entrepreneur': {
    id: 'entrepreneur',
    name: 'Entrepreneur/Freelancer',
    description: 'Variable income with business expenses and tax planning',
    icon: '🚀',
    allocations: {
      needs: 45,
      wants: 20,
      savings: 35
    },
    categories: {
      needs: ['Business Expenses', 'Rent/Mortgage', 'Groceries', 'Healthcare', 'Transportation'],
      wants: ['Entertainment', 'Personal Development', 'Networking'],
      savings: ['Tax Reserve', 'Emergency Fund', 'Business Investment', 'Retirement']
    },
    recommendedFor: 'Self-employed individuals and business owners'
  },
  
  'minimalist': {
    id: 'minimalist',
    name: 'Minimalist Budget',
    description: 'Simple living with focus on experiences over things',
    icon: '🌱',
    allocations: {
      needs: 40,
      wants: 30,
      savings: 30
    },
    categories: {
      needs: ['Rent', 'Groceries', 'Utilities', 'Transportation', 'Healthcare'],
      wants: ['Experiences', 'Travel', 'Learning', 'Quality Items'],
      savings: ['Freedom Fund', 'Experience Fund', 'Emergency Fund', 'Investments']
    },
    recommendedFor: 'Those pursuing minimalist lifestyle and financial freedom'
  }
};

// Helper functions
export const getTemplateById = (id) => BUDGET_TEMPLATES[id];

export const getAllTemplates = () => Object.values(BUDGET_TEMPLATES);

export const getTemplatesByCategory = () => ({
  beginner: ['classic-50-30-20', 'student-budget', 'young-professional'],
  advanced: ['aggressive-saver', 'debt-payoff', 'minimalist'],
  family: ['family-budget', 'retirement-focused'],
  specialized: ['entrepreneur']
});

export const calculateTemplateAmounts = (template, monthlyIncome) => {
  const income = parseFloat(monthlyIncome) || 0;
  return {
    needs: (income * template.allocations.needs) / 100,
    wants: (income * template.allocations.wants) / 100,
    savings: (income * template.allocations.savings) / 100
  };
};
