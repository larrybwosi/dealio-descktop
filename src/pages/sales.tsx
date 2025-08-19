'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import * as XLSX from 'xlsx';

// Optimized icon imports
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Search,
  Calendar,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  RefreshCw,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Menu,
  X,
  AlertCircle,
  BarChart3,
  PieChart,
  Settings,
  Filter,
  Activity,
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Store and utilities
import { useOrgStore } from '@/lib/tanstack-axios';
import api from '@/lib/axios';
import { useFormattedCurrency } from '@/lib/utils';

// --- TYPE DEFINITIONS ---
interface Customer {
  id: string;
  name: string;
}

interface Sale {
  id: string;
  saleNumber: string;
  saleDate: string;
  customer: Customer;
  totalAmount: number;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'MOBILE_MONEY';
  paymentStatus: 'PAID' | 'PENDING' | 'PARTIAL' | 'CANCELLED';
  profit: number;
}

interface SalesResponse {
  sales: Sale[];
  totalCount: number;
}

interface SalesSummary {
  totalRevenue: number;
  totalProfit: number;
  totalTax: number;
  totalDiscount: number;
  salesCount: number;
  itemsSold: number;
  uniqueCustomers: number;
  averageSaleValue: number;
  salesGrowth: number;
}

// --- API FETCHING FUNCTIONS ---
/**
 * Fetches the sales summary from the API.
 * @param organizationId - The ID of the organization.
 * @param dateRange - The date range filter.
 */
const fetchSalesSummary = async (organizationId: string, dateRange: string): Promise<SalesSummary> => {
  const { data } = await api.get(`/api/organizations/${organizationId}/sales/summary`, {
    params: { dateRange: dateRange === 'all' ? undefined : dateRange },
  });
  return data;
};

/**
 * Fetches the list of sales with filters and pagination.
 * @param organizationId - The ID of the organization.
 * @param params - An object containing filters like search, page, pageSize, etc.
 */
const fetchSales = async (organizationId: string, params: Record<string, any>): Promise<SalesResponse> => {
  // Remove undefined/null filters before sending
  Object.keys(params).forEach(key => (params[key] === undefined || params[key] === null) && delete params[key]);
  const { data } = await api.get(`/api/organizations/${organizationId}/sales`, { params });
  return data;
};

const fetchAllSales = async (organizationId: string, filters: Record<string, any>): Promise<Sale[]> => {
  const params = {
    ...filters,
    page: 1,
    pageSize: 10000,
  };
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== 'all')
  );
  const { data } = await api.get(`/api/organizations/${organizationId}/sales`, { params: cleanParams });
  return data.sales;
};

// --- HELPER FUNCTIONS ---
const getStatusColor = (status: Sale['paymentStatus']) => {
  const colors = {
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    PARTIAL: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  };
  return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
};

