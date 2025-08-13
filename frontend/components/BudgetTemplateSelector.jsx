"use client"
import React, { useState } from 'react';
import { X, Check, User, GraduationCap, PiggyBank, Users, CreditCard, Briefcase, Palmtree, Rocket, Leaf } from 'lucide-react';
import { getAllTemplates, getTemplatesByCategory, calculateTemplateAmounts } from '../lib/budgetTemplates';

const BudgetTemplateSelector = ({ onTemplateSelect, currentAllocations, monthlyIncome = 0 }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeCategory, setActiveCategory] = useState('beginner');
  
  // Add defensive programming
  let templates = [];
  let templateCategories = {};
  
  try {
    templates = getAllTemplates() || [];
    templateCategories = getTemplatesByCategory() || {};
  } catch (error) {
    console.error('Error loading budget templates:', error);
    templates = [];
    templateCategories = { beginner: [], advanced: [], family: [], specialized: [] };
  }
  
  const getTemplateIcon = (iconName) => {
    const iconMap = {
      '📊': <User className="w-6 h-6" />,
      '🎓': <GraduationCap className="w-6 h-6" />,
      '💰': <PiggyBank className="w-6 h-6" />,
      '👨‍👩‍👧‍👦': <Users className="w-6 h-6" />,
      '💳': <CreditCard className="w-6 h-6" />,
      '💼': <Briefcase className="w-6 h-6" />,
      '🏖️': <Palmtree className="w-6 h-6" />,
      '🚀': <Rocket className="w-6 h-6" />,
      '🌱': <Leaf className="w-6 h-6" />
    };
    return iconMap[iconName] || <User className="w-6 h-6" />;
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const applyTemplate = () => {
    if (selectedTemplate && onTemplateSelect) {
      onTemplateSelect(selectedTemplate);
      setShowModal(false);
      setSelectedTemplate(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTemplate(null);
  };

  const isCurrentTemplate = (template) => {
    if (!currentAllocations) return false;
    return (
      currentAllocations.needs === template.allocations.needs &&
      currentAllocations.wants === template.allocations.wants &&
      currentAllocations.savings === template.allocations.savings
    );
  };

  const categoryNames = {
    beginner: 'Beginner Friendly',
    advanced: 'Advanced Strategies',
    family: 'Family & Life Stages',
    specialized: 'Specialized Situations'
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        style={{ 
          backgroundColor: '#8b5cf6', 
          color: 'white', 
          display: 'flex', 
          gap: '8px', 
          alignItems: 'center',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer'
        }}
      >
        <PiggyBank style={{ width: '16px', height: '16px' }} />
        Budget Templates
      </button>

      {showModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
          onClick={closeModal}
        >
          <div 
            style={{
              backgroundColor: '#2a2a2a',
              borderRadius: '12px',
              padding: '24px',
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflow: 'auto',
              border: '1px solid #3a3a3a',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  backgroundColor: '#8b5cf6',
                  borderRadius: '8px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PiggyBank style={{ width: '20px', height: '20px', color: 'white' }} />
                </div>
                <h2 style={{ color: '#e5e7eb', fontSize: '20px', fontWeight: '600', margin: 0 }}>
                  Choose a Budget Template
                </h2>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px', margin: '0 0 24px 0' }}>
              Select a pre-configured budget template that matches your financial situation
            </p>

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #3a3a3a', paddingBottom: '16px' }}>
              {Object.keys(templateCategories).map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: activeCategory === category ? '#8b5cf6' : 'transparent',
                    color: activeCategory === category ? 'white' : '#9ca3af',
                    border: `1px solid ${activeCategory === category ? '#8b5cf6' : '#3a3a3a'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {categoryNames[category]}
                </button>
              ))}
            </div>

            {/* Templates Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '16px',
              marginBottom: '20px'
            }}>
              {templateCategories[activeCategory] && templateCategories[activeCategory].map(templateId => {
                const template = templates.find(t => t && t.id === templateId);
                if (!template || !template.allocations) return null;
                
                let calculatedAmounts;
                try {
                  calculatedAmounts = calculateTemplateAmounts(template, monthlyIncome);
                } catch (error) {
                  console.error('Error calculating template amounts:', error);
                  calculatedAmounts = { needs: 0, wants: 0, savings: 0 };
                }
                
                const isCurrent = isCurrentTemplate(template);
                const isSelected = selectedTemplate?.id === template.id;
                
                return (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    style={{
                      padding: '16px',
                      backgroundColor: isSelected ? '#1e1b4b' : isCurrent ? '#0f172a' : '#1a1a1a',
                      border: `2px solid ${isSelected ? '#8b5cf6' : isCurrent ? '#10b981' : '#3a3a3a'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    {isCurrent && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        CURRENT
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      {getTemplateIcon(template.icon || '📊')}
                      <h3 style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                        {template.name || 'Unknown Template'}
                      </h3>
                    </div>
                    
                    <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '16px', lineHeight: '1.4' }}>
                      {template.description || 'No description available'}
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '500' }}>
                          Needs: {template.allocations?.needs || 0}%
                        </span>
                        <span style={{ color: '#e5e7eb', fontSize: '12px' }}>
                          ${(calculatedAmounts.needs || 0).toLocaleString()}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '500' }}>
                          Wants: {template.allocations?.wants || 0}%
                        </span>
                        <span style={{ color: '#e5e7eb', fontSize: '12px' }}>
                          ${(calculatedAmounts.wants || 0).toLocaleString()}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#10b981', fontSize: '12px', fontWeight: '500' }}>
                          Savings: {template.allocations?.savings || 0}%
                        </span>
                        <span style={{ color: '#e5e7eb', fontSize: '12px' }}>
                          ${(calculatedAmounts.savings || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <p style={{ color: '#6b7280', fontSize: '11px', fontStyle: 'italic', marginTop: '12px', marginBottom: 0 }}>
                      {template.recommendedFor || 'General purpose budgeting'}
                    </p>
                    
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        backgroundColor: '#8b5cf6',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        <Check style={{ width: '14px', height: '14px' }} />
                        Selected
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Template Details */}
            {selectedTemplate && (
              <div style={{
                padding: '16px',
                backgroundColor: '#1e1b4b',
                borderRadius: '8px',
                border: '1px solid #8b5cf6',
                marginBottom: '16px'
              }}>
                <h4 style={{ color: '#e5e7eb', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                  Template Details: {selectedTemplate.name || 'Unknown Template'}
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <h5 style={{ color: '#ef4444', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                      Needs ({selectedTemplate.allocations?.needs || 0}%)
                    </h5>
                    <ul style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.4', paddingLeft: '16px', margin: 0 }}>
                      {(selectedTemplate.categories?.needs || []).slice(0, 4).map((category, index) => (
                        <li key={index}>{category}</li>
                      ))}
                      {(selectedTemplate.categories?.needs || []).length > 4 && (
                        <li>+{(selectedTemplate.categories?.needs || []).length - 4} more...</li>
                      )}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                      Wants ({selectedTemplate.allocations?.wants || 0}%)
                    </h5>
                    <ul style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.4', paddingLeft: '16px', margin: 0 }}>
                      {(selectedTemplate.categories?.wants || []).slice(0, 4).map((category, index) => (
                        <li key={index}>{category}</li>
                      ))}
                      {(selectedTemplate.categories?.wants || []).length > 4 && (
                        <li>+{(selectedTemplate.categories?.wants || []).length - 4} more...</li>
                      )}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 style={{ color: '#10b981', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                      Savings ({selectedTemplate.allocations?.savings || 0}%)
                    </h5>
                    <ul style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.4', paddingLeft: '16px', margin: 0 }}>
                      {(selectedTemplate.categories?.savings || []).slice(0, 4).map((category, index) => (
                        <li key={index}>{category}</li>
                      ))}
                      {(selectedTemplate.categories?.savings || []).length > 4 && (
                        <li>+{(selectedTemplate.categories?.savings || []).length - 4} more...</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#9ca3af',
                  border: '1px solid #3a3a3a',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={applyTemplate}
                disabled={!selectedTemplate}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedTemplate ? '#8b5cf6' : '#404040',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: selectedTemplate ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Check style={{ width: '16px', height: '16px' }} />
                Apply Template
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BudgetTemplateSelector;
