'use client';

import { useEffect, useCallback, useRef } from 'react';
import { ably } from '@/lib/ably';
import { Message } from 'ably';
import { toast } from 'sonner';

import { printPdf } from 'tauri-plugin-printer-v2';
import { BaseDirectory, writeFile, mkdir, exists } from '@tauri-apps/plugin-fs';
import { documentDir } from '@tauri-apps/api/path';
import { usePrinterStore } from '@/store/printer-store';
import { API_ENDPOINT } from '@/lib/axios';
import { useOrgStore } from '@/lib/tanstack-axios';
import axios from 'axios';
import axiosTauriApiAdapter from 'axios-tauri-api-adapter';

interface AblyOrderProviderProps {
  children: React.ReactNode;
}

interface Order {
  id: string;
  orderNumber: string;
}

// Constants
const DEALIO_FOLDER = 'Dealio';
const DEFAULT_PRINTER = 'XP-80C';
const RECEIPT_MIME_TYPE = 'application/pdf';

export const AblyOrderProvider: React.FC<AblyOrderProviderProps> = ({ children }) => {
  const { printers, defaultPrinter } = usePrinterStore();
  const { organizationId } = useOrgStore();
  const isSubscribedRef = useRef(false);

  /**
   * Ensures the Dealio directory exists in the user's documents folder
   */
  const ensureDirectoryExists = useCallback(async (): Promise<string> => {
    const docsPath = await documentDir();
    const dealioPath = `${docsPath}${DEALIO_FOLDER}`;

    if (!(await exists(DEALIO_FOLDER, { baseDir: BaseDirectory.Document }))) {
      await mkdir(DEALIO_FOLDER, { baseDir: BaseDirectory.Document, recursive: true });
    }

    return dealioPath;
  }, []);

  /**
   * Fetches receipt PDF from the API
   */
  const fetchReceipt = useCallback(
    async (orderId: string): Promise<Blob | null> => {
      if (!orderId || !organizationId) {
        console.error('Missing required parameters for receipt fetch:', { orderId, organizationId });
        return null;
      }

      try {
        console.log(`Fetching receipt for order: ${orderId}`);

        const response = await axios.get(
          `${API_ENDPOINT}/api/organizations/${organizationId}/orders/${orderId}/receipt`,
          { adapter: axiosTauriApiAdapter }
        );

        if (!response.data) {
          throw new Error(`Receipt fetch failed with status: ${response.status}`);
        }

        // Convert Tauri's number array response to Blob
        return new Blob([new Uint8Array(response.data as number[])], {
          type: RECEIPT_MIME_TYPE,
        });
      } catch (error) {
        console.error('Receipt fetch error:', error);
        toast.error('Could not fetch receipt', {
          description: 'Please try again later from the sales history.',
        });
        return null;
      }
    },
    [organizationId]
  );

  /**
   * Saves PDF blob to local file system
   */
  const saveReceiptToFile = useCallback(
    async (blob: Blob, orderId: string): Promise<string | null> => {
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const fileName = `Invoice_${orderId}.pdf`;

        const dealioPath = await ensureDirectoryExists();
        const filePath = `${dealioPath}/${fileName}`;

        await writeFile(filePath, uint8Array);

        return filePath;
      } catch (error) {
        console.error('Error saving receipt to file:', error);
        throw new Error('Failed to save receipt file');
      }
    },
    [ensureDirectoryExists]
  );

  /**
   * Sends PDF to printer
   */
  const sendToPrinter = useCallback(
    async (filePath: string, orderId: string): Promise<void> => {
      const printerName = defaultPrinter || printers[0]?.Name || DEFAULT_PRINTER;

      console.log(`Printing order ${orderId} to printer: ${printerName}`);

      await printPdf({
        path: filePath,
        printer: printerName,
        id: orderId,
        remove_after_print: true,
        print_settings: '',
      });
    },
    [defaultPrinter, printers]
  );

  /**
   * Main receipt printing handler
   */
  const printReceipt = useCallback(
    async (orderId: string): Promise<void> => {
      if (!orderId || !organizationId) {
        console.error('Missing required parameters for printing:', { orderId, organizationId });
        return;
      }

      try {
        // Fetch receipt
        const blob = await fetchReceipt(orderId);
        if (!blob) return;

        // Save to file
        const filePath = await saveReceiptToFile(blob, orderId);
        if (!filePath) return;

        // Send to printer
        await sendToPrinter(filePath, orderId);

        toast.success('Receipt sent to printer!');
      } catch (error) {
        console.error('Receipt printing error:', error);
        toast.error('Failed to print receipt.');
      }
    },
    [organizationId, fetchReceipt, saveReceiptToFile, sendToPrinter]
  );

  /**
   * Handles incoming Ably order messages
   */
  const handleNewOrder = useCallback(
    async (message: Message): Promise<void> => {
      try {
        const order = message.data as Order;

        if (!order?.id) {
          console.error('Invalid order data received:', message);
          return;
        }

        console.log('New order received via Ably:', order.id);

        toast.info(`New order ${order.orderNumber} received. Printing...`);

        await printReceipt(order.id);
      } catch (error) {
        console.error('Error handling new order:', error);
        toast.error('Error processing new order');
      }
    },
    [printReceipt]
  );

  /**
   * Manages Ably channel subscription
   */
  useEffect(() => {
    // Early exit inside useEffect instead of before hooks
    if (!organizationId) {
      console.warn('AblyOrderProvider: No organization ID available, skipping subscription');
      return;
    }

    if (isSubscribedRef.current) return;

    const channelName = `organization:${organizationId}`;
    const channel = ably.channels.get(channelName);

    const subscribe = async () => {
      try {
        await channel.subscribe('new-order', handleNewOrder);
        isSubscribedRef.current = true;
        console.log(`Subscribed to Ably channel: ${channelName}`);
      } catch (error) {
        console.error('Failed to subscribe to Ably channel:', error);
        toast.error('Failed to connect to order notifications');
      }
    };

    subscribe();

    // Cleanup function
    return () => {
      if (isSubscribedRef.current) {
        channel.unsubscribe('new-order', handleNewOrder);
        isSubscribedRef.current = false;
        console.log(`Unsubscribed from Ably channel: ${channelName}`);
      }
    };
  }, [organizationId, handleNewOrder]);

  return <>{children}</>;
};
