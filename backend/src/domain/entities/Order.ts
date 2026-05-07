export type OrderStatus = 'new' | 'processing' | 'completed' | 'cancelled';

export interface OrderItem {
  id: number;
  orderId: number;
  product: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  customerId: number;
  customerName?: string;
  assignedTo: number | null;
  totalAmount: number;
  status: OrderStatus;
  notes: string | null;
  orderedAt: Date;
  updatedAt: Date;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
}

export const calculateOrderTotal = (
  items: Array<Pick<OrderItem, 'quantity' | 'unitPrice'>>
) => items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
