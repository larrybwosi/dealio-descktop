import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScanLine } from 'lucide-react';

// import { requestDevice, openDevice, closeDevice } from '@redfernelec/tauri-plugin-hid-api';
import { listen } from '@tauri-apps/api/event';

/**
 * Maps common USB HID Usage IDs for keyboard numbers to characters.
 * Most barcode scanners emulate a keyboard and send these codes.
 * The 'Enter' key is typically 0x28.
 */
const hidUsageIdToChar = {
  0x1e: '1',
  0x1f: '2',
  0x20: '3',
  0x21: '4',
  0x22: '5',
  0x23: '6',
  0x24: '7',
  0x25: '8',
  0x26: '9',
  0x27: '0',
  // You can add more mappings for letters if your barcodes include them
  // 0x04: 'a', 0x05: 'b', etc.
};
const ENTER_KEY_CODE = 0x28;

export function BarcodeScannerModal({ onScanComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('Ready to Scan');
  const [scannedCode, setScannedCode] = useState('');
  const barcodeBuffer = useRef([]);
  const unlistenRef = useRef(null);

  // This function handles the logic to start the scanner
  const startScanner = useCallback(async () => {
    try {
      setStatus('Requesting device access...');
      // This opens a system dialog for the user to select the HID device.
      const devices = await requestDevice({ filters: [] });

      if (!devices || devices.length === 0) {
        setStatus('No device selected. Canceled.');
        return;
      }

      const device = devices[0];
      setStatus(`Connecting to ${device.productName}...`);
      await openDevice(device);

      setStatus('✅ Connected! Scanning for barcode...');

      // Listen for the 'hid-read' event which fires when the device sends data
      unlistenRef.current = await listen('hid-read', event => {
        // The data format depends on the device. For many scanners, the keycode is in the 3rd byte (index 2).
        const keycode = event.payload.data[2];

        // Ignore "key up" events (usually a report of all zeros)
        if (keycode === 0) {
          return;
        }

        if (keycode === ENTER_KEY_CODE) {
          const barcode = barcodeBuffer.current.join('');
          if (barcode) {
            // Ensure we don't process an empty scan
            setStatus(`Scan Complete!`);
            setScannedCode(barcode);
            if (onScanComplete) {
              onScanComplete(barcode);
            }
            barcodeBuffer.current = []; // Clear buffer for next scan
            setIsOpen(false); // Close modal on successful scan
          }
        } else if (hidUsageIdToChar[keycode]) {
          barcodeBuffer.current.push(hidUsageIdToChar[keycode]);
        }
      });
    } catch (err) {
      console.error('Scanner Error:', err);
      setStatus(`Error: Could not connect to device.`);
    }
  }, [onScanComplete]);

  // This function handles the logic to stop the scanner
  const stopScanner = useCallback(async () => {
    if (unlistenRef.current) {
      unlistenRef.current(); // Stop listening to events
      unlistenRef.current = null;
    }
    await closeDevice();
    setStatus('Scanner stopped.');
    barcodeBuffer.current = []; // Clear any partial data
    setScannedCode(''); // Reset the display
  }, []);

  // Effect to manage the scanner lifecycle based on the modal's open state
  useEffect(() => {
    if (isOpen) {
      startScanner();
    }

    // The cleanup function runs when the component unmounts OR before the effect runs again.
    // We'll call stopScanner here to ensure resources are always released.
    return () => {
      stopScanner();
    };
  }, [isOpen, startScanner, stopScanner]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ScanLine className="mr-2 h-4 w-4" /> Scan Barcode
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
          <DialogDescription>
            Hold the barcode in front of your scanner. This modal will close automatically upon a successful scan.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 my-8">
          <ScanLine className="h-24 w-24 text-gray-400 animate-pulse" />
          <p className="text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-md">{status}</p>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
