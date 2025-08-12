from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Transaction, Budget, Goal, Category, BudgetPeriod, RecurringTransaction
from .serializers import (TransactionSerializer, BudgetSerializer, GoalSerializer, 
                         CategorySerializer, BudgetPeriodSerializer, RecurringTransactionSerializer)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_queryset(self):
        """Return categories ordered by type and name"""
        return Category.objects.all().order_by('type', 'name')
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get categories grouped by type"""
        income_categories = Category.objects.filter(type='income').order_by('name')
        expense_categories = Category.objects.filter(type='expense').order_by('name')
        
        return Response({
            'income': CategorySerializer(income_categories, many=True).data,
            'expense': CategorySerializer(expense_categories, many=True).data
        })
    
    @action(detail=False, methods=['post'])
    def create_defaults(self, request):
        """Create default categories if they don't exist"""
        default_income_categories = [
            {'name': 'salary', 'color': '#10b981', 'icon': 'briefcase'},
            {'name': 'freelance', 'color': '#3b82f6', 'icon': 'laptop'},
            {'name': 'investment', 'color': '#8b5cf6', 'icon': 'trending-up'},
            {'name': 'bonus', 'color': '#f59e0b', 'icon': 'gift'},
            {'name': 'other', 'color': '#6b7280', 'icon': 'plus-circle'},
        ]
        
        default_expense_categories = [
            {'name': 'food', 'color': '#ef4444', 'icon': 'utensils'},
            {'name': 'transportation', 'color': '#f97316', 'icon': 'car'},
            {'name': 'entertainment', 'color': '#ec4899', 'icon': 'film'},
            {'name': 'shopping', 'color': '#06b6d4', 'icon': 'shopping-bag'},
            {'name': 'bills', 'color': '#84cc16', 'icon': 'file-text'},
            {'name': 'healthcare', 'color': '#14b8a6', 'icon': 'heart'},
            {'name': 'rent', 'color': '#8b5cf6', 'icon': 'home'},
            {'name': 'utilities', 'color': '#f59e0b', 'icon': 'zap'},
            {'name': 'other', 'color': '#6b7280', 'icon': 'more-horizontal'},
        ]
        
        created_count = 0
        
        for cat_data in default_income_categories:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'], 
                type='income',
                defaults={
                    'is_custom': False,
                    'color': cat_data['color'],
                    'icon': cat_data['icon']
                }
            )
            if created:
                created_count += 1
        
        for cat_data in default_expense_categories:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'], 
                type='expense',
                defaults={
                    'is_custom': False,
                    'color': cat_data['color'],
                    'icon': cat_data['icon']
                }
            )
            if created:
                created_count += 1
        
        return Response({
            'message': f'Created {created_count} default categories',
            'created_count': created_count
        })

