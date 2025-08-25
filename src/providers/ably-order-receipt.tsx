'use client';

import { useEffect, useCallback } from 'react';
import { ably } from '@/lib/ably';
import { Message } from 'ably';
import { toast } from 'sonner';

import { printPdf } from 'tauri-plugin-printer-v2';
import { BaseDirectory, writeFile, mkdir, exists, remove } from '@tauri-apps/plugin-fs';
import { documentDir } from '@tauri-apps/api/path';
import { usePrinterStore } from '@/store/printer-store';
import { fetch } from '@tauri-apps/plugin-http';
import { API_ENDPOINT } from '@/lib/axios';
import { useOrgStore } from '@/lib/tanstack-axios';

interface AblyOrderProviderProps {
  children: React.ReactNode;
}

export const AblyOrderProvider: React.FC<AblyOrderProviderProps> = ({ children }) => {
    const { printers, defaultPrinter } = usePrinterStore();
    const {organizationId} = useOrgStore()

  // Handle fetching receipt blob from API
  const handleFetchReceipt = async (organizationId: string, orderid: string) => {
    console.log('Fetching receipt for sale ID:', orderid);
    if (!orderid) {
      console.error('No sale ID provided');
      return null;
    }
    try {
      const response = await fetch(`${API_ENDPOINT}/api/organizations/${organizationId}/orders/${orderid}/receipt`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Receipt fetch failed:', errorText);
        throw new Error('Failed to fetch receipt');
      }
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error fetching receipt:', error);
      toast.error('Could not fetch receipt', {
        description: 'Please try downloading it later from sales history.',
      });
      return null;
    }
  };

  // Handle print receipt using your specified logic
  const handlePrintReceipt = async (orderid: string) => {
    if (!orderid) return;
    
    let filePath = '';
    try {
      const blob = await handleFetchReceipt(organizationId, orderid);
      if (!blob) return;

      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const fileName = `Invoice_${orderid}.pdf`;

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
        id: orderid,
        remove_after_print: true,
        print_settings: '',
      });

      toast.success('Successfully sent to printer!');
    } catch (error) {
      console.error('Error printing receipt:', error);
    }
  };

  const handleNewOrder = useCallback(
    async (message: Message) => {
      const orderId = message.data.id;
      if (!orderId) {
        console.error('No order ID received in Ably message');
        return;
      }

      try {
          await handlePrintReceipt(orderId);
      } catch (error) {
        console.error('Error fetching order for printing:', error);
      }
    },
    []
  );

  useEffect(() => {
    if (!organizationId) return;
    // Effect to set up and tear down the Ably subscription
    const channel = ably.channels.get(`organization:${organizationId}`);

    channel.subscribe('new-order', handleNewOrder);
    console.log(`Subscribed to Ably channel: organization:${organizationId}`);

    // Cleanup function to unsubscribe when the component unmounts or organizationId changes
    return () => {
      channel.unsubscribe('new-order', handleNewOrder);
      console.log(`Unsubscribed from Ably channel: organization:${organizationId}`);
    };
  }, [organizationId, handleNewOrder]);


  return (
    <>
      {children}
    </>
  );
};
