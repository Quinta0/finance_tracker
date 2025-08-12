"use client"
import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import apiService from '../lib/api';

const FinancialGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    current_amount: '',
    target_date: ''
  });

  // Load goals on component mount
  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const goalsData = await apiService.getGoals();
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.target_amount || !formData.target_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const goalData = {
        ...formData,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount) || 0
      };

      if (editingGoal) {
        await apiService.updateGoal(editingGoal.id, goalData);
        toast.success('Goal updated successfully!');
      } else {
        await apiService.createGoal(goalData);
        toast.success('Goal created successfully!');
      }

      await loadGoals();
      resetForm();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('Failed to save goal');
    }
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      await apiService.deleteGoal(goalId);
      toast.success('Goal deleted successfully');
      await loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const handleUpdateProgress = async (goalId, amount) => {
    try {
      await apiService.updateGoalProgress(goalId, amount);
      toast.success('Progress updated!');
      await loadGoals();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      target_amount: '',
      current_amount: '',
      target_date: ''
    });
    setShowAddForm(false);
    setEditingGoal(null);
  };

  const startEdit = (goal) => {
    setFormData({
      name: goal.name,
      description: goal.description || '',
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      target_date: goal.target_date
    });
    setEditingGoal(goal);
    setShowAddForm(true);
  };

  const getGoalStatus = (goal) => {
    const progress = goal.progress_percentage || 0;
    const daysToTarget = Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (goal.completed) return { status: 'completed', color: '#10b981', icon: CheckCircle2 };
    if (progress >= 75) return { status: 'on-track', color: '#10b981', icon: TrendingUp };
    if (daysToTarget < 30 && progress < 50) return { status: 'at-risk', color: '#ef4444', icon: AlertTriangle };
    if (progress >= 25) return { status: 'in-progress', color: '#f59e0b', icon: Clock };
    return { status: 'just-started', color: '#737373', icon: Star };
  };

  const styles = {
    header: {
      marginBottom: '32px',
    },
    title: {
      fontSize: '32px',
      fontWeight: '300',
      color: '#f5f5f5',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#737373',
    },
    card: {
      backgroundColor: '#171717',
      border: '1px solid #262626',
      borderRadius: '16px',
      padding: '24px',
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#10b981',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background-color 0.2s ease',
    },
    input: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#262626',
      border: '1px solid #404040',
      borderRadius: '8px',
      color: '#f5f5f5',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    goalCard: {
      backgroundColor: '#171717',
      border: '1px solid #262626',
      borderRadius: '16px',
      padding: '24px',
      transition: 'all 0.2s ease',
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#262626',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#10b981',
      borderRadius: '4px',
      transition: 'width 0.3s ease',
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #262626',
          borderTop: '3px solid #10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#737373', fontSize: '14px' }}>Loading your goals...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
          <div>
            <h1 style={styles.title}>Financial Goals</h1>
            <p style={styles.subtitle}>Track your progress towards financial freedom</p>
          </div>
          
          <button 
            onClick={() => setShowAddForm(true)}
            style={styles.button}
          >
            <Plus style={{ width: 16, height: 16 }} />
            Add Goal
          </button>
        </div>
      </div>

      {/* Add/Edit Goal Form */}
      {showAddForm && (
        <div style={{ ...styles.card, marginBottom: '32px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '500', 
            color: '#e5e5e5', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Target style={{ width: 20, height: 20, color: '#10b981' }} />
            {editingGoal ? 'Edit Goal' : 'Add New Goal'}
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  color: '#e5e5e5',
                  fontWeight: '500'
                }}>
                  Goal Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Emergency Fund"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  color: '#e5e5e5',
                  fontWeight: '500'
                }}>
                  Target Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="10000"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  color: '#e5e5e5',
                  fontWeight: '500'
                }}>
                  Current Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.current_amount}
                  onChange={(e) => setFormData({...formData, current_amount: e.target.value})}
                  style={styles.input}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  color: '#e5e5e5',
                  fontWeight: '500'
                }}>
                  Target Date *
                </label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                color: '#e5e5e5',
                fontWeight: '500'
              }}>
                Description (Optional)
              </label>
              <textarea
                placeholder="Describe your goal..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                style={{
                  ...styles.input,
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                type="button"
                onClick={resetForm}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: '#737373',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button type="submit" style={styles.button}>
                <CheckCircle2 style={{ width: 16, height: 16 }} />
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals Summary */}
      {goals.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: '#171717',
            border: '1px solid #262626',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <Target style={{ width: 20, height: 20, color: '#10b981' }} />
            </div>
            <p style={{ fontSize: '24px', fontWeight: '300', color: '#f5f5f5', marginBottom: '4px' }}>
              {goals.length}
            </p>
            <p style={{ fontSize: '12px', color: '#737373' }}>Total Goals</p>
          </div>
          
          <div style={{
            backgroundColor: '#171717',
            border: '1px solid #262626',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <CheckCircle2 style={{ width: 20, height: 20, color: '#10b981' }} />
            </div>
            <p style={{ fontSize: '24px', fontWeight: '300', color: '#f5f5f5', marginBottom: '4px' }}>
              {goals.filter(g => g.completed).length}
            </p>
            <p style={{ fontSize: '12px', color: '#737373' }}>Completed</p>
          </div>
          
          <div style={{
            backgroundColor: '#171717',
            border: '1px solid #262626',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <TrendingUp style={{ width: 20, height: 20, color: '#f59e0b' }} />
            </div>
            <p style={{ fontSize: '24px', fontWeight: '300', color: '#f5f5f5', marginBottom: '4px' }}>
              {goals.filter(g => !g.completed && g.progress_percentage > 0).length}
            </p>
            <p style={{ fontSize: '12px', color: '#737373' }}>In Progress</p>
          </div>
          
          <div style={{
            backgroundColor: '#171717',
            border: '1px solid #262626',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <DollarSign style={{ width: 20, height: 20, color: '#3b82f6' }} />
            </div>
            <p style={{ fontSize: '24px', fontWeight: '300', color: '#f5f5f5', marginBottom: '4px' }}>
              ${goals.reduce((sum, g) => sum + parseFloat(g.target_amount || 0), 0).toLocaleString()}
            </p>
            <p style={{ fontSize: '12px', color: '#737373' }}>Total Target</p>
          </div>
        </div>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <div style={styles.card}>
          <div style={{ 
            textAlign: 'center', 
            padding: '48px 24px',
            color: '#737373'
          }}>
            <Target style={{ width: 64, height: 64, margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#e5e5e5', marginBottom: '8px' }}>
              No goals yet
            </h3>
            <p style={{ fontSize: '14px', marginBottom: '24px' }}>
              Start your financial journey by setting your first goal.
            </p>
            <button 
              onClick={() => setShowAddForm(true)}
              style={styles.button}
            >
              <Plus style={{ width: 16, height: 16 }} />
              Create Your First Goal
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {goals.map((goal) => {
            const status = getGoalStatus(goal);
            const StatusIcon = status.icon;
            const daysToTarget = Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24));
            
            return (
              <div 
                key={goal.id} 
                style={{
                  ...styles.goalCard,
                  borderColor: goal.completed ? 'rgba(16, 185, 129, 0.3)' : '#262626'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#e5e5e5' }}>
                        {goal.name}
                      </h3>
                      <div style={{
                        padding: '4px 8px',
                        backgroundColor: `${status.color}20`,
                        color: status.color,
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <StatusIcon style={{ width: 12, height: 12 }} />
                        {status.status.replace('-', ' ')}
                      </div>
                    </div>
                    {goal.description && (
                      <p style={{ fontSize: '14px', color: '#737373', marginBottom: '12px' }}>
                        {goal.description}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => startEdit(goal)}
                      style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#737373',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(115, 115, 115, 0.2)';
                        e.currentTarget.style.color = '#e5e5e5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#737373';
                      }}
                    >
                      <Edit style={{ width: 16, height: 16 }} />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#737373',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#737373';
                      }}
                    >
                      <Trash2 style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#e5e5e5' }}>
                      ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '14px', color: status.color, fontWeight: '500' }}>
                      {Math.round(goal.progress_percentage || 0)}%
                    </span>
                  </div>
                  <div style={styles.progressBar}>
                    <div 
                      style={{
                        ...styles.progressFill,
                        width: `${Math.min(goal.progress_percentage || 0, 100)}%`,
                        backgroundColor: status.color
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar style={{ width: 14, height: 14, color: '#737373' }} />
                      <span style={{ fontSize: '12px', color: '#737373' }}>
                        {new Date(goal.target_date).toLocaleDateString()}
                      </span>
                    </div>
                    {!goal.completed && (
                      <span style={{ 
                        fontSize: '12px', 
                        color: daysToTarget < 30 ? '#ef4444' : '#737373'
                      }}>
                        {daysToTarget > 0 ? `${daysToTarget} days left` : 'Overdue'}
                      </span>
                    )}
                  </div>

                  {!goal.completed && (
                    <button
                      onClick={() => {
                        const amount = prompt('Enter amount to add to this goal:');
                        if (amount && !isNaN(amount)) {
                          handleUpdateProgress(goal.id, parseFloat(amount));
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Plus style={{ width: 12, height: 12 }} />
                      Add Progress
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FinancialGoals;
