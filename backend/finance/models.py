from django.db import models
from django.contrib.auth.models import User

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    
    INCOME_CATEGORIES = [
        ('salary', 'Salary'),
        ('freelance', 'Freelance'),
        ('investment', 'Investment'),
        ('bonus', 'Bonus'),
        ('other', 'Other'),
    ]
    
    EXPENSE_CATEGORIES = [
        ('food', 'Food'),
        ('transportation', 'Transportation'),
        ('entertainment', 'Entertainment'),
        ('shopping', 'Shopping'),
        ('bills', 'Bills'),
        ('healthcare', 'Healthcare'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    category = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=200)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.type.title()}: {self.description} - ${self.amount}"

class Budget(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    needs_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    wants_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    savings_goal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # Auto-calculate 50/30/20 rule
        if self.monthly_income:
            self.needs_budget = self.monthly_income * 0.50
            self.wants_budget = self.monthly_income * 0.30
            self.savings_goal = self.monthly_income * 0.20
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Budget - Income: ${self.monthly_income}"