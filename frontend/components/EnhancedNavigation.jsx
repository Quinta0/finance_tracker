"use client"
import React from 'react';
import { 
  Activity, 
  DollarSign, 
  BarChart3, 
  Target, 
  PiggyBank, 
  Settings, 
  Calendar,
  Repeat,
  Tag,
  Calculator
} from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EnhancedNavigation = ({ activeTab, setActiveTab, connectionStatus, transactionCount }) => {
  const mainTabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Activity, description: 'Financial overview and insights' },
    { id: 'transactions', name: 'Transactions', icon: DollarSign, description: 'Manage income and expenses' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, description: 'Smart insights and reports' },
    { id: 'goals', name: 'Goals', icon: Target, description: 'Track savings goals' },
    { id: 'budget', name: 'Budget', icon: PiggyBank, description: '50/30/20 rule budgeting' },
  ];

  const managementTabs = [
    { id: 'categories', name: 'Categories', icon: Tag, description: 'Manage custom categories' },
    { id: 'periods', name: 'Budget Periods', icon: Calendar, description: 'Multiple budget periods' },
    { id: 'recurring', name: 'Recurring', icon: Repeat, description: 'Automated transactions' },
  ];

  const ListItem = React.forwardRef(({ className, title, children, onClick, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            onClick={onClick}
            style={{
              cursor: 'pointer',
              backgroundColor: 'transparent',
              borderRadius: '8px',
              padding: '12px',
              display: 'block',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3a3a3a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            {...props}
          >
            <div className="text-sm font-medium leading-none" style={{ color: '#e5e7eb', fontSize: '14px', fontWeight: '500' }}>{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground" style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  });
  ListItem.displayName = "ListItem";

  return (
    <div style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #2a2a2a' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Calculator style={{ width: '28px', height: '28px', color: '#3b82f6', marginRight: '12px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#e5e7eb' }}>
              Personal Finance Tracker
            </h1>
          </div>

          {/* Connection Status */}
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {connectionStatus === 'loading' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  border: '2px solid #3b82f6', 
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Connecting to Django API...
              </span>
            ) : (
              `Connected to Django API • ${transactionCount} transactions`
            )}
          </div>
        </div>

        {/* Navigation */}
        <NavigationMenu style={{ margin: 0, padding: 0 }}>
          <NavigationMenuList style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 0 16px 0' }}>
            {/* Main Navigation Items */}
            {mainTabs.map((tab) => (
              <NavigationMenuItem key={tab.id}>
                <Button
                  variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    color: activeTab === tab.id ? '#e5e7eb' : '#9ca3af',
                    backgroundColor: activeTab === tab.id ? '#3b82f6' : 'transparent',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = '#2a2a2a';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <tab.icon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  {tab.name}
                  {activeTab === tab.id && (
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: '-1px',
                        left: '0',
                        right: '0',
                        height: '2px',
                        background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                      }}
                    />
                  )}
                </Button>
              </NavigationMenuItem>
            ))}

            {/* Management Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger 
                style={{
                  backgroundColor: 'transparent',
                  color: '#9ca3af',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  border: 'none',
                  transition: 'all 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2a2a2a';
                  e.currentTarget.style.color = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                <Settings style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Management
              </NavigationMenuTrigger>
              <NavigationMenuContent style={{
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: '8px',
                padding: '16px',
                minWidth: '300px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
              }}>
                <ul style={{ display: 'grid', gap: '3px', padding: 0, margin: 0, listStyle: 'none' }}>
                  {managementTabs.map((tab) => (
                    <ListItem
                      key={tab.id}
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <tab.icon style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                          {tab.name}
                        </div>
                      }
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};

export default EnhancedNavigation;
