"use client"
import React, { useState } from 'react';
import { X, Check, PiggyBank } from 'lucide-react';

// Simple template data - hardcoded to avoid import issues
const SIMPLE_TEMPLATES = [
  {
    id: 'classic-50-30-20',
    name: '50/30/20 Rule (Classic)',
    description: 'The traditional approach: 50% needs, 30% wants, 20% savings',
    allocations: { needs: 50, wants: 30, savings: 20 }
  },
  {
    id: 'student-budget',
    name: 'Student Budget',
    description: 'Optimized for students with limited income',
    allocations: { needs: 65, wants: 15, savings: 20 }
  },
  {
    id: 'aggressive-saver',
    name: 'Aggressive Saver',
    description: 'Maximize savings and investments',
    allocations: { needs: 40, wants: 20, savings: 40 }
  }
];

const BudgetTemplateSelectorFixed = ({ onTemplateSelect, currentAllocations, monthlyIncome = 0 }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const closeModal = () => {
    setShowModal(false);
    setSelectedTemplate(null);
  };

  const applyTemplate = () => {
    if (selectedTemplate && onTemplateSelect) {
      onTemplateSelect(selectedTemplate);
      closeModal();
    }
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
              maxWidth: '500px',
              border: '1px solid #3a3a3a',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ color: '#e5e7eb', fontSize: '20px', fontWeight: '600', margin: 0 }}>
                Budget Templates
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
              Select a pre-configured budget template that matches your financial situation
            </p>

            {/* Templates Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {SIMPLE_TEMPLATES.map(template => {
                const isSelected = selectedTemplate?.id === template.id;
                
                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    style={{
                      padding: '16px',
                      backgroundColor: isSelected ? '#1e1b4b' : '#1a1a1a',
                      border: `2px solid ${isSelected ? '#8b5cf6' : '#3a3a3a'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                        {template.name}
                      </h3>
                      {isSelected && (
                        <div style={{
                          backgroundColor: '#8b5cf6',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Check style={{ width: '12px', height: '12px' }} />
                          Selected
                        </div>
                      )}
                    </div>
                    
                    <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '12px', lineHeight: '1.4' }}>
                      {template.description}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                      <span style={{ color: '#ef4444' }}>
                        Needs: {template.allocations.needs}%
                      </span>
                      <span style={{ color: '#f59e0b' }}>
                        Wants: {template.allocations.wants}%
                      </span>
                      <span style={{ color: '#10b981' }}>
                        Savings: {template.allocations.savings}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
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

export default BudgetTemplateSelectorFixed;
