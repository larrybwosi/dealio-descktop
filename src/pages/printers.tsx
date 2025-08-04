'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Printer, Check, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Printer as PrinterType } from '@/types/printer';
import { usePrinterStore } from '@/store/printer-store';
import { getPrinters } from 'tauri-plugin-printer-v2';


const getPrinterStatusText = (status: number): string => {
  switch (status) {
    case 0:
      return 'Ready';
    case 1:
      return 'Paused';
    case 2:
      return 'Error';
    case 3:
      return 'Pending Deletion';
    case 4:
      return 'Paper Jam';
    case 5:
      return 'Paper Out';
    case 6:
      return 'Manual Feed';
    case 7:
      return 'Paper Problem';
    case 8:
      return 'Offline';
    case 9:
      return 'IO Active';
    case 10:
      return 'Busy';
    case 11:
      return 'Printing';
    default:
      return 'Unknown';
  }
};

const getPrinterStatusVariant = (status: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 0:
      return 'default';
    case 2:
      return 'destructive';
    case 8:
      return 'secondary';
    default:
      return 'outline';
  }
};

const PrinterCard = ({ printer }: { printer: PrinterType }) => {
  const { defaultPrinter, setDefaultPrinter } = usePrinterStore();
  const isDefault = defaultPrinter === printer.Name;
  const statusText = getPrinterStatusText(printer.PrinterStatus);
  const statusVariant = getPrinterStatusVariant(printer.PrinterStatus);

  return (
    <Card className={`transition-all duration-200 ${isDefault ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{printer.Name}</CardTitle>
            {isDefault && (
              <Badge variant="default" className="ml-2">
                <Check className="h-3 w-3 mr-1" />
                Default
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {printer.PrinterStatus === 8 ? (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Wifi className="h-4 w-4 text-green-500" />
            )}
            <Badge variant={statusVariant}>{statusText}</Badge>
          </div>
        </div>
        <CardDescription>{printer.DriverName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Port:</span>
            <span className="font-mono">{printer.PortName}</span>
          </div>
          <div className="flex justify-between">
            <span>Jobs in queue:</span>
            <span className={printer.JobCount > 0 ? 'text-orange-600 font-medium' : ''}>{printer.JobCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Shared:</span>
            <span>{printer.Shared ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between">
            <span>Priority:</span>
            <span>{printer.Priority}</span>
          </div>
        </div>

        <div className="mt-4">
          <Button
            onClick={() => setDefaultPrinter(printer.Name)}
            variant={isDefault ? 'secondary' : 'outline'}
            className="w-full"
            disabled={isDefault}
          >
            {isDefault ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Current Default
              </>
            ) : (
              'Set as Default'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function PrintersPage() {
  const { printers, isLoading, error, defaultPrinter, setPrinters, setLoading, setError, clearError } =
    usePrinterStore();

  const loadPrinters = async () => {
    try {
      setLoading(true);
      clearError();
      const printerList = await getPrinters();
      setPrinters(printerList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load printers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrinters();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Printer Settings</h1>
        <p className="text-muted-foreground">
          Manage your printers and set your default printer for printing documents.
        </p>
      </div>

      {defaultPrinter && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>{defaultPrinter}</strong> is set as your default printer.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Available Printers</h2>
        <Button onClick={loadPrinters} variant="outline" disabled={isLoading} className="min-w-[120px]">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            'Refresh'
          )}
        </Button>
      </div>

      {isLoading && printers.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading printers...</span>
        </div>
      ) : printers.length === 0 ? (
        <div className="text-center py-12">
          <Printer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No printers found</h3>
          <p className="text-muted-foreground mb-4">No printers are currently available on this system.</p>
          <Button onClick={loadPrinters} variant="outline">
            Try Again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {printers.map(printer => (
            <PrinterCard key={printer.Name} printer={printer} />
          ))}
        </div>
      )}
    </div>
  );
}
