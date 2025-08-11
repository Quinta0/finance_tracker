from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Transaction, Budget, Goal
from .serializers import TransactionSerializer, BudgetSerializer, GoalSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    
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
    
    @action(detail=False, methods=['get'])
    def current_budget(self, request):
        """Get or create current budget"""
        budget, created = Budget.objects.get_or_create(
            id=1,  # Single budget for now
            defaults={'monthly_income': 5000}
        )
        return Response(BudgetSerializer(budget).data)
    
    @action(detail=False, methods=['post'])
    def update_income(self, request):
        """Update monthly income and recalculate budget"""
        monthly_income = request.data.get('monthly_income', 0)
        
        budget, created = Budget.objects.get_or_create(id=1)
        budget.monthly_income = monthly_income
        budget.save()  # This triggers the auto-calculation
        
        return Response(BudgetSerializer(budget).data)
    
    @action(detail=False, methods=['get'])
    def budget_analysis(self, request):
        """Analyze current spending vs budget"""
        budget = Budget.objects.filter(id=1).first()
        if not budget:
            return Response({'error': 'No budget found'}, status=404)
        
        # Get current month transactions
        now = timezone.now()
        monthly_transactions = Transaction.objects.filter(
            date__month=now.month,
            date__year=now.year
        )
        
        # Calculate actual spending
        needs_categories = ['food', 'bills', 'healthcare', 'transportation']
        wants_categories = ['entertainment', 'shopping', 'other']
        
        needs_spent = monthly_transactions.filter(
            type='expense',
            category__in=needs_categories
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        wants_spent = monthly_transactions.filter(
            type='expense',
            category__in=wants_categories
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        monthly_income = monthly_transactions.filter(type='income').aggregate(
            total=Sum('amount'))['total'] or 0
        
        actual_savings = monthly_income - needs_spent - wants_spent
        
        return Response({
            'budget': BudgetSerializer(budget).data,
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

