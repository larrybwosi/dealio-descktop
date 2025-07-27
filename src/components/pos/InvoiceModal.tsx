import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InvoiceData, Order } from '@/types';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { useReactToPrint } from 'react-to-print';
import { Printer, Download, Mail, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { BaseDirectory, writeFile } from '@tauri-apps/plugin-fs';
import { isTauri } from '@tauri-apps/api/core';
import { documentDir } from '@tauri-apps/api/path';
import QRCode from 'qrcode';
import { InvoicePDF } from '@/components/pos/InvoicePDF';
import { useOrgStore } from '@/lib/tanstack-axios';
import { ThermalReceiptPDF, OrganizationData } from './ThermalReceiptPDF';

export interface PaymentData {
  paymentMethod: 'cash' | 'mobile' | 'card';
  amountPaid: number;
  change: number;
  orderId: string;
  customerName?: string;
  customerPhone?: string;
  table?: string;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export function InvoiceModal({ isOpen, onClose, order }: InvoiceModalProps) {
  const pdfRef = useRef<HTMLDivElement>(null);
  // --- ✨ Assuming useOrgStore provides all necessary fields ---
  const { orgName, address,} = useOrgStore();

  const orgInfo = {
    phone: '+62 812 3456 7890',
    email: 'dealio@gealio.co',
    website: 'www.dealio.co',
    tagline: 'Your favorite spot',
  }
  const { phone, email, website, tagline } = orgInfo;
  const isPaid = order.status === 'completed';
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handlePrint = useReactToPrint({
    contentRef: pdfRef,
  });

  useEffect(() => {
    const generateQrCode = async () => {
      if (!order?.id) return;
      setIsLoading(true);
      try {
        const url = isPaid
          ? `https://dealioerp.vercel.app/receipt/${order.id}`
          : `https://dealioerp.vercel.app/pay/${order.id}`;

        const dataUrl = await QRCode.toDataURL(url, {
          width: 128,
          margin: 1,
          errorCorrectionLevel: 'H',
        });
        setQrCodeImage(dataUrl);
      } catch (err) {
        console.error('Failed to generate QR code', err);
        toast.error('Could not generate QR code.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      generateQrCode();
    }
  }, [order.id, isPaid, isOpen]);

  // --- ✨ Data structured for ThermalReceiptPDF ---
  const organizationData: OrganizationData = {
    name: orgName || 'Dealio',
    address: address || 'Indah Kapuk Beach, Jakarta',
    phone: phone || '+62 812 3456 7890',
    email: email || 'info@dealio.co',
    website: website || 'www.dealio.co',
    tagline: tagline || 'Your favorite spot',
  };

  const paymentData: PaymentData = {
    paymentMethod: order.paymentMethod as 'cash' | 'mobile' | 'card',
    amountPaid: order.amountPaid ?? order.total,
    change: order.change ?? 0,
    orderId: order.id,
    customerName: order.customer?.name,
    customerPhone: order.customer?.phone,
    table: order.tableNumber,
  };

  // --- ✨ Data structured for standard InvoicePDF ---
  const invoiceData: InvoiceData = {
    order,
    restaurantName: orgName || 'Dealio',
    restaurantAddress: address || 'Indah Kapuk Beach, Jakarta',
    restaurantPhone: phone || '+62 812 3456 7890',
    restaurantEmail: 'info@dealio.co',
    qrCodeImage: qrCodeImage,
  };

  const handleDownload = async () => {
    if (isLoading) return toast.info('Please wait ...');
    try {
      // --- ✨ Conditionally generate the correct PDF document for download ---
      const pdfDoc = isPaid
        ? ThermalReceiptPDF({
            items: order.items,
            paymentData: paymentData,
            qrCodeImage: qrCodeImage,
            organization: organizationData,
          })
        : InvoicePDF({ data: invoiceData });

      const blob = await pdf(pdfDoc).toBlob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const fileName = isPaid ? `Receipt_${order.orderNumber}.pdf` : `Invoice_${order.orderNumber}.pdf`;

      if (isTauri()) {
        const documentDirPath = await documentDir();
        const filePath = `${documentDirPath}/${fileName}`;
        await writeFile(filePath, uint8Array, { baseDir: BaseDirectory.Download });

        toast.success('Document downloaded successfully!', {
          action: {
            label: 'View Document',
            onClick: async () => {
              const { openPath } = await import('@tauri-apps/plugin-opener');
              await openPath(filePath);
            },
          },
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success('Document downloaded successfully!');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          {/* --- ✨ Title changes based on payment status --- */}
          <DialogTitle>
            {isPaid ? 'Receipt' : 'Invoice'} #{order.orderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto" ref={pdfRef}>
          <PDFViewer width="100%" height={500} style={{ border: 'none' }}>
            {/* --- ✨ Conditionally render correct component with correct props --- */}
            {isPaid ? (
              <ThermalReceiptPDF
                items={order.items}
                paymentData={paymentData}
                qrCodeImage={qrCodeImage}
                organization={organizationData}
              />
            ) : (
              <InvoicePDF data={invoiceData} />
            )}
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
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              toast.info('Email functionality would send the invoice to the customer');
            }}
          >
            <Mail className="mr-2 h-4 w-4" />
            Email to Customer
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              toast.info('Share functionality would open native share dialog');
            }}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
