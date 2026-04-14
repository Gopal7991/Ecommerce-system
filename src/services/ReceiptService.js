import axios from 'axios';
import html2pdf from 'html2pdf.js';

const ReceiptService = {

  async generatePDF(element, orderId) {

    const options = {
      margin: 10,
      filename: `Invoice_${orderId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        allowTaint: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    return await html2pdf().set(options).from(element).outputPdf('blob');
  },

  async send(orderId, element) {
    try {
      const pdfBlob = await this.generatePDF(element, orderId);

      const formData = new FormData();
      formData.append('receipt', pdfBlob, `Invoice_${orderId}.pdf`);
      formData.append('order_id', orderId);

      const token = localStorage.getItem('api_token');

      return await axios.post('/api/send-order-receipt', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

    } catch (error) {
      console.error('ReceiptService Error:', error);
      throw error;
    }
  },

  async download(orderId, element) {
    const pdfBlob = await this.generatePDF(element, orderId);

    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `Invoice_${orderId}.pdf`;
    link.click();

    window.URL.revokeObjectURL(url);
  }
};

export default ReceiptService;