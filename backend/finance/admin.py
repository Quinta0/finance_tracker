from django.contrib import admin
from .models import Transaction, Budget, Goal

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['description', 'type', 'category', 'amount', 'date']
    list_filter = ['type', 'category', 'date']
    search_fields = ['description']
    ordering = ['-date']

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ['monthly_income', 'needs_budget', 'wants_budget', 'savings_goal']

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['name', 'target_amount', 'current_amount', 'target_date', 'completed']
    list_filter = ['completed', 'target_date']
    search_fields = ['name', 'description']
    ordering = ['-created_at']