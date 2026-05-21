export type TableStatus = 'libre' | 'ocupada' | 'reservada';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
}

export type OrderStatus = 'pendiente' | 'preparando' | 'listo' | 'servido' | 'pagado';

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
  price: number; // Price at the moment of order
}

export interface Order {
  id: string;
  tableId: string;
  tableName: string; // e.g. "Mesa 5"
  items: OrderItem[];
  status: OrderStatus;
  waiterId: string; // Mesero
  chefId: string; // Cocinero/Chef
  subtotal: number;
  tip: number; // Propina
  total: number;
  createdAt: string;
  paidAt?: string;
  paymentMethod?: 'efectivo' | 'tarjeta' | 'transferencia';
  customerId?: string;
}

export type MenuItemCategory = 'entradas' | 'fuertes' | 'bebidas' | 'postres';

export interface MenuItemRecipeIngredient {
  inventoryItemId: string;
  amountNeeded: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: MenuItemCategory;
  price: number;
  description: string;
  recipe: MenuItemRecipeIngredient[]; // Connects menu item to inventory reduction
  available: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string; // e.g., "kg", "litros", "piezas"
  minQuantity: number; // Warning limit
  cost: number; // Cost of purchase
}

export type StaffRole = 'chef' | 'mesero' | 'administrador' | 'cajero';

export interface StaffSchedule {
  day: string; // e.g. "Lunes", "Martes"
  shift: string; // e.g. "08:00 - 16:00"
}

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  phone: string;
  status: 'activo' | 'inactivo';
  schedule: StaffSchedule[];
  password?: string; // PIN o contraseña de acceso
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  visits: number;
  notes?: string;
  favoriteTableNumber?: number;
}
