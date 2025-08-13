"use client"
import React, { useState } from 'react';
import { 
  Repeat, 
  PieChart, 
  FileText, 
  Palette, 
  ArrowRight, 
  Check, 
  Calendar,
  Download,
  Settings,
  Target,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const FeatureShowcase = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      id: 'recurring',
      title: 'Recurring Transactions',
      subtitle: 'Never miss a payment again',
      icon: <Repeat className="w-8 h-8" />,
      description: 'Set up automatic recurring transactions for bills, salaries, and subscriptions. Get notifications when they\'re due and process them with one click.',
      benefits: [
        'Automatic bill reminders',
        'One-click transaction processing',
        'Flexible frequency options (daily, weekly, monthly, quarterly, yearly)',
        'Track payment history',
        'Pause/resume functionality'
      ],
      status: 'active',
      gradient: 'from-blue-500 to-blue-700'
    },
    {
      id: 'categories',
      title: 'Custom Categories',
      subtitle: 'Organize your way',
      icon: <Palette className="w-8 h-8" />,
      description: 'Create custom income and expense categories with personalized colors and icons. Better categorization leads to better insights.',
      benefits: [
        'Unlimited custom categories',
        'Color-coded organization',
        'Icon customization',
        'Separate income/expense categories',
        'Default category templates'
      ],
      status: 'active',
      gradient: 'from-purple-500 to-purple-700'
    },
    {
      id: 'reports',
      title: 'Advanced PDF Reports',
      subtitle: 'Professional financial reporting',
      icon: <FileText className="w-8 h-8" />,
      description: 'Generate comprehensive PDF reports with charts, tables, and detailed analytics. Perfect for sharing with advisors or personal record-keeping.',
      benefits: [
        'Professional PDF generation',
        'Comprehensive financial summaries',
        'Transaction breakdowns',
        'Budget analysis reports',
        'Multiple time period options'
      ],
      status: 'new',
      gradient: 'from-red-500 to-red-700'
    },
    {
      id: 'templates',
      title: 'Budget Templates',
      subtitle: 'Start smart, customize later',
      icon: <Target className="w-8 h-8" />,
      description: 'Choose from professionally designed budget templates tailored to different life situations. From students to families to aggressive savers.',
      benefits: [
        '9 pre-designed templates',
        'Life-stage specific allocations',
        'One-click template application',
        'Customizable after application',
        'Expert-recommended ratios'
      ],
      status: 'new',
      gradient: 'from-green-500 to-green-700'
    }
  ];

  const advancedFeatures = [
    {
      title: 'Smart Analytics',
      description: 'Interactive charts and spending insights',
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: 'Goal Tracking',
      description: 'Set and monitor financial goals',
      icon: <Target className="w-6 h-6" />
    },
    {
      title: 'Budget Periods',
      description: 'Flexible monthly, quarterly, yearly budgets',
      icon: <Calendar className="w-6 h-6" />
    },
    {
      title: 'Data Export',
      description: 'CSV and PDF export capabilities',
      icon: <Download className="w-6 h-6" />
    }
  ];

  return (
    <div style={{ 
      padding: '32px', 
      backgroundColor: '#0a0a0a', 
      borderRadius: '16px',
      margin: '24px 0'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#1a1a1a',
          padding: '8px 16px',
          borderRadius: '20px',
          marginBottom: '16px'
        }}>
          <Sparkles style={{ width: '16px', height: '16px', color: '#10b981' }} />
          <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
            NEW FEATURES
          </span>
        </div>
        
        <h2 style={{
          fontSize: '36px',
          fontWeight: '300',
          color: '#ffffff',
          marginBottom: '16px',
          lineHeight: '1.2'
        }}>
          Complete Financial Management
        </h2>
        
        <p style={{
          fontSize: '18px',
          color: '#9ca3af',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Everything you need to take control of your finances, from recurring transactions 
          to advanced reporting and smart budget templates.
        </p>
      </div>

      {/* Feature Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '48px'
      }}>
        {features.map((feature, index) => (
          <div
            key={feature.id}
            onClick={() => setActiveFeature(index)}
            style={{
              background: activeFeature === index 
                ? `linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)`
                : '#1a1a1a',
              border: `2px solid ${activeFeature === index ? 'transparent' : '#262626'}`,
              borderRadius: '16px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              transform: activeFeature === index ? 'translateY(-4px)' : 'translateY(0)',
              boxShadow: activeFeature === index 
                ? '0 20px 40px rgba(0, 0, 0, 0.3)' 
                : '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Status Badge */}
            {feature.status === 'new' && (
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: '#10b981',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '600'
              }}>
                NEW
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: activeFeature === index ? 'rgba(255, 255, 255, 0.2)' : '#262626',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activeFeature === index ? 'white' : '#9ca3af',
                marginBottom: '16px'
              }}>
                {feature.icon}
              </div>
              
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: activeFeature === index ? 'white' : '#e5e7eb',
                marginBottom: '8px'
              }}>
                {feature.title}
              </h3>
              
              <p style={{
                fontSize: '14px',
                color: activeFeature === index ? 'rgba(255, 255, 255, 0.8)' : '#9ca3af',
                marginBottom: '16px'
              }}>
                {feature.subtitle}
              </p>
            </div>

            <p style={{
              fontSize: '14px',
              color: activeFeature === index ? 'rgba(255, 255, 255, 0.9)' : '#d1d5db',
              lineHeight: '1.5',
              marginBottom: '16px'
            }}>
              {feature.description}
            </p>

            <div style={{ marginBottom: '16px' }}>
              {feature.benefits.slice(0, 3).map((benefit, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <Check style={{
                    width: '14px',
                    height: '14px',
                    color: activeFeature === index ? 'white' : '#10b981'
                  }} />
                  <span style={{
                    fontSize: '12px',
                    color: activeFeature === index ? 'rgba(255, 255, 255, 0.9)' : '#d1d5db'
                  }}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: '500',
              color: activeFeature === index ? 'white' : '#6b7280'
            }}>
              Learn more
              <ArrowRight style={{ width: '12px', height: '12px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Additional Features Grid */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '24px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#e5e7eb',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          And Much More...
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {advancedFeatures.map((feature, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#262626',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#3a3a3a',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af'
              }}>
                {feature.icon}
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#e5e7eb',
                  marginBottom: '2px'
                }}>
                  {feature.title}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#9ca3af'
                }}>
                  {feature.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;