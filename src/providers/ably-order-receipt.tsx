'use client';

import { useEffect, useCallback } from 'react';
import { ably } from '@/lib/ably';
import { Message } from 'ably';
import { toast } from 'sonner';

import { printPdf } from 'tauri-plugin-printer-v2';
import { BaseDirectory, writeFile, mkdir, exists } from '@tauri-apps/plugin-fs';
import { documentDir } from '@tauri-apps/api/path';
import { usePrinterStore } from '@/store/printer-store';
import { fetch } from '@tauri-apps/plugin-http';
import { API_ENDPOINT } from '@/lib/axios';
import { useOrgStore } from '@/lib/tanstack-axios';
import axios from 'axios';
import axiosTauriApiAdapter from 'axios-tauri-api-adapter';

interface AblyOrderProviderProps {
  children: React.ReactNode;
}

export const AblyOrderProvider: React.FC<AblyOrderProviderProps> = ({ children }) => {
    const { printers, defaultPrinter } = usePrinterStore();
    const { organizationId } = useOrgStore();

    const handleFetchReceipt = useCallback(async (orgId: string, orderId: string): Promise<Blob | null> => {
        console.log('Fetching receipt for order ID:', orderId);
        if (!orderId || !orgId) {
            console.error('Organization ID or Order ID not provided for receipt fetch.');
            return null;
        }
        try {
            const response = await axios.get(`${API_ENDPOINT}/api/organizations/${orgId}/orders/${orderId}/receipt`,{ adapter: axiosTauriApiAdapter });

            if (!response.data) {
                console.error('Receipt fetch failed:', response.status, response.data);
                throw new Error('Failed to fetch receipt');
            }
            // With Tauri's HTTP plugin, the binary data is in response.data as an array of numbers.
            return new Blob([new Uint8Array(response.data as number[])], { type: 'application/pdf' });
        } catch (error) {
            console.error('Error fetching receipt:', error);
            toast.error('Could not fetch receipt', {
                description: 'Please try again later from the sales history.',
            });
            return null;
        }
    }, []);

    // This function saves the receipt locally and sends it to the printer.
    const handlePrintReceipt = useCallback(async (orderId: string) => {
        if (!orderId || !organizationId) return;
        
        try {
            const blob = await handleFetchReceipt(organizationId, orderId);
            if (!blob) return;

            const arrayBuffer = await blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const fileName = `Invoice_${orderId}.pdf`;

            // Ensure the 'Dealio' directory exists in the user's documents folder.
            if (!(await exists('Dealio', { baseDir: BaseDirectory.Document }))) {
                await mkdir('Dealio', { baseDir: BaseDirectory.Document, recursive: true });
            }

            const docsPath = await documentDir();
            const filePath = `${docsPath}Dealio/${fileName}`;
            await writeFile(filePath, uint8Array);

            const printerName = defaultPrinter || printers[0]?.Name || 'XP-80C';
            console.log(`Printing ${orderId} to printer: ${printerName}`);

            await printPdf({
                path: filePath,
                printer: printerName,
                id: orderId,
                remove_after_print: true,
                print_settings: '',
            });

            toast.success('Receipt sent to printer!');
        } catch (error) {
            console.error('Error printing receipt:', error);
            toast.error('Failed to print receipt.');
        }
    }, [organizationId, defaultPrinter, printers, handleFetchReceipt]);

    // This is the main handler for incoming Ably messages.
    const handleNewOrder = useCallback(
        async (message: Message) => {
            const order = message.data;
            const orderId = order?.id;

            if (!orderId) {
                console.error('No order ID received in Ably message', message);
                return;
            }

            console.log('New order received via Ably:', orderId);
            toast.info(`New order ${order.orderNumber} received. Printing...`);

            await handlePrintReceipt(orderId);
        },
        [handlePrintReceipt] // 2. CRITICAL FIX: Add the memoized handler as a dependency.
    );

    // This effect manages the Ably channel subscription.
    useEffect(() => {
        if (!organizationId) return;

        const channelName = `organization:${organizationId}`;
        const channel = ably.channels.get(channelName);

        channel.subscribe('new-order', handleNewOrder);
        console.log(`Subscribed to Ably channel: ${channelName}`);

        // Cleanup function to unsubscribe when the component unmounts or organizationId changes.
        return () => {
            channel.unsubscribe('new-order', handleNewOrder);
            console.log(`Unsubscribed from Ably channel: ${channelName}`);
        };
    }, [organizationId, handleNewOrder]);

    return <>{children}</>;
};
