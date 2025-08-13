import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Test PDF generation functionality
export const testPDFGeneration = () => {
  try {
    const doc = new jsPDF();
    
    // Test basic text
    doc.text('PDF Generation Test', 20, 20);
    
    // Test autoTable
    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: 30,
        head: [['Test Column 1', 'Test Column 2']],
        body: [
          ['Row 1 Data 1', 'Row 1 Data 2'],
          ['Row 2 Data 1', 'Row 2 Data 2']
        ],
        theme: 'grid',
        styles: { fontSize: 10 }
      });
      console.log('✅ autoTable function is available');
      return { success: true, message: 'PDF generation test passed' };
    } else {
      console.error('❌ autoTable function is not available');
      return { success: false, message: 'autoTable function is not available' };
    }
  } catch (error) {
    console.error('❌ PDF generation test failed:', error);
    return { success: false, message: error.message };
  }
};
