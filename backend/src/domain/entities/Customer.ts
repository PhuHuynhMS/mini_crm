export type CustomerStatus = 'active' | 'inactive';

export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: CustomerStatus;
  assignedTo: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecentCustomerOrder {
  id: number;
  totalAmount: number;
  status: string;
  orderedAt: Date;
}

export interface CustomerDetail extends Customer {
  recentOrders: RecentCustomerOrder[];
}
