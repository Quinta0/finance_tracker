from django.db import models
from django.contrib.auth.models import User
from datetime import date, timedelta

class Category(models.Model):
    CATEGORY_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=10, choices=CATEGORY_TYPES)
    is_custom = models.BooleanField(default=True)
    color = models.CharField(max_length=7, default='#3b82f6')  # Hex color
    icon = models.CharField(max_length=50, default='tag')  # Icon name
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['type', 'name']
        unique_together = ['name', 'type', 'user']
    
    def __str__(self):
        return f"{self.name} ({self.type})"

class BudgetPeriod(models.Model):
    PERIOD_TYPES = [
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]
    
    name = models.CharField(max_length=100)
    period_type = models.CharField(max_length=20, choices=PERIOD_TYPES, default='monthly')
    start_date = models.DateField()
    end_date = models.DateField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.name} ({self.start_date} - {self.end_date})"

class RecurringTransaction(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]
    
    TRANSACTION_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=200)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    next_occurrence = models.DateField()
    is_active = models.BooleanField(default=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['next_occurrence']
    
    def save(self, *args, **kwargs):
        if not self.next_occurrence:
            self.next_occurrence = self.start_date
        super().save(*args, **kwargs)
    
    def calculate_next_occurrence(self):
        """Calculate the next occurrence date based on frequency"""
        if self.frequency == 'daily':
            return self.next_occurrence + timedelta(days=1)
        elif self.frequency == 'weekly':
            return self.next_occurrence + timedelta(weeks=1)
        elif self.frequency == 'monthly':
            if self.next_occurrence.month == 12:
                return self.next_occurrence.replace(year=self.next_occurrence.year + 1, month=1)
            else:
                return self.next_occurrence.replace(month=self.next_occurrence.month + 1)
        elif self.frequency == 'quarterly':
            month = self.next_occurrence.month + 3
            year = self.next_occurrence.year
            if month > 12:
                month -= 12
                year += 1
            return self.next_occurrence.replace(year=year, month=month)
        elif self.frequency == 'yearly':
            return self.next_occurrence.replace(year=self.next_occurrence.year + 1)
        return self.next_occurrence
    
    def __str__(self):
        return f"{self.name} - {self.frequency} - ${self.amount}"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=200)
    date = models.DateField()
    budget_period = models.ForeignKey(BudgetPeriod, on_delete=models.CASCADE, null=True, blank=True)
    recurring_transaction = models.ForeignKey(RecurringTransaction, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.type.title()}: {self.description} - ${self.amount}"

class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    budget_period = models.ForeignKey(BudgetPeriod, on_delete=models.CASCADE, null=True, blank=True)
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    needs_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    wants_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    savings_goal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'budget_period']
    
    def save(self, *args, **kwargs):
        # Auto-calculate 50/30/20 rule
        if self.monthly_income:
            self.needs_budget = self.monthly_income * 0.50
            self.wants_budget = self.monthly_income * 0.30
            self.savings_goal = self.monthly_income * 0.20
        super().save(*args, **kwargs)
    
    def __str__(self):
        period_name = self.budget_period.name if self.budget_period else "Default"
        return f"Budget ({period_name}) - Income: ${self.monthly_income}"

class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    target_date = models.DateField()
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        # Auto-mark as completed if current amount reaches target
        if self.current_amount >= self.target_amount:
            self.completed = True
        super().save(*args, **kwargs)
    
    @property
    def progress_percentage(self):
        if self.target_amount > 0:
            return min((self.current_amount / self.target_amount) * 100, 100)
        return 0
    
    def __str__(self):
        return f"{self.name} - ${self.current_amount}/${self.target_amount}"