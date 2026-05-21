import { Table, MenuItem, InventoryItem, StaffMember, Customer, Order } from './types';

export const initialInventory: InventoryItem[] = [
  { id: 'inv-1', name: 'Filete de Res (Angus)', quantity: 15, unit: 'kg', minQuantity: 5, cost: 280 },
  { id: 'inv-2', name: 'Aguacate', quantity: 18, unit: 'kg', minQuantity: 4, cost: 65 },
  { id: 'inv-3', name: 'Jitomate', quantity: 25, unit: 'kg', minQuantity: 6, cost: 32 },
  { id: 'inv-4', name: 'Pechuga de Pollo', quantity: 12, unit: 'kg', minQuantity: 4, cost: 120 },
  { id: 'inv-5', name: 'Queso Mozzarella', quantity: 8, unit: 'kg', minQuantity: 3, cost: 140 },
  { id: 'inv-6', name: 'Café Espresso en grano', quantity: 5, unit: 'kg', minQuantity: 1.5, cost: 310 },
  { id: 'inv-7', name: 'Salmón Fresco', quantity: 6, unit: 'kg', minQuantity: 2.5, cost: 380 },
  { id: 'inv-8', name: 'Refrescos de Cola (355ml)', quantity: 48, unit: 'piezas', minQuantity: 12, cost: 12 },
  { id: 'inv-9', name: 'Cerveza Artesanal Clara', quantity: 36, unit: 'piezas', minQuantity: 10, cost: 28 },
  { id: 'inv-10', name: 'Pasta Fettuccine', quantity: 10, unit: 'kg', minQuantity: 3, cost: 45 },
];

export const initialMenuItems: MenuItem[] = [
  // Entradas
  {
    id: 'menu-1',
    name: 'Guacamole Tradicional con Totopos',
    category: 'entradas',
    price: 135,
    description: 'Preparado al momento con aguacate fresco, jitomate, cebolla, cilantro y un toque de limón.',
    recipe: [{ inventoryItemId: 'inv-2', amountNeeded: 0.25 }, { inventoryItemId: 'inv-3', amountNeeded: 0.1 }],
    available: true
  },
  {
    id: 'menu-2',
    name: 'Tacos de Filete con Queso (3 piezas)',
    category: 'entradas',
    price: 180,
    description: 'Filete Angus picado sobre tortillas de maíz con costra de queso mozzarella fundido.',
    recipe: [{ inventoryItemId: 'inv-1', amountNeeded: 0.15 }, { inventoryItemId: 'inv-5', amountNeeded: 0.08 }],
    available: true
  },
  
  // Fuertes
  {
    id: 'menu-3',
    name: 'Fettuccine Alfredo con Pollo',
    category: 'fuertes',
    price: 215,
    description: 'Pasta cremosa con salsa alfredo casera, tocino y pechuga de pollo a la parrilla.',
    recipe: [{ inventoryItemId: 'inv-10', amountNeeded: 0.12 }, { inventoryItemId: 'inv-4', amountNeeded: 0.15 }, { inventoryItemId: 'inv-5', amountNeeded: 0.05 }],
    available: true
  },
  {
    id: 'menu-4',
    name: 'Salmón Glaseado al Chipotle',
    category: 'fuertes',
    price: 310,
    description: 'Filete de salmón (220g) a la plancha con glaseado dulce de chipotle, servido con espárragos.',
    recipe: [{ inventoryItemId: 'inv-7', amountNeeded: 0.22 }],
    available: true
  },
  {
    id: 'menu-5',
    name: 'Corte Ribeye Premium a las Brasas',
    category: 'fuertes',
    price: 435,
    description: '350g de jugoso filete de res preparado al término preferido, con guarnición de papas gajo.',
    recipe: [{ inventoryItemId: 'inv-1', amountNeeded: 0.35 }],
    available: true
  },

  // Bebidas
  {
    id: 'menu-6',
    name: 'Refresco Botella',
    category: 'bebidas',
    price: 45,
    description: '355ml frío, variedad de sabores en lata o vidrio.',
    recipe: [{ inventoryItemId: 'inv-8', amountNeeded: 1 }],
    available: true
  },
  {
    id: 'menu-7',
    name: 'Cerveza de la Casa (Artesanal)',
    category: 'bebidas',
    price: 75,
    description: 'Cerveza artesanal elaborada localmente, refrescante y con notas cítricas.',
    recipe: [{ inventoryItemId: 'inv-9', amountNeeded: 1 }],
    available: true
  },
  {
    id: 'menu-8',
    name: 'Carajillo Shaker',
    category: 'bebidas',
    price: 125,
    description: 'Licor 43 combinado con una carga de espresso caliente recién extraído shakeado con hielo.',
    recipe: [{ inventoryItemId: 'inv-6', amountNeeded: 0.02 }],
    available: true
  },

  // Postres
  {
    id: 'menu-9',
    name: 'Volcán de Chocolate con Helado',
    category: 'postres',
    price: 110,
    description: 'Bizcocho relleno de chocolate líquido caliente, acompañado de helado artesanal de vainilla.',
    recipe: [],
    available: true
  },
  {
    id: 'menu-10',
    name: 'Cheesecake de Guayaba',
    category: 'postres',
    price: 95,
    description: 'Textura cremosa clásica de New York cheesecake coronada con un dulce compota de guayaba orgánica.',
    recipe: [],
    available: true
  }
];