class BudgetPeriodViewSet(viewsets.ModelViewSet):
    queryset = BudgetPeriod.objects.all()
    serializer_class = BudgetPeriodSerializer
    
    def get_queryset(self):
        return BudgetPeriod.objects.all().order_by('-start_date')
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get the current active budget period"""
        today = timezone.now().date()
        current_period = BudgetPeriod.objects.filter(
            start_date__lte=today,
            end_date__gte=today,
            is_active=True
        ).first()
        
        if not current_period:
            # Create a default monthly period for current month
            start_date = today.replace(day=1)
            if start_date.month == 12:
                end_date = start_date.replace(year=start_date.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                end_date = start_date.replace(month=start_date.month + 1, day=1) - timedelta(days=1)
            
            current_period = BudgetPeriod.objects.create(
                name=f"Monthly Budget - {start_date.strftime('%B %Y')}",
                period_type='monthly',
                start_date=start_date,
                end_date=end_date,
                is_active=True
            )
        
        return Response(BudgetPeriodSerializer(current_period).data)

class RecurringTransactionViewSet(viewsets.ModelViewSet):
    queryset = RecurringTransaction.objects.all()
    serializer_class = RecurringTransactionSerializer
    
    def get_queryset(self):
        return RecurringTransaction.objects.filter(is_active=True).order_by('next_occurrence')
    
    @action(detail=False, methods=['get'])
    def due_transactions(self, request):
        """Get recurring transactions that are due for processing"""
        today = timezone.now().date()
        due_transactions = RecurringTransaction.objects.filter(
            is_active=True,
            next_occurrence__lte=today
        )
        return Response(RecurringTransactionSerializer(due_transactions, many=True).data)
    
    @action(detail=True, methods=['post'])
    def process_occurrence(self, request, pk=None):
        """Process a recurring transaction occurrence and create actual transaction"""
        recurring_transaction = self.get_object()
        
        # Get the current budget period
        today = timezone.now().date()
        current_period = BudgetPeriod.objects.filter(
            start_date__lte=today,
            end_date__gte=today,
            is_active=True
        ).first()
        
        # Create the actual transaction
        transaction = Transaction.objects.create(
            type=recurring_transaction.type,
            category=recurring_transaction.category,
            amount=recurring_transaction.amount,
            description=f"{recurring_transaction.description} (Auto-generated)",
            date=recurring_transaction.next_occurrence,
            budget_period=current_period,
            recurring_transaction=recurring_transaction
        )
        
        # Update next occurrence
        recurring_transaction.next_occurrence = recurring_transaction.calculate_next_occurrence()
        
        # Check if we've passed the end date
        if (recurring_transaction.end_date and 
            recurring_transaction.next_occurrence > recurring_transaction.end_date):
            recurring_transaction.is_active = False
        
        recurring_transaction.save()
        
        return Response({
            'message': 'Recurring transaction processed successfully',
            'transaction': TransactionSerializer(transaction).data,
            'next_occurrence': recurring_transaction.next_occurrence
        })

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    
    def perform_create(self, serializer):
        # Get current budget period if not specified
        if not serializer.validated_data.get('budget_period'):
            today = timezone.now().date()
            current_period = BudgetPeriod.objects.filter(
                start_date__lte=today,
                end_date__gte=today,
                is_active=True
            ).first()
            serializer.save(budget_period=current_period)
        else:
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Get current month's financial summary"""
        now = timezone.now()
        current_month = now.month
        current_year = now.year
        
        monthly_transactions = Transaction.objects.filter(
            date__month=current_month,
            date__year=current_year
        )
        
        monthly_income = monthly_transactions.filter(type='income').aggregate(
            total=Sum('amount'))['total'] or 0
        
        monthly_expenses = monthly_transactions.filter(type='expense').aggregate(
            total=Sum('amount'))['total'] or 0
        
        monthly_savings = monthly_income - monthly_expenses
        
        # Enhanced expense breakdown by category
        expense_breakdown = {}
        expense_transactions = monthly_transactions.filter(type='expense').select_related('category')
        
        for transaction in expense_transactions:
            category_name = transaction.category.name if transaction.category else 'uncategorized'
            if category_name not in expense_breakdown:
                expense_breakdown[category_name] = {
                    'amount': 0,
                    'color': transaction.category.color if transaction.category else '#6b7280',
                    'count': 0
                }
            expense_breakdown[category_name]['amount'] += float(transaction.amount)
            expense_breakdown[category_name]['count'] += 1
        
        return Response({
            'monthly_income': float(monthly_income),
            'monthly_expenses': float(monthly_expenses),
            'monthly_savings': float(monthly_savings),
            'expense_breakdown': expense_breakdown,
            'transaction_count': monthly_transactions.count()
        })
    
    @action(detail=False, methods=['get'])
    def six_month_trend(self, request):
        """Get 6-month savings trend data"""
        trends = []
        
        for i in range(5, -1, -1):  # Last 6 months
            date = timezone.now() - timedelta(days=30*i)
            month = date.strftime('%b')
            year = date.year
            month_num = date.month
            
            month_transactions = Transaction.objects.filter(
                date__month=month_num,
                date__year=year
            )
            
            income = month_transactions.filter(type='income').aggregate(
                total=Sum('amount'))['total'] or 0
            expenses = month_transactions.filter(type='expense').aggregate(
                total=Sum('amount'))['total'] or 0
            
            trends.append({
                'month': month,
                'income': float(income),
                'expenses': float(expenses),
                'savings': float(income - expenses)
            })
        
        return Response(trends)

class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    
    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Get current month's financial summary"""
        now = timezone.now()
        current_month = now.month
        current_year = now.year
        
        monthly_transactions = Transaction.objects.filter(
            date__month=current_month,
            date__year=current_year
        )
        
        monthly_income = monthly_transactions.filter(type='income').aggregate(
            total=Sum('amount'))['total'] or 0
        
        monthly_expenses = monthly_transactions.filter(type='expense').aggregate(
            total=Sum('amount'))['total'] or 0
        
        monthly_savings = monthly_income - monthly_expenses
        
        # Expense breakdown
        expense_breakdown = {}
        expense_categories = ['food', 'transportation', 'entertainment', 'shopping', 'bills', 'healthcare', 'other']
        
        for category in expense_categories:
            amount = monthly_transactions.filter(
                type='expense', 
                category=category
            ).aggregate(total=Sum('amount'))['total'] or 0
            if amount > 0:
                expense_breakdown[category] = float(amount)
        
        return Response({
            'monthly_income': float(monthly_income),
            'monthly_expenses': float(monthly_expenses),
            'monthly_savings': float(monthly_savings),
            'expense_breakdown': expense_breakdown,
            'transaction_count': monthly_transactions.count()
        })
    
    @action(detail=False, methods=['get'])
    def six_month_trend(self, request):
        """Get 6-month savings trend data"""
        trends = []
        
        for i in range(5, -1, -1):  # Last 6 months
            date = timezone.now() - timedelta(days=30*i)
            month = date.strftime('%b')
            year = date.year
            month_num = date.month
            
            month_transactions = Transaction.objects.filter(
                date__month=month_num,
                date__year=year
            )
            
            income = month_transactions.filter(type='income').aggregate(
                total=Sum('amount'))['total'] or 0
            expenses = month_transactions.filter(type='expense').aggregate(
                total=Sum('amount'))['total'] or 0
            
            trends.append({
                'month': month,
                'income': float(income),
                'expenses': float(expenses),
                'savings': float(income - expenses)
            })
        
        return Response(trends)

