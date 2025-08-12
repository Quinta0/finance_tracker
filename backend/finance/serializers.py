from rest_framework import serializers
from .models import Transaction, Budget, Goal, Category, BudgetPeriod, RecurringTransaction

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'is_custom', 'color', 'icon', 'created_at']
        read_only_fields = ['id', 'created_at']

class BudgetPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetPeriod
        fields = ['id', 'name', 'period_type', 'start_date', 'end_date', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

class RecurringTransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    
    class Meta:
        model = RecurringTransaction
        fields = ['id', 'name', 'type', 'category', 'category_name', 'category_color', 'amount', 
                 'description', 'frequency', 'start_date', 'end_date', 'next_occurrence', 
                 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    budget_period_name = serializers.CharField(source='budget_period.name', read_only=True)
    recurring_transaction_name = serializers.CharField(source='recurring_transaction.name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'type', 'category', 'category_name', 'category_color', 'amount', 'description', 
                 'date', 'budget_period', 'budget_period_name', 'recurring_transaction', 
                 'recurring_transaction_name', 'created_at']
        read_only_fields = ['id', 'created_at']

class BudgetSerializer(serializers.ModelSerializer):
    budget_period_name = serializers.CharField(source='budget_period.name', read_only=True)
    
    class Meta:
        model = Budget
        fields = ['id', 'budget_period', 'budget_period_name', 'monthly_income', 'needs_budget', 
                 'wants_budget', 'savings_goal', 'updated_at']
        read_only_fields = ['id', 'needs_budget', 'wants_budget', 'savings_goal', 'updated_at']

class GoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Goal
        fields = ['id', 'name', 'description', 'target_amount', 'current_amount', 'target_date', 
                 'completed', 'progress_percentage', 'created_at', 'updated_at']
        read_only_fields = ['id', 'completed', 'progress_percentage', 'created_at', 'updated_at']
