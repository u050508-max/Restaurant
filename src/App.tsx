import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Table as TableIcon, 
  Utensils, 
  ChefHat, 
  Package, 
  Users, 
  FolderHeart, 
  LineChart, 
  Clock, 
  Sparkles, 
  Compass,
  Menu as Hamburger,
  ChevronLeft,
  DollarSign
} from 'lucide-react';

import { Table, TableStatus, Order, MenuItem, InventoryItem, StaffMember, Customer } from './types';
import { 
  initialTables, 
  initialMenuItems, 
  initialInventory, 
  initialStaff, 
  initialCustomers, 
  generateCompletedOrders, 
  getActiveOrders 
} from './initialData';

import Dashboard from './components/Dashboard';
import TableView from './components/TableView';
import MenuView from './components/MenuView';
import InventoryView from './components/InventoryView';
import StaffView from './components/StaffView';
import ClientView from './components/ClientView';
import LoginScreen from './components/LoginScreen';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Global States
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Time tracker state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Trigger time update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync session details if admin updates password/status of logged-in user
  useEffect(() => {
    if (currentUser) {
      const currentInStaff = staff.find(s => s.id === currentUser.id);
      if (currentInStaff) {
        if (currentInStaff.status === 'inactivo') {
          handleLogout();
        } else if (JSON.stringify(currentInStaff) !== JSON.stringify(currentUser)) {
          setCurrentUser(currentInStaff);
          localStorage.setItem('sgr_current_user', JSON.stringify(currentInStaff));
        }
      }
    }
  }, [staff]);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sgr_current_user');
    setActiveTab('inicio');
  };

  // 1. Core State Hydration & Syncer
  useEffect(() => {
    // Current Session
    const savedUser = localStorage.getItem('sgr_current_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        setCurrentUser(null);
      }
    }
    // Tables
    const savedTables = localStorage.getItem('sgr_tables');
    if (savedTables) {
      setTables(JSON.parse(savedTables));
    } else {
      setTables(initialTables);
    }

    // Menu
    const savedMenu = localStorage.getItem('sgr_menu');
    if (savedMenu) {
      setMenuItems(JSON.parse(savedMenu));
    } else {
      setMenuItems(initialMenuItems);
    }

    // Inventory
    const savedInventory = localStorage.getItem('sgr_inventory');
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    } else {
      setInventory(initialInventory);
    }

    // Staff
    const savedStaff = localStorage.getItem('sgr_staff');
    if (savedStaff) {
      setStaff(JSON.parse(savedStaff));
    } else {
      setStaff(initialStaff);
    }

    // Customers
    const savedCustomers = localStorage.getItem('sgr_customers');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    } else {
      setCustomers(initialCustomers);
    }

    // Orders (Combine historic with some starter active ones)
    const savedOrders = localStorage.getItem('sgr_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      const initialTotalOrders = [...generateCompletedOrders(), ...getActiveOrders()];
      setOrders(initialTotalOrders);
    }
  }, []);

  // 2. LocalStorage Writer Effect helpers (wrapped in dedicated function instead of blanket triggers to avoid dependency race loops)
  const saveTablesState = (updated: Table[]) => {
    setTables(updated);
    localStorage.setItem('sgr_tables', JSON.stringify(updated));
  };

  const saveMenuItemsState = (updated: MenuItem[]) => {
    setMenuItems(updated);
    localStorage.setItem('sgr_menu', JSON.stringify(updated));
  };

  const saveInventoryState = (updated: InventoryItem[]) => {
    setInventory(updated);
    localStorage.setItem('sgr_inventory', JSON.stringify(updated));
  };

  const saveStaffState = (updated: StaffMember[]) => {
    setStaff(updated);
    localStorage.setItem('sgr_staff', JSON.stringify(updated));
  };

  const saveCustomersState = (updated: Customer[]) => {
    setCustomers(updated);
    localStorage.setItem('sgr_customers', JSON.stringify(updated));
  };

  const saveOrdersState = (updated: Order[]) => {
    setOrders(updated);
    localStorage.setItem('sgr_orders', JSON.stringify(updated));
  };

  // 3. Operational State Mutators
  
  // Tables handlers
  const handleAddTable = (tableNumber: number, capacity: number) => {
    // Check duplication
    if (tables.some(t => t.number === tableNumber)) {
      alert(`La Mesa num. ${tableNumber} ya se encuentra registrada en el salón.`);
      return;
    }
    const updated = [...tables, {
      id: `t-${Date.now()}`,
      number: tableNumber,
      capacity: capacity,
      status: 'libre' as TableStatus
    }];
    saveTablesState(updated);
  };

  const handleDeleteTable = (tableId: string) => {
    // Avoid deleting occupied tables
    const tableObj = tables.find(t => t.id === tableId);
    if (tableObj?.status === 'ocupada') {
      alert('Imposible eliminar una mesa que se encuentra en servicio activo.');
      return;
    }
    const updated = tables.filter(t => t.id !== tableId);
    saveTablesState(updated);
  };

  const handleUpdateTableStatus = (tableId: string, status: TableStatus) => {
    const updated = tables.map(t => {
      if (t.id === tableId) {
        return { 
          ...t, 
          status,
          currentOrderId: status === 'libre' ? undefined : t.currentOrderId
        };
      }
      return t;
    });
    saveTablesState(updated);
  };

  // Orders and Deduct Inventory Handler
  const handleSaveOrder = (order: Order) => {
    // Check if we already have this order loaded
    const exists = orders.some(o => o.id === order.id);
    let updatedOrders = [];

    if (exists) {
      updatedOrders = orders.map(o => o.id === order.id ? order : o);
    } else {
      updatedOrders = [...orders, order];
    }
    saveOrdersState(updatedOrders);

    // Also link this order ID directly as current active in Table
    const updatedTables = tables.map(t => {
      if (t.id === order.tableId) {
        return { ...t, currentOrderId: order.id };
      }
      return t;
    });
    saveTablesState(updatedTables);
  };

  // CLOSE ORDER & CASH OUT & DEDUCT REAL INVENTORY RECIPE
  const handleCloseOrder = (orderId: string, paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia', tip: number) => {
    const orderObj = orders.find(o => o.id === orderId);
    if (!orderObj) return;

    // A. Deduct ingredient amounts specified in recipes from active stock inventory
    const updatedInventory = [...inventory];
    orderObj.items.forEach(orderItem => {
      const menuItemObj = menuItems.find(m => m.id === orderItem.menuItemId);
      if (menuItemObj && menuItemObj.recipe) {
        // Loop ingredients in recipe
        menuItemObj.recipe.forEach(recipeComponent => {
          const invIndex = updatedInventory.findIndex(ii => ii.id === recipeComponent.inventoryItemId);
          if (invIndex >= 0) {
            const deductionQty = recipeComponent.amountNeeded * orderItem.quantity;
            updatedInventory[invIndex].quantity = Math.max(0, updatedInventory[invIndex].quantity - deductionQty);
          }
        });
      }
    });
    saveInventoryState(updatedInventory);

    // B. Increment total visits of associated loyalty Customer if linked
    if (orderObj.customerId) {
      const updatedCustomers = customers.map(c => {
        if (c.id === orderObj.customerId) {
          return { ...c, visits: c.visits + 1 };
        }
        return c;
      });
      saveCustomersState(updatedCustomers);
    }

    // C. Change order state to paid (pagado) and save math total
    const finalTotal = orderObj.subtotal + tip;
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'pagado' as const,
          paymentMethod,
          tip,
          total: finalTotal,
          paidAt: new Date().toISOString()
        };
      }
      return o;
    });
    saveOrdersState(updatedOrders);

    // D. Unlink from relevant Table and clear table status to Libre
    const updatedTables = tables.map(t => {
      if (t.id === orderObj.tableId) {
        return {
          ...t,
          status: 'libre' as TableStatus,
          currentOrderId: undefined
        };
      }
      return t;
    });
    saveTablesState(updatedTables);
  };

  // Menu Items handlers
  const handleAddMenuItem = (item: MenuItem) => {
    const updated = [...menuItems, item];
    saveMenuItemsState(updated);
  };

  const handleUpdateMenuItem = (item: MenuItem) => {
    const updated = menuItems.map(m => m.id === item.id ? item : m);
    saveMenuItemsState(updated);
  };

  const handleDeleteMenuItem = (id: string) => {
    const updated = menuItems.filter(m => m.id !== id);
    saveMenuItemsState(updated);
  };

  // Inventory handlers
  const handleAddInventoryItem = (item: InventoryItem) => {
    const updated = [...inventory, item];
    saveInventoryState(updated);
  };

  const handleUpdateInventoryItem = (item: InventoryItem) => {
    const updated = inventory.map(i => i.id === item.id ? item : i);
    saveInventoryState(updated);
  };

  const handleDeleteInventoryItem = (id: string) => {
    const updated = inventory.filter(i => i.id !== id);
    saveInventoryState(updated);
  };

  // Staff handlers
  const handleAddStaffMember = (member: StaffMember) => {
    const updated = [...staff, member];
    saveStaffState(updated);
  };

  const handleUpdateStaffMember = (member: StaffMember) => {
    const updated = staff.map(s => s.id === member.id ? member : s);
    saveStaffState(updated);
  };

  const handleDeleteStaffMember = (id: string) => {
    const updated = staff.filter(s => s.id !== id);
    saveStaffState(updated);
  };

  // Customer loyalty handlers
  const handleAddCustomer = (customer: Customer) => {
    const updated = [...customers, customer];
    saveCustomersState(updated);
  };

  const handleDeleteCustomer = (id: string) => {
    const updated = customers.filter(c => c.id !== id);
    saveCustomersState(updated);
  };

  // Short route navigator helper for clicking tables in dashboard
  const handleSelectTableRedirect = (tableId: string) => {
    setActiveTab('mesas');
    // Note: the sub-actions of selected table will automatically hydrate on rendering TableView
  };

  // Navigation Items Sidebar menu
  const sidebarLinks = [
    { id: 'inicio', label: 'Inicio', icon: LineChart },
    { id: 'mesas', label: 'Salón & POS', icon: TableIcon },
    { id: 'menu', label: 'Menú & Recetario', icon: Utensils },
    { id: 'inventario', label: 'Almacén', icon: Package },
    { id: 'personal', label: 'Personal (Equipo)', icon: ChefHat },
    { id: 'clientes', label: 'Clientes Loyal', icon: FolderHeart },
  ];

  const visibleSidebarLinks = sidebarLinks.filter(link => {
    if (currentUser?.role === 'mesero') {
      return link.id === 'mesas';
    }
    return true;
  });

  if (!currentUser) {
    return (
      <LoginScreen
        staff={staff}
        onLogin={(member) => {
          setCurrentUser(member);
          localStorage.setItem('sgr_current_user', JSON.stringify(member));
          if (member.role === 'mesero') {
            setActiveTab('mesas');
          } else {
            setActiveTab('inicio');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-700 antialiased overflow-x-hidden">
      
      {/* MOBILE HEADER TOP WRAPPER */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 font-bold text-slate-950 flex items-center justify-center">
            S
          </div>
          <span className="font-extrabold tracking-tight text-sm">Sabor & Brasa SGR</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* UTC Clock on Mobile */}
          <span className="text-[10px] font-mono bg-slate-805/40 text-slate-400 px-2 py-1 rounded">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          <button 
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            <Hamburger className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* MOBILE NAV PANEL DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-slate-900 border-b border-slate-800 py-3 px-4 text-left space-y-1 absolute top-[65px] left-0 right-0 z-50 shadow-xl"
          >
            {visibleSidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-semibold text-xs cursor-pointer ${activeTab === link.id ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{link.label}</span>
                </button>
              );
            })}
            <div className="border-t border-slate-800/80 pt-2 mt-2">
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all font-semibold text-xs text-rose-400 hover:text-rose-305 hover:text-rose-350 cursor-pointer bg-transparent border-0"
              >
                <ChevronLeft className="w-4.5 h-4.5 rotate-180 text-rose-400" />
                <span>Cerrar Sesión ({currentUser?.name.split(' ')[0]})</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR PANEL NAVIGATION */}
      <aside className={`hidden md:flex flex-col justify-between shrink-0 bg-slate-900 text-white border-r border-slate-800 transition-all duration-300 z-30 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div>
          {/* Logo Brand Brand box */}
          <div className="p-5 flex items-center justify-between border-b border-slate-800">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2.5 animate-fade-in">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black text-lg flex items-center justify-center font-serif shadow-sm">
                  SB
                </div>
                <div>
                  <h1 className="font-extrabold tracking-tight text-xs leading-none">SABOR & BRASA</h1>
                  <span className="text-[9px] text-slate-400 tracking-wider">Centro Operativo</span>
                </div>
              </div>
            )}

            {isSidebarCollapsed && (
              <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black text-lg flex items-center justify-center font-serif shadow-sm">
                S
              </div>
            )}

            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md cursor-pointer ml-auto"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {/* Navigation Links list */}
          <nav className="p-4 space-y-1.5">
            {visibleSidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;

              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`w-full flex items-center rounded-xl transition-all duration-150 font-bold text-xs cursor-pointer ${isSidebarCollapsed ? 'justify-center p-3.5' : 'gap-3 p-3.5'} ${isActive ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
                  title={link.label}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  {!isSidebarCollapsed && <span className="animate-fade-in">{link.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Desktop Sidebar Bottom widgets */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          {!isSidebarCollapsed ? (
            <div className="space-y-2 animate-fade-in">
              <div className="bg-slate-800/40 border border-slate-850 p-3 rounded-2xl text-[10px] text-slate-400 space-y-1 text-left">
                <span className="font-black uppercase tracking-wider text-slate-500 block">Ingreso de Sistema</span>
                <p className="truncate font-semibold text-slate-300">Usuario: {currentUser?.name}</p>
                <p className="font-semibold text-amber-500 capitalize">Rol: {currentUser?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-center text-rose-450 text-rose-400 hover:text-rose-300 font-bold text-xs bg-rose-500/10 hover:bg-rose-500/20 py-2.5 rounded-xl transition-colors cursor-pointer block border border-rose-500/15"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mx-auto animate-pulse" title="Sistema en línea" />
              <button
                onClick={handleLogout}
                className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer border-0 bg-transparent p-1"
                title="Cerrar Sesión"
              >
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN LAYOUT WRAPPER / CONTAINER BODY */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        
        {/* UNIVERSAL DESKTOP INNER HEADER BAR */}
        <header className="hidden md:flex bg-white border-b border-slate-100 py-3 px-8 justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-500 text-lg" />
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase font-mono">
              Terminal de Operación · {activeTab}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Clock Calendar widget */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {currentTime.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-amber-600 font-extrabold">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </span>
            </div>

            {/* Quick staff session card */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4 text-xs font-semibold text-slate-600">
              <div className="text-right">
                <p className="font-extrabold text-slate-800 text-right">{currentUser?.name}</p>
                <p className="text-[10px] text-amber-600 font-mono leading-none capitalize">{currentUser?.role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-500 border border-amber-650 text-slate-950 flex items-center justify-center font-bold uppercase shadow-xs">
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE APP VIEWS WITH WRAPPER ANIMATION TRANSITIONS */}
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="h-full"
            >
              {activeTab === 'inicio' && (
                <Dashboard 
                  orders={orders}
                  tables={tables}
                  menuItems={menuItems}
                  inventory={inventory}
                  staff={staff}
                  customers={customers}
                  onNavigate={(viewId) => {
                    setActiveTab(viewId);
                  }}
                  onSelectTable={handleSelectTableRedirect}
                />
              )}

              {activeTab === 'mesas' && (
                <TableView 
                  tables={tables}
                  orders={orders}
                  menuItems={menuItems}
                  inventory={inventory}
                  staff={staff}
                  customers={customers}
                  onAddTable={handleAddTable}
                  onDeleteTable={handleDeleteTable}
                  onUpdateTableStatus={handleUpdateTableStatus}
                  onSaveOrder={handleSaveOrder}
                  onCloseOrder={handleCloseOrder}
                  currentUserRole={currentUser?.role}
                />
              )}

              {activeTab === 'menu' && (
                <MenuView 
                  menuItems={menuItems}
                  inventory={inventory}
                  onAddMenuItem={handleAddMenuItem}
                  onUpdateMenuItem={handleUpdateMenuItem}
                  onDeleteMenuItem={handleDeleteMenuItem}
                />
              )}

              {activeTab === 'inventario' && (
                <InventoryView 
                  inventory={inventory}
                  onAddInventoryItem={handleAddInventoryItem}
                  onUpdateInventoryItem={handleUpdateInventoryItem}
                  onDeleteInventoryItem={handleDeleteInventoryItem}
                />
              )}

              {activeTab === 'personal' && (
                <StaffView 
                  staff={staff}
                  onAddStaffMember={handleAddStaffMember}
                  onUpdateStaffMember={handleUpdateStaffMember}
                  onDeleteStaffMember={handleDeleteStaffMember}
                />
              )}

              {activeTab === 'clientes' && (
                <ClientView 
                  customers={customers}
                  onAddCustomer={handleAddCustomer}
                  onDeleteCustomer={handleDeleteCustomer}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
