import { mockProducts } from '@/data/products';
import { mockOrderQueues } from '@/data/orderQueues';
import { Product, OrderStatus, OrderQueue } from '@/types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API service for products
export const ProductsApi = {
  async getProducts(): Promise<Product[]> {
    // Simulate API delay
    await delay(800);
    return mockProducts;
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    // Simulate API delay
    await delay(600);
    
    if (category === 'All') {
      return mockProducts;
    }
    
    return mockProducts.filter(product => product.category === category);
  },

  async getProductById(id: string): Promise<Product | undefined> {
    // Simulate API delay
    await delay(400);
    return mockProducts.find(product => product.id === id);
  }
};

// API service for order queues
export const OrdersApi = {
  async getOrderQueues(): Promise<OrderQueue[]> {
    // Simulate API delay
    await delay(800);
    return mockOrderQueues;
  },

  async getOrderQueuesByStatus(status: OrderStatus): Promise<OrderQueue[]> {
    // Simulate API delay
    await delay(600);
    return mockOrderQueues.filter(order => order.status === status);
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderQueue> {
    // Simulate API delay
    await delay(500);
    
    const order = mockOrderQueues.find(order => order.id === orderId);
    
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    
    // Update the order status (in a real app, this would be persisted to the database)
    order.status = status;
    
    return order;
  }
};