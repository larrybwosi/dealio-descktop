import { useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InvoicePDF } from './InvoicePDF';
import { InvoiceData, Order } from '@/types';
import { PDFViewer } from '@react-pdf/renderer';
import { useReactToPrint } from 'react-to-print';
import { Printer, Download, Mail, Share2 } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export function InvoiceModal({ isOpen, onClose, order }: InvoiceModalProps) {
  const pdfRef = useRef<HTMLDivElement>(null);

  // Generate QR code URL with order info
  const qrCodeUrl = `https://foodpoint.com/payment/${order.id}`;

  const invoiceData: InvoiceData = {
    order,
    restaurantName: 'Bounty Catch Restaurant',
    restaurantAddress: 'Indah Kapuk Beach, Jakarta',
    restaurantPhone: '+62 812 3456 7890',
    restaurantEmail: 'info@bountycatch.com',
    qrCodeUrl
  };

  const handlePrint = useReactToPrint({
    // content: () => pdfRef.current,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Invoice #{order.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto" ref={pdfRef}>
          <PDFViewer width="100%" height={500} style={{ border: 'none' }}>
            <InvoicePDF data={invoiceData} />
          </PDFViewer>
        </div>

        <DialogFooter className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={() => {
            // In a real app, you would implement a download function here
            alert('Download functionality would save the PDF to your device');
          }}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="secondary" onClick={() => {
            // In a real app, you would implement email sending here
            alert('Email functionality would send the invoice to the customer');
          }}>
            <Mail className="mr-2 h-4 w-4" />
            Email to Customer
          </Button>
          <Button variant="secondary" onClick={() => {
            // In a real app, you would implement sharing functionality here
            alert('Share functionality would open native share dialog');
          }}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}