class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    
    def get_queryset(self):
        return Budget.objects.all().order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def current_budget(self, request):
        """Get or create current budget for active period"""
        # Get current budget period
        today = timezone.now().date()
        current_period = BudgetPeriod.objects.filter(
            start_date__lte=today,
            end_date__gte=today,
            is_active=True
        ).first()
        
        if not current_period:
            # Create default monthly period
            start_date = today.replace(day=1)
            if start_date.month == 12:
                end_date = start_date.replace(year=start_date.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                end_date = start_date.replace(month=start_date.month + 1, day=1) - timedelta(days=1)
            
            current_period = BudgetPeriod.objects.create(
                name=f"Monthly Budget - {start_date.strftime('%B %Y')}",
                period_type='monthly',
                start_date=start_date,
                end_date=end_date,
                is_active=True
            )
        
        budget, created = Budget.objects.get_or_create(
            budget_period=current_period,
            defaults={'monthly_income': 5000}
        )
        
        return Response(BudgetSerializer(budget).data)
    
    @action(detail=False, methods=['post'])
    def update_income(self, request):
        """Update monthly income for current budget period"""
        monthly_income = request.data.get('monthly_income', 0)
        period_id = request.data.get('period_id')
        
        if period_id:
            budget_period = BudgetPeriod.objects.get(id=period_id)
        else:
            # Get current budget period
            today = timezone.now().date()
            budget_period = BudgetPeriod.objects.filter(
                start_date__lte=today,
                end_date__gte=today,
                is_active=True
            ).first()
        
        budget, created = Budget.objects.get_or_create(
            budget_period=budget_period,
            defaults={'monthly_income': monthly_income}
        )
        
        if not created:
            budget.monthly_income = monthly_income
            budget.save()  # This triggers the auto-calculation
        
        return Response(BudgetSerializer(budget).data)
    
    @action(detail=False, methods=['get'])
    def budget_analysis(self, request):
        """Analyze current spending vs budget for active period"""
        period_id = request.query_params.get('period_id')
        
        if period_id:
            budget_period = BudgetPeriod.objects.get(id=period_id)
            budget = Budget.objects.filter(budget_period=budget_period).first()
        else:
            # Get current budget period
            today = timezone.now().date()
            budget_period = BudgetPeriod.objects.filter(
                start_date__lte=today,
                end_date__gte=today,
                is_active=True
            ).first()
            budget = Budget.objects.filter(budget_period=budget_period).first()
        
        if not budget:
            return Response({'error': 'No budget found for this period'}, status=404)
        
        # Get transactions for the budget period
        period_transactions = Transaction.objects.filter(
            budget_period=budget_period
        ) if budget_period else Transaction.objects.filter(
            date__month=timezone.now().month,
            date__year=timezone.now().year
        )
        
        # Calculate actual spending (dynamic categorization based on actual categories)
        needs_categories = Category.objects.filter(
            type='expense',
            name__in=['food', 'bills', 'healthcare', 'transportation', 'rent', 'utilities']
        )
        wants_categories = Category.objects.filter(
            type='expense'
        ).exclude(id__in=needs_categories.values_list('id', flat=True))
        
        needs_spent = period_transactions.filter(
            type='expense',
            category__in=needs_categories
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        wants_spent = period_transactions.filter(
            type='expense',
            category__in=wants_categories
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        period_income = period_transactions.filter(type='income').aggregate(
            total=Sum('amount'))['total'] or 0
        
        actual_savings = period_income - needs_spent - wants_spent
        
        return Response({
            'budget': BudgetSerializer(budget).data,
            'period': BudgetPeriodSerializer(budget_period).data if budget_period else None,
            'actual_spending': {
                'needs': float(needs_spent),
                'wants': float(wants_spent),
                'savings': float(actual_savings)
            },
            'budget_status': {
                'needs_on_track': needs_spent <= budget.needs_budget,
                'wants_on_track': wants_spent <= budget.wants_budget,
                'savings_on_track': actual_savings >= budget.savings_goal
            }
        })


class GoalViewSet(viewsets.ModelViewSet):
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer
    
    def perform_create(self, serializer):
        """Set user when creating a goal"""
        serializer.save(user=None)  # No auth for now
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Update the current amount for a goal"""
        goal = self.get_object()
        amount = request.data.get('amount', 0)
        
        try:
            goal.current_amount = float(amount)
            goal.save()
            return Response(GoalSerializer(goal).data)
        except ValueError:
            return Response(
                {'error': 'Invalid amount'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def active_goals(self, request):
        """Get all active (not completed) goals"""
        active_goals = Goal.objects.filter(completed=False)
        return Response(GoalSerializer(active_goals, many=True).data)
    
    @action(detail=False, methods=['get'])
    def completed_goals(self, request):
        """Get all completed goals"""
        completed_goals = Goal.objects.filter(completed=True)
        return Response(GoalSerializer(completed_goals, many=True).data)

