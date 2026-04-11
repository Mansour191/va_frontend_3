import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

class InvoicePDFService {
  constructor() {
    this.defaultOptions = {
      format: 'a4',
      orientation: 'portrait',
      unit: 'mm',
      quality: 0.95
    };
  }

  /**
   * Generate PDF invoice from order data
   * @param {Object} order - Order object with items
   * @param {Object} options - PDF generation options
   * @returns {Promise<Blob>} PDF blob
   */
  async generateInvoice(order, options = {}) {
    try {
      const pdfOptions = { ...this.defaultOptions, ...options };
      
      // Create a temporary container for the invoice
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '800px';
      container.style.backgroundColor = 'white';
      container.style.padding = '20px';
      document.body.appendChild(container);

      // Import and create the InvoicePDF component
      const { createApp } = await import('vue');
      const InvoicePDFComponent = await import('@/shared/components/InvoicePDF.vue');
      
      const app = createApp(InvoicePDFComponent.default, {
        order,
        invoiceNumber: `INV-${order.orderNumber}-${Date.now()}`,
        invoiceDate: new Date().toISOString()
      });
      
      // Mount the component
      const componentInstance = app.mount(container);
      
      // Wait for the component to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: container.scrollHeight
      });
      
      // Create PDF
      const pdf = new jsPDF(pdfOptions);
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(canvas.toDataURL('image/png', 0.95), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png', 0.95), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Clean up
      app.unmount();
      document.body.removeChild(container);
      
      return new Blob([pdf.output('blob')], { type: 'application/pdf' });
      
    } catch (error) {
      console.error('Error generating PDF invoice:', error);
      throw new Error('فشل إنشاء الفاتورة PDF');
    }
  }

  /**
   * Download PDF invoice
   * @param {Object} order - Order object
   * @param {string} filename - Custom filename
   */
  async downloadInvoice(order, filename = null) {
    try {
      const pdfBlob = await this.generateInvoice(order);
      const defaultFilename = `فاتورة_${order.orderNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      const finalFilename = filename || defaultFilename;
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename: finalFilename };
      
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw error;
    }
  }

  /**
   * Get PDF as base64 string for email attachments
   * @param {Object} order - Order object
   * @returns {Promise<string>} Base64 string
   */
  async getInvoiceBase64(order) {
    try {
      const pdfBlob = await this.generateInvoice(order);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });
    } catch (error) {
      console.error('Error getting invoice base64:', error);
      throw error;
    }
  }

  /**
   * Generate invoice with custom template
   * @param {Object} order - Order object
   * @param {Object} templateData - Custom template data
   * @param {Object} options - PDF options
   */
  async generateCustomInvoice(order, templateData, options = {}) {
    try {
      // This can be extended to support custom templates
      const enhancedOrder = {
        ...order,
        customTemplate: templateData
      };
      
      return await this.generateInvoice(enhancedOrder, options);
    } catch (error) {
      console.error('Error generating custom invoice:', error);
      throw error;
    }
  }

  /**
   * Validate order data before generating invoice
   * @param {Object} order - Order object
   * @returns {boolean} True if valid
   */
  validateOrderData(order) {
    const requiredFields = ['orderNumber', 'customerName', 'totalAmount', 'items'];
    
    for (const field of requiredFields) {
      if (!order[field]) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }
    
    if (!Array.isArray(order.items) || order.items.length === 0) {
      console.error('Order must have at least one item');
      return false;
    }
    
    // Validate each item
    for (const item of order.items) {
      if (!item.product || !item.quantity || !item.price) {
        console.error('Invalid item data:', item);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get invoice preview as data URL
   * @param {Object} order - Order object
   * @returns {Promise<string>} Data URL
   */
  async getInvoicePreview(order) {
    try {
      const pdfBlob = await this.generateInvoice(order);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });
    } catch (error) {
      console.error('Error getting invoice preview:', error);
      throw error;
    }
  }
}

export default new InvoicePDFService();
