from rest_framework import serializers
from .models import Transaction, Budget

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'type', 'category', 'amount', 'description', 'date', 'created_at']
        read_only_fields = ['id', 'created_at']

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ['id', 'monthly_income', 'needs_budget', 'wants_budget', 'savings_goal', 'updated_at']
        read_only_fields = ['id', 'needs_budget', 'wants_budget', 'savings_goal', 'updated_at']
