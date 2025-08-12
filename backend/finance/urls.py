from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (TransactionViewSet, BudgetViewSet, GoalViewSet, 
                   CategoryViewSet, BudgetPeriodViewSet, RecurringTransactionViewSet)

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet)
router.register(r'budget', BudgetViewSet)
router.register(r'goals', GoalViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'budget-periods', BudgetPeriodViewSet)
router.register(r'recurring-transactions', RecurringTransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]