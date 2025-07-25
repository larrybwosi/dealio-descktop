import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InvoicePDF } from "./InvoicePDF";
import { InvoiceData, Order } from "@/types";
import { PDFViewer } from "@react-pdf/renderer";
import { useReactToPrint } from "react-to-print";
import { Printer, Download, Mail, Share2 } from "lucide-react";
import { toast } from "sonner";
import { BaseDirectory, open, writeFile } from "@tauri-apps/plugin-fs";
import { save } from "@tauri-apps/plugin-dialog";
import { isTauri } from "@tauri-apps/api/core";
import { documentDir } from "@tauri-apps/api/path";
import { getInvoicePDFBlob } from "@/lib/pdf-utils";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export function InvoiceModal({ isOpen, onClose, order }: InvoiceModalProps) {
  const pdfRef = useRef<HTMLDivElement>(null);

  // Generate QR code URL with order info
  const qrCodeUrl = `https://dealioerp.vecel.app/pay/${order.id}`;

  const invoiceData: InvoiceData = {
    order,
    restaurantName: "Dealio",
    restaurantAddress: "Indah Kapuk Beach, Jakarta",
    restaurantPhone: "+62 812 3456 7890",
    restaurantEmail: "info@bountycatch.com",
    qrCodeUrl,
  };

  const handlePrint = useReactToPrint({
    contentRef: pdfRef,
  });

  const handleDownload = async () => {
    try {
      const blob = await getInvoicePDFBlob(invoiceData);
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      if (isTauri()) {
        // Tauri specific download logic
        const defaultFileName = `Invoice_${order.orderNumber}.pdf`;
        const documentDirPath = await documentDir();

        // Suggest saving to Documents folder
        const filePath = await save({
          defaultPath: `${documentDirPath}/${defaultFileName}`,
          filters: [
            {
              name: "PDF",
              extensions: ["pdf"],
            },
          ],
        });

        if (filePath) {
          await writeFile(filePath, uint8Array);

          toast.success("Invoice downloaded successfully!", {
            action: {
              label: "View Document",
              onClick: async () => {
                const { openPath } = await import("@tauri-apps/plugin-opener");
                await openPath(filePath);
              },
            },
          });
        }
      } else {
        // Web browser download logic
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice_${order.orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Invoice downloaded successfully!");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Invoice #{order.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto" ref={pdfRef}>
          <PDFViewer width="100%" height={500} style={{ border: "none" }}>
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
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              // In a real app, you would implement email sending here
              toast.info(
                "Email functionality would send the invoice to the customer"
              );
            }}
          >
            <Mail className="mr-2 h-4 w-4" />
            Email to Customer
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              // In a real app, you would implement sharing functionality here
              toast.info("Share functionality would open native share dialog");
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
