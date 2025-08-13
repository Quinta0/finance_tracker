import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getApiUrl } from './apiConfig';

export class PDFReportService {
  constructor() {
    this.doc = null;
  }

  // Generate comprehensive financial report
  generateFinancialReport(data, reportType = 'monthly') {
    this.doc = new jsPDF();
    const { transactions, analytics, budget, period, user } = data;
    
    // Header
    this.addHeader(reportType);
    
    // Summary section
    this.addSummarySection(analytics);
    
    // Budget analysis
    if (budget) {
      this.addBudgetAnalysis(budget, analytics);
    }
    
    // Transaction breakdown
    this.addTransactionBreakdown(analytics.categoryBreakdown);
    
    // Monthly trend chart (as table)
    this.addMonthlyTrend(analytics.monthlyTrend);
    
    // Detailed transactions
    this.addTransactionList(transactions, period);
    
    // Footer
    this.addFooter();
    
    return this.doc;
  }

  addHeader(reportType) {
    const pageWidth = this.doc.internal.pageSize.width;
    const today = new Date().toLocaleDateString();
    
    // Title
    this.doc.setFontSize(20);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('Financial Report', pageWidth / 2, 20, { align: 'center' });
    
    // Subtitle
    this.doc.setFontSize(12);
    this.doc.setFont(undefined, 'normal');
    this.doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, pageWidth / 2, 30, { align: 'center' });
    this.doc.text(`Generated on: ${today}`, pageWidth / 2, 40, { align: 'center' });
    
    // Line separator
    this.doc.setLineWidth(0.5);
    this.doc.line(20, 45, pageWidth - 20, 45);
    
    this.currentY = 55;
  }

  addSummarySection(analytics) {
    const { insights } = analytics;
    
    this.doc.setFontSize(14);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('Financial Summary', 20, this.currentY);
    this.currentY += 10;
    
    const summaryData = [
      ['Total Income', `$${insights.totalIncome.toLocaleString()}`],
      ['Total Expenses', `$${insights.totalExpenses.toLocaleString()}`],
      ['Net Worth Change', `$${insights.netWorthChange.toLocaleString()}`],
      ['Savings Rate', `${insights.savingsRate.toFixed(1)}%`],
      ['Avg Monthly Spending', `$${insights.avgMonthlySpending.toLocaleString()}`],
      ['Avg Daily Spending', `$${insights.avgDailySpending.toFixed(2)}`],
    ];
    
    if (insights.largestCategory) {
      summaryData.push(['Top Spending Category', `${insights.largestCategory.category} ($${insights.largestCategory.amount.toLocaleString()})`]);
    }
    
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 20, right: 20 }
    });
    
    this.currentY = this.doc.previousAutoTable?.finalY + 15 || this.currentY + 80;
  }

  addBudgetAnalysis(budget, analytics) {
    this.doc.setFontSize(14);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('Budget Analysis', 20, this.currentY);
    this.currentY += 10;
    
    const budgetData = [
      ['Monthly Income', `$${budget.monthly_income?.toLocaleString() || '0'}`],
      ['Needs Budget (50%)', `$${budget.needs_budget?.toLocaleString() || '0'}`],
      ['Wants Budget (30%)', `$${budget.wants_budget?.toLocaleString() || '0'}`],
      ['Savings Goal (20%)', `$${budget.savings_goal?.toLocaleString() || '0'}`],
    ];
    
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Category', 'Budgeted Amount']],
      body: budgetData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      margin: { left: 20, right: 20 }
    });
    
    this.currentY += (budgetData.length + 1) * 12 + 15;
  }

  addTransactionBreakdown(categoryBreakdown) {
    this.doc.setFontSize(14);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('Expense Breakdown by Category', 20, this.currentY);
    this.currentY += 10;
    
    const categoryData = categoryBreakdown.slice(0, 10).map((category, index) => [
      index + 1,
      category.name,
      `$${category.amount.toLocaleString()}`,
      `${((category.amount / categoryBreakdown.reduce((sum, c) => sum + c.amount, 0)) * 100).toFixed(1)}%`
    ]);
    
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['#', 'Category', 'Amount', 'Percentage']],
      body: categoryData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [239, 68, 68], textColor: 255 },
      alternateRowStyles: { fillColor: [254, 242, 242] },
      margin: { left: 20, right: 20 }
    });
    
    this.currentY += (categoryData.length + 1) * 12 + 15;
  }

  addMonthlyTrend(monthlyTrend) {
    if (this.currentY > 220) {
      this.doc.addPage();
      this.currentY = 20;
    }
    
    this.doc.setFontSize(14);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('Monthly Trend', 20, this.currentY);
    this.currentY += 10;
    
    const trendData = monthlyTrend.map(month => [
      month.month,
      `$${month.income.toLocaleString()}`,
      `$${month.expenses.toLocaleString()}`,
      `$${(month.income - month.expenses).toLocaleString()}`
    ]);
    
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Month', 'Income', 'Expenses', 'Net']],
      body: trendData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [99, 102, 241], textColor: 255 },
      alternateRowStyles: { fillColor: [238, 242, 255] },
      margin: { left: 20, right: 20 }
    });
    
    this.currentY += (trendData.length + 1) * 12 + 15;
  }

  addTransactionList(transactions, period) {
    if (this.currentY > 180) {
      this.doc.addPage();
      this.currentY = 20;
    }
    
    this.doc.setFontSize(14);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('Recent Transactions', 20, this.currentY);
    this.currentY += 10;
    
    // Limit to most recent 20 transactions
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 20);
    
    const transactionData = recentTransactions.map(transaction => [
      new Date(transaction.date).toLocaleDateString(),
      transaction.description || 'No description',
      transaction.category_name || 'Uncategorized',
      transaction.type === 'income' ? '+' : '-',
      `$${Math.abs(parseFloat(transaction.amount)).toLocaleString()}`
    ]);
    
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
      body: transactionData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [75, 85, 99], textColor: 255 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        1: { cellWidth: 60 }, // Description
        2: { cellWidth: 30 }, // Category
        3: { cellWidth: 15 }, // Type
        4: { cellWidth: 25 }  // Amount
      }
    });
    
    this.currentY += (transactionData.length + 1) * 10 + 15;
  }

  addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages();
    const pageWidth = this.doc.internal.pageSize.width;
    const pageHeight = this.doc.internal.pageSize.height;
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont(undefined, 'normal');
      this.doc.text(
        `Generated by Personal Finance Tracker - Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
  }

  // Generate and download the PDF
  downloadReport(data, filename, reportType = 'monthly') {
    const doc = this.generateFinancialReport(data, reportType);
    doc.save(filename);
  }

  // Generate and return blob for preview
  getReportBlob(data, reportType = 'monthly') {
    const doc = this.generateFinancialReport(data, reportType);
    return doc.output('blob');
  }
}

// Export singleton instance
const pdfReportService = new PDFReportService();
export default pdfReportService;