const getPaymentMethodIcon = (method: Sale['paymentMethod']) => {
  const icons = {
    CASH: '💵',
    CREDIT_CARD: '💳',
    BANK_TRANSFER: '🏦',
    MOBILE_MONEY: '📱',
  };
  return icons[method] || '💰';
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// Excel export function
const exportToExcel = async (
  organizationId: string,
  filters: Record<string, any>,
  summaryData: SalesSummary | undefined
) => {
  try {
    const allSales = await fetchAllSales(organizationId, {
      search: filters.search,
      paymentMethod: filters.paymentMethod === 'all' ? undefined : filters.paymentMethod,
      paymentStatus: filters.paymentStatus === 'all' ? undefined : filters.paymentStatus,
      dateRange: filters.dateRange === 'all' ? undefined : filters.dateRange,
    });

    const workbook = XLSX.utils.book_new();
    const salesData = allSales.map((sale, index) => ({
      'Row #': index + 1,
      'Sale Number': sale.saleNumber,
      Date: new Date(sale.saleDate).toLocaleDateString(),
      Time: new Date(sale.saleDate).toLocaleTimeString(),
      Customer: sale.customer?.name || 'N/A',
      'Total Amount': sale.totalAmount,
      Profit: sale.profit,
      'Payment Method': sale.paymentMethod.replace('_', ' '),
      'Payment Status': sale.paymentStatus,
    }));

    const salesWorksheet = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(workbook, salesWorksheet, 'Sales Data');

    if (summaryData) {
      const summaryWorksheet = XLSX.utils.json_to_sheet([
        { Metric: 'Total Revenue', Value: summaryData.totalRevenue },
        { Metric: 'Total Profit', Value: summaryData.totalProfit },
        { Metric: 'Total Tax', Value: summaryData.totalTax },
        { Metric: 'Total Discount', Value: summaryData.totalDiscount },
        { Metric: 'Sales Count', Value: summaryData.salesCount },
        { Metric: 'Items Sold', Value: summaryData.itemsSold },
        { Metric: 'Unique Customers', Value: summaryData.uniqueCustomers },
        { Metric: 'Average Sale Value', Value: summaryData.averageSaleValue },
        { Metric: 'Sales Growth (%)', Value: summaryData.salesGrowth },
      ]);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `sales-report-${timestamp}.xlsx`;
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

// --- MAIN COMPONENT ---
const SalesDashboard = () => {
  const [filters, setFilters] = useState({
    paymentMethod: 'all',
    paymentStatus: 'all',
    dateRange: 'this_month',
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { organizationId } = useOrgStore();
  const formatCurrency = useFormattedCurrency();

  // Search with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Memoized query params
  const queryParams = useMemo(
    () => ({
      page,
      pageSize,
      search: debouncedSearchTerm,
      paymentMethod: filters.paymentMethod,
      paymentStatus: filters.paymentStatus,
      dateRange: filters.dateRange,
    }),
    [page, pageSize, debouncedSearchTerm, filters]
  );

  // Queries
  // Query for Sales Summary
  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    isError: isErrorSummary,
  } = useQuery<SalesSummary>({
    queryKey: ['salesSummary', organizationId, filters.dateRange],
    queryFn: () => fetchSalesSummary(organizationId, filters.dateRange),
  });

  // Query for Sales List
  const {
    data: salesData,
    isLoading: isLoadingSales,
    isError: isErrorSales,
  } = useQuery<SalesResponse>({
    queryKey: [
      'sales',
      organizationId,
      page,
      pageSize,
      debouncedSearchTerm,
      filters.paymentMethod,
      filters.paymentStatus,
      filters.dateRange,
    ],
    queryFn: () =>
      fetchSales(organizationId, {
        page,
        pageSize,
        search: debouncedSearchTerm,
        paymentMethod: filters.paymentMethod === 'all' ? undefined : filters.paymentMethod,
        paymentStatus: filters.paymentStatus === 'all' ? undefined : filters.paymentStatus,
        dateRange: filters.dateRange === 'all' ? undefined : filters.dateRange,
      }),
  });

  // Derived values
  const sales = salesData?.sales || [];
  const totalCount = salesData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Handlers
  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      paymentMethod: 'all',
      paymentStatus: 'all',
      dateRange: 'this_month',
    });
    setSearchTerm('');
    setPage(1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      await exportToExcel(
        organizationId,
        {
          search: debouncedSearchTerm,
          ...filters,
        },
        summaryData
      );
    } catch (error) {
      setExportError('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    // refetchSummary();
    // refetchSales();
  };

  // Optimized pagination range
  const getPaginationRange = () => {
    const range = [];
    const maxVisiblePages = 5;
    let start = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col md:flex-row">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white/90 backdrop-blur-sm shadow-lg border-0"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
        fixed md:sticky top-0 left-0 w-80 h-screen bg-white/95 backdrop-blur-sm shadow-xl border-r border-gray-200/50 
        transition-transform duration-300 ease-in-out z-40
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        <div className="h-full overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg mr-3">
                <Filter className="h-5 w-5 text-white" />
              </div>
              Filters & Controls
            </h2>
            <p className="text-sm text-gray-600">Refine your sales data view</p>
          </div>

          <Separator />

          {/* Search */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <Search className="h-4 w-4 mr-2 text-gray-500" />
              Search Sales
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Customer name or sale number..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              Date Range
            </label>
            <Select value={filters.dateRange} onValueChange={value => handleFilterChange('dateRange', value)}>
              <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="last_week">Last Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Filter */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <Activity className="h-4 w-4 mr-2 text-gray-500" />
              Payment Status
            </label>
            <Select value={filters.paymentStatus} onValueChange={value => handleFilterChange('paymentStatus', value)}>
              <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PAID">✅ Paid</SelectItem>
                <SelectItem value="PENDING">⏳ Pending</SelectItem>
                <SelectItem value="PARTIAL">🔄 Partial</SelectItem>
                <SelectItem value="CANCELLED">❌ Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method Filter */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
              Payment Method
            </label>
            <Select value={filters.paymentMethod} onValueChange={value => handleFilterChange('paymentMethod', value)}>
              <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500">
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="CASH">💵 Cash</SelectItem>
                <SelectItem value="CREDIT_CARD">💳 Credit Card</SelectItem>
                <SelectItem value="BANK_TRANSFER">🏦 Bank Transfer</SelectItem>
                <SelectItem value="MOBILE_MONEY">📱 Mobile Money</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button variant="outline" onClick={clearFilters} className="w-full border-gray-200 hover:bg-gray-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>

            <Button onClick={handleRefresh} variant="outline" className="w-full border-gray-200 hover:bg-gray-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>

            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
            >
              {isExporting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 mr-2" />
              )}
              {isExporting ? 'Exporting...' : 'Export to Excel'}
            </Button>
          </div>

          {/* Export Error Alert */}
          {exportError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700 text-sm">{exportError}</AlertDescription>
            </Alert>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <header className="text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                    Sales Dashboard
                  </h1>
                  <p className="text-gray-600 mt-2">Comprehensive sales analytics for organization {organizationId}</p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" size="sm" className="border-gray-200">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-200">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </header>

            {/* Summary Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {isLoadingSummary ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <Skeleton className="h-8 w-full mb-2" />
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))
              ) : isErrorSummary ? (
                <Alert className="border-red-200 bg-red-50 col-span-4">
                  <AlertDescription className="text-red-700">
                    Error loading summary data. Please try refreshing.
                  </AlertDescription>
                </Alert>
              ) : (
                summaryData && (
                  <>
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Total Revenue</CardTitle>
                        <div className="p-2 bg-green-500 rounded-lg">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-900">
                          {formatCurrency(summaryData.totalRevenue)}
                        </div>
                        <p className="text-xs text-green-600 flex items-center mt-2">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          <span className={summaryData.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {summaryData.salesGrowth >= 0 ? '+' : ''}
                            {summaryData.salesGrowth}%
                          </span>
                          <span className="text-green-600 ml-1">vs previous period</span>
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">Total Profit</CardTitle>
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-900">
                          {formatCurrency(summaryData.totalProfit)}
                        </div>
                        <p className="text-xs text-blue-600 mt-2">Net profit from sales</p>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all duration-300">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700">Sales Count</CardTitle>
                        <div className="p-2 bg-purple-500 rounded-lg">
                          <ShoppingCart className="h-4 w-4 text-white" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-900">
                          {summaryData.salesCount.toLocaleString()}
                        </div>
                        <p className="text-xs text-purple-600 mt-2">Total transactions recorded</p>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-xl transition-all duration-300">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-700">Unique Customers</CardTitle>
                        <div className="p-2 bg-orange-500 rounded-lg">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-900">
                          {summaryData.uniqueCustomers.toLocaleString()}
                        </div>
                        <p className="text-xs text-orange-600 mt-2">Customers who made a purchase</p>
                      </CardContent>
                    </Card>
                  </>
                )
              )}
            </section>

            {/* Sales Table */}
            <section>
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-xl text-gray-900">Recent Sales</CardTitle>
                      <CardDescription className="text-gray-600">
                        {totalCount.toLocaleString()} total sales • Showing {sales.length} of{' '}
                        {totalCount.toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 mt-3 md:mt-0">
                      <Select value={pageSize.toString()} onValueChange={value => setPageSize(Number(value))}>
                        <SelectTrigger className="w-20 bg-white border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-gray-500">per page</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50">
                          <TableHead className="font-semibold text-gray-700">
                            <Button variant="ghost" size="sm" className="h-8 p-0 font-semibold text-gray-700">
                              Sale ID <ArrowUpDown className="ml-1 h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            <Button variant="ghost" size="sm" className="h-8 p-0 font-semibold text-gray-700">
                              Date & Time <ArrowUpDown className="ml-1 h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">Customer</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-right">
                            <Button variant="ghost" size="sm" className="h-8 p-0 font-semibold text-gray-700">
                              Amount <ArrowUpDown className="ml-1 h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700 text-right">Profit</TableHead>
                          <TableHead className="font-semibold text-gray-700">Payment</TableHead>
                          <TableHead className="font-semibold text-gray-700">Status</TableHead>
                          <TableHead className="font-semibold text-gray-700 w-16">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingSales ? (
                          Array.from({ length: pageSize }).map((_, i) => (
                            <TableRow key={i} className="hover:bg-gray-50/50">
                              <TableCell>
                                <Skeleton className="h-5 w-20" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-5 w-32" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-5 w-24" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-5 w-20" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-5 w-20" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-5 w-24" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-5 w-20" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-5 w-16" />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : isErrorSales ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12">
                              <div className="flex flex-col items-center space-y-3">
                                <div className="p-3 bg-red-100 rounded-full">
                                  <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <p className="text-red-600 font-medium">Error loading sales data</p>
                                <Button onClick={handleRefresh} variant="outline" size="sm">
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Try Again
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : sales.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12">
                              <div className="flex flex-col items-center space-y-3">
                                <div className="p-3 bg-gray-100 rounded-full">
                                  <Search className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">No sales found</p>
                                <p className="text-gray-400 text-sm">Try adjusting your filters or search terms</p>
                                <Button onClick={clearFilters} variant="outline" size="sm">
                                  Clear Filters
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          sales.map(sale => (
                            <TableRow
                              key={sale.id}
                              className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
                            >
                              <TableCell className="font-mono text-sm font-medium text-blue-600">
                                {sale.saleNumber}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900">
                                    {new Date(sale.saleDate).toLocaleDateString()}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(sale.saleDate).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {sale.customer?.name?.charAt(0) || '?'}
                                  </div>
                                  <span className="font-medium text-gray-900">
                                    {sale.customer?.name || 'Unknown Customer'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-bold text-gray-900">{formatCurrency(sale.totalAmount)}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-medium text-emerald-600">+{formatCurrency(sale.profit)}</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">{getPaymentMethodIcon(sale.paymentMethod)}</span>
                                  <span className="text-sm text-gray-600">{sale.paymentMethod.replace('_', ' ')}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`${getStatusColor(sale.paymentStatus)} font-medium`}
                                >
                                  {sale.paymentStatus}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-gray-50/50 border-t">
                  <div className="text-sm text-gray-600 mb-4 md:mb-0">
                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of{' '}
                    {totalCount.toLocaleString()} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(1)}
                      disabled={page <= 1}
                      className="border-gray-200"
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p - 1)}
                      disabled={page <= 1}
                      className="border-gray-200"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {getPaginationRange().map(pageNum => (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 ${
                            page === pageNum ? 'bg-blue-600 text-white' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= totalPages}
                      className="border-gray-200"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(totalPages)}
                      disabled={page >= totalPages}
                      className="border-gray-200"
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </Card>
            </section>

            {/* Additional Stats Cards */}
            {summaryData && (
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-teal-700 flex items-center">
                      <PieChart className="h-4 w-4 mr-2" />
                      Average Sale Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-teal-900">
                      {formatCurrency(summaryData.averageSaleValue)}
                    </div>
                    <p className="text-xs text-teal-600 mt-2">Per transaction</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-purple-50 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-violet-700 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Items Sold
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-violet-900">{summaryData.itemsSold.toLocaleString()}</div>
                    <p className="text-xs text-violet-600 mt-2">Total units moved</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-50 to-pink-50 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-rose-700 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Total Discounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-rose-900">{formatCurrency(summaryData.totalDiscount)}</div>
                    <p className="text-xs text-rose-600 mt-2">Customer savings</p>
                  </CardContent>
                </Card>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalesDashboard;
