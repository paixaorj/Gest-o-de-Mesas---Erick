export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string; // Mudou para string dinâmica
  price: number;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: 'active' | 'standby' | 'completed';
  total: number;
  paymentMethod?: 'dinheiro' | 'cartao' | 'pix';
  createdAt: Date;
  completedAt?: Date;
}

export interface Table {
  id: string;
  number: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
}

export interface DailySummary {
  date: string;
  totalRevenue: number;
  completedOrders: number;
  paymentMethods: {
    dinheiro: number;
    cartao: number;
    pix: number;
  };
}