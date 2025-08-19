import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InvoiceData, Order } from '@/types';
import { PDFViewer } from '@react-pdf/renderer';
import { Printer, Download, Mail, Share2 } from 'lucide-react';
import { toast } from 'sonner';

import { printPdf } from 'tauri-plugin-printer-v2';
import { BaseDirectory, writeFile, mkdir, exists, remove } from '@tauri-apps/plugin-fs';
import { isTauri } from '@tauri-apps/api/core';
import { documentDir } from '@tauri-apps/api/path';
import QRCode from 'qrcode';
import { InvoicePDF } from '@/components/pos/InvoicePDF';
import { useOrgStore } from '@/lib/tanstack-axios';
import { ThermalReceiptPDF, OrganizationData } from './ThermalReceiptPDF';
import { usePrinterStore } from '@/store/printer-store';
import { API_ENDPOINT } from '@/lib/axios';
import { EnhancedThermalReceiptPDF } from '../receipts/enhanced-thermal-receipt-pdf';

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
  const { organizationId: orgId } = useOrgStore();
  const { printers, defaultPrinter } = usePrinterStore();
  const config = JSON.parse(localStorage.getItem('receipt-config'));


  // const { phone, email, website, tagline } = orgInfo;
  const isPaid = order.status === 'completed';
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  useEffect(() => {
    const generateQrCode = async () => {
      if (!order?.id) return;
      setIsLoading(true);
      try {
        const url = isPaid
          ? `${API_ENDPOINT}/api/organizations/${orgId}/receipt/${order.saleNumber}`
          : `${API_ENDPOINT}/pay/${order.id}`;

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
      name: config.businessName,
      tagline: config.businessTagline,
      address: config.businessAddress,
      phone: config.businessPhone,
      email: config.businessEmail,
      website: config.businessWebsite,
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
    restaurantName: config.businessName || 'Dealio',
    restaurantAddress: config.businessAddress || 'Indah Kapuk Beach, Jakarta',
    restaurantPhone: config.businessPhone || '123-456-7890',
    restaurantEmail: config.businessEmail || 'info@dealio.co',
    qrCodeImage: qrCodeImage,
  };

  // ✨ --- TAURI: SILENT PRINT FUNCTION ---

  const handleSilentPrint = async () => {
    if (!config) {
      return toast.info('No receipt config!', {
        description: 'Please set this in the receipt page',
        action: {
          label: 'Navigate to page',
          onClick: () => {
            window.location.href = '/receipt';
          },
        },
      });
    }
    if (isLoading || isPrinting) return toast.info('Please wait...');

    setIsPrinting(true);
    toast.info('Sending to printer...');

    let filePath = '';

    try {
      const { pdf } = await import('@react-pdf/renderer');
      const organizationData: OrganizationData = {
        name: config.businessName,
        tagline: config.businessTagline,
        address: config.businessAddress,
        phone: config.businessPhone,
        email: config.businessEmail,
        website: config.businessWebsite,
      };

      const pdfDoc = isPaid ? (
        <EnhancedThermalReceiptPDF
          items={order.items}
          paymentData={paymentData}
          qrCodeImage={qrCodeImage}
          config={config}
          organization={organizationData}
        />
      ) : (
        <InvoicePDF data={invoiceData} />
      );

      //============ALSO WORKS CUSTOMIZE FOR RESTAURANTS=====================//

      // const pdfElement = createElement(EnhancedThermalReceiptPDF, {
      //   items: order.items,
      //   paymentData: paymentData,
      //   qrCodeImage,
      //   organization: organizationData,
      //   config: config,
      //   orderType: 'dine-in' as const,
      //   notes: 'Thank you for your order!',
      //   promoCode: 'SAVE10',
      //   specialInstructions: 'Extra hot, no sugar',
      // });

      const blob = await pdf(pdfDoc).toBlob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const fileName = isPaid ? `Receipt_${order.orderNumber}.pdf` : `Invoice_${order.orderNumber}.pdf`;

      const documentDirPath = await documentDir();
      const dealioFolderPath = `${documentDirPath}/Dealio`;

      // Check if folder exists, if not create it
      if (!(await exists('Dealio', { baseDir: BaseDirectory.Document }))) {
        await mkdir('Dealio', { baseDir: BaseDirectory.Document, recursive: true });
      }

      filePath = `${dealioFolderPath}/${fileName}`;
      await writeFile(filePath, uint8Array, { baseDir: BaseDirectory.Document });

      await printPdf({
        path: filePath,
        printer: defaultPrinter || printers[0]?.Name || 'XP-80C',
        id: order.id,
        remove_after_print: true,
        print_settings: '',
      });

      toast.success('Successfully sent to printer!');
    } catch (error) {
      console.error('Error during silent print:', error);
      toast.error(`Failed to print: ${error}`);
    } finally {
      // Always attempt to delete the file after printing
      try {
        if (filePath) {
          await remove(filePath, { baseDir: BaseDirectory.Document });
          console.log('Temporary print file deleted successfully');
        }
      } catch (deleteError) {
        console.warn('Failed to delete temporary print file:', deleteError);
      }
      setIsPrinting(false);
    }
  };
  // --- ✨ Download function for both receipt and invoice ---
  const handleDownload = async () => {
    if (!config) {
      return toast.info('No receipt config!', {
        description: 'Please set this in the receipt page',
        action: {
          label: 'Navigate to page',
          onClick: () => {
            window.location.href = '/receipt';
          },
        },
      });
    }
    if (isLoading) return toast.info('Please wait ...');

    try {
      const { pdf } = await import('@react-pdf/renderer');
      const organizationData: OrganizationData = {
        name: config.businessName,
        tagline: config.businessTagline,
        address: config.businessAddress,
        phone: config.businessPhone,
        email: config.businessEmail,
        website: config.businessWebsite,
      };

      //============ALSO WORKS CUSTOMIZE FOR RESTAURANTS=====================//

      // const pdfElement = createElement(EnhancedThermalReceiptPDF, {
      //   items: order.items,
      //   paymentData: paymentData,
      //   qrCodeImage,
      //   organization: organizationData,
      //   config: config,
      //   orderType: 'dine-in' as const,
      //   notes: 'Thank you for your order!',
      //   promoCode: 'SAVE10',
      //   specialInstructions: 'Extra hot, no sugar',
      // });

      const pdfDoc = isPaid ? (
        <EnhancedThermalReceiptPDF
          items={order.items}
          paymentData={paymentData}
          qrCodeImage={qrCodeImage}
          config={config}
          organization={organizationData}
        />
      ) : (
        <InvoicePDF data={invoiceData} />
      );

      const blob = await pdf(pdfDoc).toBlob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const fileName = isPaid ? `Receipt_${order.orderNumber}.pdf` : `Invoice_${order.orderNumber}.pdf`;

      if (isTauri()) {
        const documentDirPath = await documentDir();
        const dealioFolderPath = `${documentDirPath}/Dealio`;

        // Check if folder exists, if not create it
        if (!(await exists('Dealio', { baseDir: BaseDirectory.Download }))) {
          await mkdir('Dealio', { baseDir: BaseDirectory.Download, recursive: true });
        }

        const filePath = `${dealioFolderPath}/${fileName}`;
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
              <EnhancedThermalReceiptPDF
                items={order.items}
                paymentData={paymentData}
                qrCodeImage={qrCodeImage}
                config={config}
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

          {isTauri() && (
            <Button variant="default" onClick={handleSilentPrint} disabled={isPrinting}>
              <Printer className="mr-2 h-4 w-4" />
              {isPrinting ? 'Printing...' : 'Print'}
            </Button>
          )}

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
