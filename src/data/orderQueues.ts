import { OrderQueue, OrderStatus } from '@/types';

export const mockOrderQueues: OrderQueue[] = [
  {
    id: "1",
    orderNumber: "ORD-2023-001",
    customerName: "John Smith",
    datetime: "2023-08-12 09:15 AM",
    status: "ready-to-serve",
    items: 3,
    tableNumber: "Table 5A"
  },
  {
    id: "2",
    orderNumber: "ORD-2023-002",
    customerName: "Sarah Johnson",
    datetime: "2023-08-12 09:25 AM",
    status: "on-cooking",
    items: 4,
    tableNumber: "Table 3B"
  },
  {
    id: "3",
    orderNumber: "ORD-2023-003",
    customerName: "Michael Wong",
    datetime: "2023-08-12 09:30 AM",
    status: "pending-payment",
    items: 2,
    tableNumber: "Table 2C"
  },
  {
    id: "4",
    orderNumber: "ORD-2023-004",
    customerName: "Emily Chen",
    datetime: "2023-08-12 09:40 AM",
    status: "completed",
    items: 5,
    tableNumber: "Table 7A"
  },
  {
    id: "5",
    orderNumber: "ORD-2023-005",
    customerName: "David Lee",
    datetime: "2023-08-12 09:50 AM",
    status: "cancelled",
    items: 1,
    tableNumber: "Table 1D"
  },
  {
    id: "6",
    orderNumber: "ORD-2023-006",
    customerName: "Jessica Thompson",
    datetime: "2023-08-12 10:05 AM",
    status: "on-cooking",
    items: 3,
    tableNumber: "Table 4B"
  },
  {
    id: "7",
    orderNumber: "ORD-2023-007",
    customerName: "Robert Wilson",
    datetime: "2023-08-12 10:15 AM",
    status: "ready-to-serve",
    items: 2,
    tableNumber: "Table 6C"
  }
];

// Helper function to get order queues filtered by status
export function getOrderQueuesByStatus(status?: OrderStatus | null): OrderQueue[] {
  if (!status) return mockOrderQueues;
  return mockOrderQueues.filter(order => order.status === status);
}