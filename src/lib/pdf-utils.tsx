import { InvoicePDF } from "@/components/pos/InvoicePDF";
import { InvoiceData } from "@/types";
import { renderToStream } from "@react-pdf/renderer";

export async function getInvoicePDFBlob(data: InvoiceData): Promise<Blob> {
  const stream = await renderToStream(<InvoicePDF data={data} />);

  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];

    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => {
      const blob = new Blob(chunks, { type: "application/pdf" });
      resolve(blob);
    });
    stream.on("error", reject);
  });
}
