import React, { useState, useEffect } from 'react';
import { HidDevice, enumerate } from '@redfernelec/tauri-plugin-hid-api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, CheckCircle, AlertCircle, Scan } from 'lucide-react';

interface CardData {
  cardNumber: string;
  timestamp: Date;
  status: 'success' | 'error';
}

const IDCardScannerDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<CardData[]>([]);

  // Tauri HID device connection
  useEffect(() => {
    if (!isOpen || !isScanning) return;

    let myDevice: HidDevice | null = null;
    let isReading = true;

    const connectAndRead = async () => {
      try {
        // Enumerate devices and find one based on product string
        const devices = await enumerate();
        for (const device of devices) {
          if (device.productString === 'My Device') {
            myDevice = device;
            break;
          }
        }

        if (!myDevice) {
          const errorData: CardData = {
            cardNumber: 'NO_DEVICE',
            timestamp: new Date(),
            status: 'error',
          };
          setCardData(errorData);
          setIsScanning(false);
          return;
        }

        await myDevice.open();

        // Read card data
        try {
          await myDevice.write(new Uint8Array([0x00, 0x00]));
          const data = await myDevice.read(2);

          if (data) {
            // Convert ArrayBuffer to Uint8Array
            const uint8Data = new Uint8Array(data);
            // Convert Uint8Array to hex string
            const cardNumber = Array.from(uint8Data)
              .map(byte => byte.toString(16).padStart(2, '0'))
              .join('')
              .toUpperCase();

            // Only process if we got actual data (not all zeros)
            if (cardNumber !== '0'.repeat(cardNumber.length)) {
              const newCardData: CardData = {
                cardNumber,
                timestamp: new Date(),
                status: 'success',
              };

              setCardData(newCardData);
              setScanHistory(prev => [newCardData, ...prev.slice(0, 4)]);
              setIsScanning(false);
            } else {
              const errorData: CardData = {
                cardNumber: 'READ_ERROR',
                timestamp: new Date(),
                status: 'error',
              };
              setCardData(errorData);
              setIsScanning(false);
            }
          }
        } catch (readError) {
          console.error('Read error:', readError);
          const errorData: CardData = {
            cardNumber: 'READ_ERROR',
            timestamp: new Date(),
            status: 'error',
          };
          setCardData(errorData);
          setIsScanning(false);
        }

        await myDevice.close();
      } catch (error) {
        console.error('Failed to connect to card reader:', error);
        const errorData: CardData = {
          cardNumber: 'CONNECTION_ERROR',
          timestamp: new Date(),
          status: 'error',
        };
        setCardData(errorData);
        setIsScanning(false);
      }
    };

    if (isScanning) {
      connectAndRead();
    }

    // Clean up the device connection
    return () => {
      isReading = false;
      if (myDevice) {
        myDevice.close().catch(console.error);
      }
    };
  }, [isOpen, isScanning]);

  const startScanning = () => {
    setIsScanning(true);
    setCardData(null);
  };

  const getErrorMessage = (cardNumber: string) => {
    switch (cardNumber) {
      case 'NO_DEVICE':
        return 'No card reader device found';
      case 'CONNECTION_ERROR':
        return 'Failed to connect to card reader';
      case 'READ_ERROR':
        return 'Error reading card data';
      default:
        return 'Unknown error occurred';
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
    setCardData(null);
  };

  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CreditCard className="h-4 w-4" />
          Scan ID Card
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            ID Card Scanner
          </DialogTitle>
          <DialogDescription>Scan ID cards using the connected card reader device</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Scan Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                {isScanning ? (
                  <div className="space-y-3">
                    <div className="animate-pulse">
                      <CreditCard className="h-12 w-12 mx-auto text-blue-500" />
                    </div>
                    <p className="text-sm text-muted-foreground">Scanning... Please swipe your ID card</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse w-1/2"></div>
                    </div>
                  </div>
                ) : cardData ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      {cardData.status === 'success' ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <AlertCircle className="h-8 w-8 text-red-500" />
                      )}
                    </div>

                    {cardData.status === 'success' ? (
                      <div className="space-y-2">
                        <Badge variant="secondary" className="text-xs">
                          CARD DETECTED
                        </Badge>
                        <p className="font-mono text-lg font-semibold">{formatCardNumber(cardData.cardNumber)}</p>
                        <p className="text-xs text-muted-foreground">
                          Scanned at {cardData.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Badge variant="destructive" className="text-xs">
                          SCAN ERROR
                        </Badge>
                        <p className="text-sm text-muted-foreground">{getErrorMessage(cardData.cardNumber)}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="text-sm text-muted-foreground">
                      {cardData?.status === 'error' ? 'Ready to scan ID card' : 'Please swipe your ID card'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={startScanning} disabled={isScanning} className="flex-1">
              {isScanning ? 'Scanning...' : 'Start Scan'}
            </Button>
            {scanHistory.length > 0 && (
              <Button variant="outline" onClick={clearHistory}>
                Clear
              </Button>
            )}
          </div>

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Recent Scans</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {scanHistory.map((scan, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                      <div className="flex items-center gap-2">
                        {scan.status === 'success' ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className="font-mono text-xs">
                          {scan.status === 'success'
                            ? formatCardNumber(scan.cardNumber).substring(0, 12) + '...'
                            : 'ERROR'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{scan.timestamp.toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IDCardScannerDialog;
