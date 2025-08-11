from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, BudgetViewSet, GoalViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet)
router.register(r'budget', BudgetViewSet)
router.register(r'goals', GoalViewSet)

urlpatterns = [
    path('', include(router.urls)),
]