export const initialTables: Table[] = [
  { id: 't-1', number: 1, capacity: 2, status: 'libre' },
  { id: 't-2', number: 2, capacity: 2, status: 'ocupada', currentOrderId: 'order-active-1' },
  { id: 't-3', number: 3, capacity: 4, status: 'libre' },
  { id: 't-4', number: 4, capacity: 4, status: 'ocupada', currentOrderId: 'order-active-2' },
  { id: 't-5', number: 5, capacity: 6, status: 'reservada' },
  { id: 't-6', number: 6, capacity: 6, status: 'libre' },
  { id: 't-7', number: 7, capacity: 8, status: 'libre' },
  { id: 't-8', number: 10, capacity: 4, status: 'libre' },
];

export const initialStaff: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Chef Carlos Fuentes',
    role: 'chef',
    phone: '55-1234-5678',
    status: 'activo',
    password: '1111',
    schedule: [
      { day: 'Lunes', shift: '13:00 - 22:00' },
      { day: 'Martes', shift: '13:00 - 22:00' },
      { day: 'Miércoles', shift: '13:00 - 22:00' },
      { day: 'Jueves', shift: '13:00 - 22:00' },
      { day: 'Viernes', shift: '14:00 - 23:30' },
      { day: 'Sábado', shift: '14:00 - 23:30' }
    ]
  },
  {
    id: 'staff-2',
    name: 'Chef Marcela Ruiz',
    role: 'chef',
    phone: '55-9876-5432',
    status: 'activo',
    password: '2222',
    schedule: [
      { day: 'Miércoles', shift: '08:00 - 17:00' },
      { day: 'Jueves', shift: '08:00 - 17:00' },
      { day: 'Viernes', shift: '08:00 - 17:00' },
      { day: 'Sábado', shift: '09:00 - 18:00' },
      { day: 'Domingo', shift: '09:00 - 18:00' }
    ]
  },
  {
    id: 'staff-3',
    name: 'Mesero Luis Donaldo',
    role: 'mesero',
    phone: '55-4433-2211',
    status: 'activo',
    password: '3333',
    schedule: [
      { day: 'Lunes', shift: '13:00 - 22:00' },
      { day: 'Martes', shift: '13:00 - 22:00' },
      { day: 'Jueves', shift: '13:00 - 22:00' },
      { day: 'Viernes', shift: '14:00 - 23:30' },
      { day: 'Sábado', shift: '14:00 - 23:30' },
      { day: 'Domingo', shift: '09:00 - 18:30' }
    ]
  },
  {
    id: 'staff-4',
    name: 'Mesera Sofia Vergara',
    role: 'mesero',
    phone: '55-7766-5544',
    status: 'activo',
    password: '4444',
    schedule: [
      { day: 'Lunes', shift: '08:00 - 17:00' },
      { day: 'Martes', shift: '08:00 - 17:00' },
      { day: 'Miércoles', shift: '08:00 - 17:00' },
      { day: 'Viernes', shift: '14:00 - 23:30' },
      { day: 'Sábado', shift: '14:00 - 23:30' },
      { day: 'Domingo', shift: '09:00 - 18:30' }
    ]
  },
  {
    id: 'staff-5',
    name: 'Guadalupe Ortiz',
    role: 'cajero',
    phone: '55-8899-0011',
    status: 'activo',
    password: '5555',
    schedule: [
      { day: 'Lunes', shift: '14:00 - 23:00' },
      { day: 'Martes', shift: '14:00 - 23:00' },
      { day: 'Miércoles', shift: '14:00 - 23:00' },
      { day: 'Jueves', shift: '14:00 - 23:00' },
      { day: 'Viernes', shift: '15:00 - 24:00' },
      { day: 'Sábado', shift: '15:00 - 24:00' }
    ]
  },
  {
    id: 'staff-6',
    name: 'Gerente Roberto Treviño',
    role: 'administrador',
    phone: '55-2233-4455',
    status: 'activo',
    password: '6666',
    schedule: [
      { day: 'Lunes', shift: '09:00 - 18:00' },
      { day: 'Martes', shift: '09:00 - 18:00' },
      { day: 'Miércoles', shift: '09:00 - 18:00' },
      { day: 'Jueves', shift: '09:00 - 18:00' },
      { day: 'Viernes', shift: '09:00 - 18:00' }
    ]
  }
];

