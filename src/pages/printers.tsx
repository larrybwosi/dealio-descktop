import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Printer,
  Check,
  AlertCircle,
  Wifi,
  WifiOff,
  ArrowLeft,
  RefreshCw,
  Settings,
  Share,
  Star,
  AlertTriangle,
} from 'lucide-react';
import { Printer as PrinterType } from '@/types/printer';
import { usePrinterStore } from '@/store/printer-store';
import { getPrinters } from 'tauri-plugin-printer-v2';
import { useNavigate } from 'react-router';

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
    case 4:
    case 5:
    case 7:
      return 'destructive';
    case 8:
      return 'secondary';
    case 11:
      return 'default';
    default:
      return 'outline';
  }
};

const getPrinterStatusColor = (status: number): string => {
  switch (status) {
    case 0:
      return 'text-emerald-600';
    case 2:
    case 4:
    case 5:
    case 7:
      return 'text-red-600';
    case 8:
      return 'text-slate-500';
    case 11:
      return 'text-blue-600';
    default:
      return 'text-amber-600';
  }
};

const PrinterCard = ({ printer }: { printer: PrinterType }) => {
  const { defaultPrinter, setDefaultPrinter } = usePrinterStore();
  const isDefault = defaultPrinter === printer.Name;
  const statusText = getPrinterStatusText(printer.PrinterStatus);
  const statusVariant = getPrinterStatusVariant(printer.PrinterStatus);
  const statusColor = getPrinterStatusColor(printer.PrinterStatus);
  const isOnline = printer.PrinterStatus !== 8;
  const hasIssues = [2, 4, 5, 7].includes(printer.PrinterStatus);

  return (
    <Card
      className={`group transition-all duration-300 hover:shadow-lg border-0 shadow-sm ${
        isDefault
          ? 'ring-2 ring-blue-500/20 bg-gradient-to-br from-blue-50/50 to-indigo-50/30'
          : 'hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl transition-colors ${
                isDefault ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
              }`}
            >
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 leading-tight">{printer.Name}</CardTitle>
              <CardDescription className="text-sm text-slate-500 mt-1">{printer.DriverName}</CardDescription>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {isDefault && (
              <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-0">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Default
              </Badge>
            )}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-emerald-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-slate-400" />
              )}
              <Badge variant={statusVariant} className={`${statusColor} border-0 font-medium`}>
                {hasIssues && <AlertTriangle className="h-3 w-3 mr-1" />}
                {statusText}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Separator className="opacity-50" />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-600">
              <Settings className="h-4 w-4 text-slate-400" />
              <span className="font-medium">Port:</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              {/* <Queue className="h-4 w-4 text-slate-400" /> */}
              <span className="font-medium">Queue:</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-right">
              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                {printer.PortName}
              </span>
            </div>
            <div className="text-right">
              <span className={`font-semibold ${printer.JobCount > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                {printer.JobCount} jobs
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Share className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs">{printer.Shared ? 'Shared' : 'Local'}</span>
            </div>
            <div className="text-xs text-slate-500">Priority: {printer.Priority}</div>
          </div>
        </div>

        <Separator className="opacity-50" />

        <Button
          onClick={() => setDefaultPrinter(printer.Name)}
          variant={isDefault ? 'secondary' : 'outline'}
          className={`w-full transition-all duration-200 ${
            isDefault
              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200'
              : 'hover:bg-slate-50 hover:border-slate-300'
          }`}
          disabled={isDefault}
        >
          {isDefault ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Current Default
            </>
          ) : (
            <>
              <Star className="h-4 w-4 mr-2" />
              Set as Default
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default function PrintersPage() {
  const { printers, isLoading, error, defaultPrinter, setPrinters, setLoading, setError, clearError } =
    usePrinterStore();
  const navigate = useNavigate();

  const loadPrinters = async () => {
    try {
      setLoading(true);
      clearError();
      const printerList = await getPrinters();
      console.log('Printer list: ', JSON.parse(printerList));
      setPrinters(JSON.parse(printerList));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load printers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrinters();
  }, []);

  const activePrinters = printers.filter(p => p.PrinterStatus !== 8);
  const offlinePrinters = printers.filter(p => p.PrinterStatus === 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Printer Settings</h1>
              <p className="text-slate-600 mt-2">
                Manage your printers and configure your default printing preferences
              </p>
            </div>
          </div>
        </div>

        {/* Default Printer Alert */}
        {defaultPrinter && (
          <Alert className="mb-8 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
            <Check className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800 font-medium">
              <strong>{defaultPrinter}</strong> is configured as your default printer
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-8 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-semibold text-slate-900">Available Printers</h2>
            {printers.length > 0 && (
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  {activePrinters.length} Online
                </span>
                {offlinePrinters.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    {offlinePrinters.length} Offline
                  </span>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={loadPrinters}
            variant="outline"
            disabled={isLoading}
            className="min-w-[130px] border-slate-200 hover:bg-slate-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {/* Content */}
        {isLoading && printers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-slate-100 rounded-full mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Discovering Printers</h3>
            <p className="text-slate-600">Please wait while we scan for available printers...</p>
          </div>
        ) : printers.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto mb-6">
              <Printer className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">No Printers Found</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              We couldn't find any printers on this system. Make sure your printers are connected and drivers are
              installed.
            </p>
            <Button onClick={loadPrinters} variant="outline" className="min-w-[120px]">
              <RefreshCw className="h-4 w-4 mr-2" />
              Scan Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {printers.map(printer => (
              <PrinterCard key={printer.Name} printer={printer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
