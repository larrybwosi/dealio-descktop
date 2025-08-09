import { useState, useEffect } from 'react';
import {
  RefreshCw,
  Clock,
  AlertTriangle,
  Trash2,
  Upload,
  WifiOff,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  Wifi,
} from 'lucide-react';
import { getPendingSales, removePendingSale, useRetryPendingSales } from '@/lib/services/sales';

interface PendingSale {
  id: string;
  data: unknown;
  organizationId: string;
  timestamp: number;
  retryCount: number;
}

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

const formatTimeAgo = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

export default function PendingOrdersPage() {
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedSales, setSelectedSales] = useState<Set<string>>(new Set());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const { retryAllPendingSales } = useRetryPendingSales();

  // Refresh pending sales data
  const refreshData = () => {
    setPendingSales(getPendingSales());
  };

  useEffect(() => {
    refreshData();

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Refresh data periodically
    const interval = setInterval(refreshData, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleRetryAll = async () => {
    setIsRetrying(true);
    try {
      await retryAllPendingSales();
      setTimeout(refreshData, 1000); // Refresh after retry
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDeleteSale = (saleId: string) => {
    removePendingSale(saleId);
    refreshData();
  };

  const handleSelectAll = () => {
    if (selectedSales.size === pendingSales.length) {
      setSelectedSales(new Set());
    } else {
      setSelectedSales(new Set(pendingSales.map(sale => sale.id)));
    }
  };

  const handleSelectSale = (saleId: string) => {
    const newSelected = new Set(selectedSales);
    if (newSelected.has(saleId)) {
      newSelected.delete(saleId);
    } else {
      newSelected.add(saleId);
    }
    setSelectedSales(newSelected);
  };

  const handleDeleteSelected = () => {
    selectedSales.forEach(saleId => removePendingSale(saleId));
    setSelectedSales(new Set());
    refreshData();
  };

  const getStatusConfig = (retryCount: number) => {
    if (retryCount === 0) {
      return {
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Clock,
        text: 'Pending',
      };
    }
    if (retryCount < 3) {
      return {
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: AlertCircle,
        text: `Retried ${retryCount}x`,
      };
    }
    return {
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: XCircle,
      text: 'Failed',
    };
  };

  const handleGoBack = () => {
    // You can replace this with your navigation logic
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left section with back button and title */}
            <div className="flex items-center space-x-6">
              <button
                onClick={handleGoBack}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all duration-200 hover:scale-105"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  {pendingSales.length > 0 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{pendingSales.length}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Pending Orders
                  </h1>
                  <p className="text-slate-600 mt-1 font-medium">
                    {pendingSales.length === 0
                      ? 'All orders synchronized'
                      : `${pendingSales.length} order${pendingSales.length !== 1 ? 's' : ''} waiting to sync`}
                  </p>
                </div>
              </div>
            </div>

            {/* Right section with status and actions */}
            <div className="flex items-center space-x-4">
              {/* Enhanced Online/Offline Status */}
              <div
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  isOnline
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                    : 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
                }`}
              >
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                <span className="text-sm">{isOnline ? 'Connected' : 'Offline'}</span>
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={refreshData}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all duration-200 hover:scale-105"
                  title="Refresh data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleRetryAll}
                  disabled={isRetrying || pendingSales.length === 0 || !isOnline}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-400 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl disabled:shadow-none hover:scale-105 disabled:scale-100"
                >
                  <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                  <span>{isRetrying ? 'Syncing...' : 'Sync All'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Bulk Actions */}
        {selectedSales.size > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-5 mb-8 animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-semibold text-slate-800">
                  {selectedSales.size} order{selectedSales.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <button
                onClick={handleDeleteSelected}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Orders List */}
        {pendingSales.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/60 p-16 text-center">
            <div className="relative mx-auto mb-8 w-24 h-24">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm">✨</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Perfect! All caught up</h3>
            <p className="text-slate-600 text-lg max-w-md mx-auto leading-relaxed">
              No pending orders to sync at the moment. All your sales data is up to date.
            </p>
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
            {/* Enhanced Table Header */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60 px-8 py-5">
              <div className="flex items-center space-x-6">
                <input
                  type="checkbox"
                  checked={selectedSales.size === pendingSales.length && pendingSales.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                />
                <div className="grid grid-cols-12 gap-6 w-full text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  <div className="col-span-3">Order Details</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-3">Created</div>
                  <div className="col-span-2">Last Attempt</div>
                  <div className="col-span-1">Retries</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
            </div>

            {/* Enhanced Table Body */}
            <div className="divide-y divide-slate-200/60">
              {pendingSales.map((sale, index) => {
                const statusConfig = getStatusConfig(sale.retryCount);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={sale.id}
                    className={`px-8 py-6 hover:bg-slate-50/50 transition-all duration-200 ${
                      selectedSales.has(sale.id) ? 'bg-blue-50/50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-6">
                      <input
                        type="checkbox"
                        checked={selectedSales.has(sale.id)}
                        onChange={() => handleSelectSale(sale.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                      />

                      <div className="grid grid-cols-12 gap-6 w-full items-center">
                        {/* Order Details */}
                        <div className="col-span-3">
                          <div className="font-mono text-sm font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg inline-block">
                            {sale.id}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">Organization: {sale.organizationId}</div>
                        </div>

                        {/* Enhanced Status */}
                        <div className="col-span-2">
                          <div
                            className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium border ${statusConfig.color}`}
                          >
                            <StatusIcon className="w-4 h-4" />
                            <span>{statusConfig.text}</span>
                          </div>
                        </div>

                        {/* Created */}
                        <div className="col-span-3">
                          <div className="text-sm font-medium text-slate-900">{formatTimestamp(sale.timestamp)}</div>
                          <div className="text-xs text-slate-500 font-medium">{formatTimeAgo(sale.timestamp)}</div>
                        </div>

                        {/* Last Retry */}
                        <div className="col-span-2">
                          <div className="text-sm font-medium text-slate-700">
                            {sale.retryCount > 0 ? formatTimeAgo(sale.timestamp) : 'Never attempted'}
                          </div>
                        </div>

                        {/* Attempts */}
                        <div className="col-span-1">
                          <div className="flex items-center space-x-1">
                            <div className="flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded-lg">
                              <span className="text-sm font-bold text-slate-900">{sale.retryCount}</span>
                              <span className="text-xs text-slate-500 font-medium">/3</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1">
                          <button
                            onClick={() => handleDeleteSale(sale.id)}
                            className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                            title="Delete order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Enhanced Footer Info */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm text-blue-800">
              <h4 className="font-bold text-base mb-2">How Pending Orders Work</h4>
              <p className="leading-relaxed">
                Orders that fail to sync are automatically stored locally and will be retried when you're back online.
                The system attempts up to 3 retries with exponential backoff. Orders that fail all attempts require
                manual attention.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
