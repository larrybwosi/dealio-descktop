import { useState, useEffect } from 'react';
import { RefreshCw, Clock, AlertTriangle, Trash2, Upload, WifiOff } from 'lucide-react';
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

  const getStatusColor = (retryCount: number) => {
    if (retryCount === 0) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (retryCount < 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusText = (retryCount: number) => {
    if (retryCount === 0) return 'Pending';
    if (retryCount < 3) return `Retried ${retryCount}x`;
    return 'Failed';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Pending Orders</h1>
                <p className="text-slate-600 mt-1">
                  {pendingSales.length} order{pendingSales.length !== 1 ? 's' : ''} waiting to sync
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Online/Offline Status */}
              <div
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium ${
                  isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {isOnline ? <Upload className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>

              <button
                onClick={refreshData}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                onClick={handleRetryAll}
                disabled={isRetrying || pendingSales.length === 0 || !isOnline}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Retrying...' : 'Retry All'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedSales.size > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                {selectedSales.size} order{selectedSales.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={handleDeleteSelected}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}

        {/* Orders List */}
        {pendingSales.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Upload className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">All caught up!</h3>
            <p className="text-slate-600">No pending orders to sync at the moment.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedSales.size === pendingSales.length && pendingSales.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="grid grid-cols-12 gap-4 w-full text-sm font-medium text-slate-700">
                  <div className="col-span-3">Order ID</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-3">Created</div>
                  <div className="col-span-2">Last Retry</div>
                  <div className="col-span-1">Attempts</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-200">
              {pendingSales.map((sale, index) => (
                <div
                  key={sale.id}
                  className={`px-6 py-4 hover:bg-slate-50 transition-colors ${
                    selectedSales.has(sale.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedSales.has(sale.id)}
                      onChange={() => handleSelectSale(sale.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />

                    <div className="grid grid-cols-12 gap-4 w-full">
                      {/* Order ID */}
                      <div className="col-span-3">
                        <div className="font-mono text-sm text-slate-900">{sale.id}</div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            sale.retryCount
                          )}`}
                        >
                          {getStatusText(sale.retryCount)}
                        </span>
                      </div>

                      {/* Created */}
                      <div className="col-span-3">
                        <div className="text-sm text-slate-900">{formatTimestamp(sale.timestamp)}</div>
                        <div className="text-xs text-slate-500">{formatTimeAgo(sale.timestamp)}</div>
                      </div>

                      {/* Last Retry */}
                      <div className="col-span-2">
                        <div className="text-sm text-slate-600">
                          {sale.retryCount > 0 ? formatTimeAgo(sale.timestamp) : 'Never'}
                        </div>
                      </div>

                      {/* Attempts */}
                      <div className="col-span-1">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium text-slate-900">{sale.retryCount}</span>
                          <span className="text-xs text-slate-500">/3</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1">
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Delete order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">About Pending Orders</p>
              <p>
                Orders that fail to sync are automatically stored locally and will be retried when you're back online.
                After 3 failed attempts, orders are marked as failed and require manual attention.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
