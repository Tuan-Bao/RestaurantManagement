export interface OrderItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: "pending" | "preparing" | "ready" | "served" | "cancelled";
  specialInstructions?: string;
  estimatedTime?: number; // minutes
}

export interface Order {
  id: number;
  orderNumber: string;
  tableId: number;
  tableName: string;
  floorId: number;
  floorName: string;
  customerId?: number;
  customerName?: string;
  items: OrderItem[];
  status: "active" | "completed" | "cancelled";
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  estimatedCompletionTime?: string;
}

export interface Floor {
  id: number;
  name: string;
  orders: Order[];
}
