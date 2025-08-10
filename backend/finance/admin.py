from django.contrib import admin
from .models import Transaction, Budget

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['description', 'type', 'category', 'amount', 'date']
    list_filter = ['type', 'category', 'date']
    search_fields = ['description']
    ordering = ['-date']

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ['monthly_income', 'needs_budget', 'wants_budget', 'savings_goal']