export const initialCustomers: Customer[] = [
  { id: 'c-1', name: 'Andrés García', phone: '55-1122-3344', email: 'andres.garcia@gmail.com', visits: 14, favoriteTableNumber: 2, notes: 'Prefiere mesa al aire libre o ventanal. Le gusta término medio en cortes.' },
  { id: 'c-2', name: 'Laura Martínez', phone: '55-2233-4455', email: 'laura_mtz_88@outlook.com', visits: 8, favoriteTableNumber: 4, notes: 'Alérgica a las nueces. Cliente asidua para desayunos los domingos.' },
  { id: 'c-3', name: 'Dr. Alejandro Peña', phone: '55-9988-7766', email: 'apena.med@gmail.com', visits: 22, favoriteTableNumber: 3, notes: 'Suele pedir vinos de mesa y el Cheesecake de Guayaba.' },
];

// Seed some historic payments over the past 4 days to build a gorgeous dashboard of stats
export const generateCompletedOrders = (): Order[] => {
  const pastOrders: Order[] = [
    {
      id: 'order-hist-1',
      tableId: 't-1',
      tableName: 'Mesa 1',
      items: [
        { menuItemId: 'menu-1', quantity: 1, price: 135 }, // Guacamole
        { menuItemId: 'menu-3', quantity: 1, price: 215 }, // Alfredo
        { menuItemId: 'menu-6', quantity: 2, price: 45 },  // Refrescos
        { menuItemId: 'menu-9', quantity: 1, price: 110 }  // Volcan chocolate
      ],
      status: 'pagado',
      waiterId: 'staff-3',
      chefId: 'staff-1',
      subtotal: 550,
      tip: 55,
      total: 605,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 3 * 3600 * 1000).toISOString(), // 4 days ago
      paidAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 2 * 3600 * 1000).toISOString(),
      paymentMethod: 'tarjeta',
      customerId: 'c-1'
    },
    {
      id: 'order-hist-2',
      tableId: 't-3',
      tableName: 'Mesa 3',
      items: [
        { menuItemId: 'menu-2', quantity: 1, price: 180 }, // Tacos de filete
        { menuItemId: 'menu-5', quantity: 1, price: 435 }, // Corte Ribeye
        { menuItemId: 'menu-7', quantity: 2, price: 75 },  // Cervezas
        { menuItemId: 'menu-10', quantity: 1, price: 95 }  // Cheesecake
      ],
      status: 'pagado',
      waiterId: 'staff-4',
      chefId: 'staff-2',
      subtotal: 860,
      tip: 120,
      total: 980,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 400000).toISOString(), // 3 days ago
      paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'efectivo',
      customerId: 'c-2'
    },
    {
      id: 'order-hist-3',
      tableId: 't-6',
      tableName: 'Mesa 6',
      items: [
        { menuItemId: 'menu-1', quantity: 2, price: 135 }, // Guacamoles
        { menuItemId: 'menu-4', quantity: 2, price: 310 }, // Salmones
        { menuItemId: 'menu-8', quantity: 2, price: 125 }  // Carajillos
      ],
      status: 'pagado',
      waiterId: 'staff-3',
      chefId: 'staff-1',
      subtotal: 1140,
      tip: 171,
      total: 1311,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 2 * 3600 * 1000).toISOString(), // 2 days ago
      paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 1 * 3600 * 1000).toISOString(),
      paymentMethod: 'tarjeta',
    },
    {
      id: 'order-hist-4',
      tableId: 't-1',
      tableName: 'Mesa 1',
      items: [
        { menuItemId: 'menu-3', quantity: 2, price: 215 }, // Alfredos
        { menuItemId: 'menu-6', quantity: 2, price: 45 }   // Refrescos
      ],
      status: 'pagado',
      waiterId: 'staff-4',
      chefId: 'staff-2',
      subtotal: 520,
      tip: 52,
      total: 572,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 5 * 3600 * 1000).toISOString(), // Yesterday
      paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 4 * 3600 * 1000).toISOString(),
      paymentMethod: 'transferencia',
      customerId: 'c-3'
    },
    {
      id: 'order-hist-5',
      tableId: 't-7',
      tableName: 'Mesa 7',
      items: [
        { menuItemId: 'menu-2', quantity: 2, price: 180 }, // Tacos filete
        { menuItemId: 'menu-5', quantity: 2, price: 435 }, // Ribeyes
        { menuItemId: 'menu-8', quantity: 4, price: 125 }  // Carajillos
      ],
      status: 'pagado',
      waiterId: 'staff-3',
      chefId: 'staff-1',
      subtotal: 1730,
      tip: 260,
      total: 1990,
      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // Today earlier
      paidAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      paymentMethod: 'tarjeta',
    }
  ];
  return pastOrders;
};

// Two active orders corresponding to Table 2 and Table 4
export const getActiveOrders = (): Order[] => [
  {
    id: 'order-active-1',
    tableId: 't-2',
    tableName: 'Mesa 2',
    items: [
      { menuItemId: 'menu-1', quantity: 1, notes: 'Totopos extra', price: 135 }, // Guacamole
      { menuItemId: 'menu-3', quantity: 1, notes: 'Sin tocino', price: 215 },  // Fettuccine
      { menuItemId: 'menu-7', quantity: 2, price: 75 },                      // Cervezas
    ],
    status: 'preparando',
    waiterId: 'staff-3',
    chefId: 'staff-1',
    subtotal: 500,
    tip: 0,
    total: 500,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
  },
  {
    id: 'order-active-2',
    tableId: 't-4',
    tableName: 'Mesa 4',
    items: [
      { menuItemId: 'menu-2', quantity: 1, price: 180 },   // Tacos
      { menuItemId: 'menu-6', quantity: 1, price: 45 },    // Refresco
    ],
    status: 'pendiente',
    waiterId: 'staff-4',
    chefId: 'staff-2',
    subtotal: 225,
    tip: 0,
    total: 225,
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 mins ago
  }
];
