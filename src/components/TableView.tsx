import React, { useState } from 'react';
import { Table, TableStatus, Order, MenuItem, InventoryItem, StaffMember, Customer, OrderItem } from '../types';
import { 
  Users, 
  Plus, 
  Trash2, 
  PlusCircle, 
  MinusCircle, 
  ChevronRight, 
  Clock, 
  User, 
  Check, 
  Coffee, 
  Sparkles,
  Search,
  CheckCircle2,
  Receipt,
  RotateCcw,
  DollarSign,
  Briefcase,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';

interface TableViewProps {
  tables: Table[];
  orders: Order[];
  menuItems: MenuItem[];
  inventory: InventoryItem[];
  staff: StaffMember[];
  customers: Customer[];
  onAddTable: (tableNumber: number, capacity: number) => void;
  onDeleteTable: (tableId: string) => void;
  onUpdateTableStatus: (tableId: string, status: TableStatus) => void;
  onSaveOrder: (order: Order) => void;
  onCloseOrder: (orderId: string, paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia', tip: number) => void;
  currentUserRole?: string;
}

export default function TableView({
  tables,
  orders,
  menuItems,
  inventory,
  staff,
  customers,
  onAddTable,
  onDeleteTable,
  onUpdateTableStatus,
  onSaveOrder,
  onCloseOrder,
  currentUserRole
}: TableViewProps) {
  // Navigation & sub-states
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [newTableNum, setNewTableNum] = useState<number>(tables.length + 1);
  const [newTableCap, setNewTableCap] = useState<number>(4);
  
  // Quick Filter for Tables
  const [tableFilter, setTableFilter] = useState<'todos' | 'libre' | 'ocupada' | 'reservada'>('todos');

  // Point of Sale Order Builder State
  const [builderWaiterId, setBuilderWaiterId] = useState('');
  const [builderChefId, setBuilderChefId] = useState('');
  const [builderCustomerId, setBuilderCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuTab, setMenuTab] = useState<'todos' | 'entradas' | 'fuertes' | 'bebidas' | 'postres'>('todos');
  
  // Checkout Checkout (Cobro) State
  const [checkoutTipPercent, setCheckoutTipPercent] = useState<number>(10); // 10% preset
  const [customTipAmt, setCustomTipAmt] = useState<string>('');
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('tarjeta');
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [invoicePrinted, setInvoicePrinted] = useState(false);

  // Error/Success state alert in Builder
  const [errorMsg, setErrorMsg] = useState('');

  // Find active order of selected table
  const activeOrder = selectedTable && selectedTable.currentOrderId 
    ? orders.find(o => o.id === selectedTable.currentOrderId) 
    : null;

  // Initialize Point of Sale builder with current order details if editing
  const handleSelectTable = (table: Table) => {
    setSelectedTable(table);
    setErrorMsg('');
    setInvoicePrinted(false);
    setShowInvoicePreview(false);
    
    const existingOrder = orders.find(o => o.id === table.currentOrderId && o.status !== 'pagado');
    if (existingOrder) {
      setBuilderWaiterId(existingOrder.waiterId);
      setBuilderChefId(existingOrder.chefId);
      setBuilderCustomerId(existingOrder.customerId || '');
      setOrderItems(existingOrder.items);
    } else {
      // Clear for new order
      const defaultWaiter = staff.find(s => s.role === 'mesero' && s.status === 'activo')?.id || '';
      const defaultChef = staff.find(s => s.role === 'chef' && s.status === 'activo')?.id || '';
      setBuilderWaiterId(defaultWaiter);
      setBuilderChefId(defaultChef);
      setBuilderCustomerId('');
      setOrderItems([]);
    }
  };

  // Check inventory constraints before allowing adding item
  const checkInventoryAvailability = (menuItemId: string, targetQuantity: number): { available: boolean; reason?: string } => {
    const menuItem = menuItems.find(m => m.id === menuItemId);
    if (!menuItem) return { available: false, reason: 'Producto inexistente' };
    
    for (const recipeItem of menuItem.recipe) {
      const invItem = inventory.find(i => i.id === recipeItem.inventoryItemId);
      if (!invItem) continue;
      
      const totalUnitsNeeded = recipeItem.amountNeeded * targetQuantity;
      if (invItem.quantity < totalUnitsNeeded) {
        return { 
          available: false, 
          reason: `Falta ingrediente "${invItem.name}". Disponible: ${invItem.quantity} ${invItem.unit}. Se requieren ${totalUnitsNeeded.toFixed(2)} ${invItem.unit}.` 
        };
      }
    }
    return { available: true };
  };

  const handleAddItemToBuilder = (menu: MenuItem) => {
    setErrorMsg('');
    const existingIndex = orderItems.findIndex(i => i.menuItemId === menu.id);
    const currentQty = existingIndex >= 0 ? orderItems[existingIndex].quantity : 0;
    const nextQty = currentQty + 1;

    // Validate recipe availability
    const verification = checkInventoryAvailability(menu.id, nextQty);
    if (!verification.available) {
      setErrorMsg(verification.reason || 'Recursos de inventario insuficientes.');
      return;
    }

    if (existingIndex >= 0) {
      const updated = [...orderItems];
      updated[existingIndex].quantity = nextQty;
      setOrderItems(updated);
    } else {
      setOrderItems([...orderItems, { menuItemId: menu.id, quantity: 1, price: menu.price }]);
    }
  };

  const handleRemoveItemFromBuilder = (menuItemId: string) => {
    setErrorMsg('');
    const existingIndex = orderItems.findIndex(i => i.menuItemId === menuItemId);
    if (existingIndex >= 0) {
      const updated = [...orderItems];
      if (updated[existingIndex].quantity > 1) {
        updated[existingIndex].quantity -= 1;
        setOrderItems(updated);
      } else {
        updated.splice(existingIndex, 1);
        setOrderItems(updated);
      }
    }
  };

  const handleCreateNewTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTableNum <= 0) return;
    onAddTable(newTableNum, newTableCap);
    setNewTableNum(tables.length + 2);
    setIsCreatingTable(false);
  };

  const calculateBuilderSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Create or Update Order
  const handleSaveOrderSubmit = (statusOverride?: 'preparando' | 'listo' | 'servido') => {
    if (!selectedTable) return;
    if (orderItems.length === 0) {
      setErrorMsg('Seleccione al menos un platillo del menú para levantar comanda.');
      return;
    }
    if (!builderWaiterId) {
      setErrorMsg('Debe asignar un mesero para registrar el pedido.');
      return;
    }
    if (!builderChefId) {
      setErrorMsg('Debe asignar un chef o cocinero receptor para la preparación.');
      return;
    }

    const subtotal = calculateBuilderSubtotal();
    const isNew = !selectedTable.currentOrderId;
    const orderId = isNew ? `order-${Date.now()}` : selectedTable.currentOrderId!;

    const orderObj: Order = {
      id: orderId,
      tableId: selectedTable.id,
      tableName: `Mesa ${selectedTable.number}`,
      items: orderItems,
      status: statusOverride || (activeOrder ? activeOrder.status : 'pendiente'),
      waiterId: builderWaiterId,
      chefId: builderChefId,
      customerId: builderCustomerId || undefined,
      subtotal: subtotal,
      tip: activeOrder ? activeOrder.tip : 0,
      total: subtotal + (activeOrder ? activeOrder.tip : 0),
      createdAt: activeOrder ? activeOrder.createdAt : new Date().toISOString()
    };

    onSaveOrder(orderObj);
    
    // Auto toggle table state to ocupada if registering new
    if (isNew) {
      onUpdateTableStatus(selectedTable.id, 'ocupada');
      // Update our local state table pointer
      setSelectedTable({
        ...selectedTable,
        status: 'ocupada',
        currentOrderId: orderId
      });
    } else {
      // Force refresh current selection
      setSelectedTable({
        ...selectedTable,
        currentOrderId: orderId
      });
    }

    // Success styling and visual timeout
    setErrorMsg('✓ Comanda enviada a cocina con éxito.');
    setTimeout(() => setErrorMsg(''), 3000);
  };

  // Checkout billing handler
  const handleCheckoutSubmit = () => {
    if (!selectedTable || !selectedTable.currentOrderId) return;
    const subtotal = calculateBuilderSubtotal();
    
    let computedTip = 0;
    if (customTipAmt) {
      computedTip = parseFloat(customTipAmt) || 0;
    } else {
      computedTip = Math.round(subtotal * (checkoutTipPercent / 100));
    }

    onCloseOrder(selectedTable.currentOrderId, checkoutPaymentMethod, computedTip);
    
    // Free the table
    onUpdateTableStatus(selectedTable.id, 'libre');
    
    // Clear selection
    setSelectedTable(null);
    setOrderItems([]);
    setCustomTipAmt('');
  };

  // Toggle table reservation status
  const handleToggleReservation = () => {
    if (!selectedTable) return;
    const nextStatus = selectedTable.status === 'reservada' ? 'libre' : 'reservada';
    onUpdateTableStatus(selectedTable.id, nextStatus);
    setSelectedTable({ ...selectedTable, status: nextStatus });
  };

  // Filtering lists
  const filteredTables = tables.filter(t => {
    if (tableFilter === 'todos') return true;
    return t.status === tableFilter;
  });

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.available) return false;
    const matchesCategory = menuTab === 'todos' || item.category === menuTab;
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
                          item.description.toLowerCase().includes(menuSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Salón & Comandas</h2>
          <p className="text-xs text-slate-400 mt-0.5">Control táctil de mesas, toma de comandas, monitor culinario y facturación exprés</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Floor Filters */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            {(['todos', 'libre', 'ocupada', 'reservada'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setTableFilter(opt)}
                className={`text-xs capitalize font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${tableFilter === opt ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {opt}
              </button>
            ))}
          </div>

          {currentUserRole !== 'mesero' && (
            <button
              onClick={() => setIsCreatingTable(!isCreatingTable)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Agregar Mesa
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Creation Admin Drawer */}
      {isCreatingTable && (
        <form onSubmit={handleCreateNewTableSubmit} className="bg-amber-50/40 border border-amber-100 p-4 rounded-2xl flex flex-wrap items-end gap-4 animate-fade-in">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 block">Número de Mesa</label>
            <input 
              type="number" 
              required
              min="1"
              value={newTableNum} 
              onChange={(e) => setNewTableNum(parseInt(e.target.value) || 0)}
              className="bg-white border border-slate-200 outline-hidden font-bold text-slate-700 px-3 py-1.5 rounded-lg w-28 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 block">Capacidad (Comensales)</label>
            <select
              value={newTableCap}
              onChange={(e) => setNewTableCap(parseInt(e.target.value))}
              className="bg-white border border-slate-200 outline-hidden font-semibold text-slate-700 px-3 py-1.5 rounded-lg w-32 text-sm"
            >
              {[2, 3, 4, 6, 8, 10, 12].map(n => (
                <option key={n} value={n}>{n} Cubiertos</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer"
            >
              Confirmar
            </button>
            <button 
              type="button" 
              onClick={() => setIsCreatingTable(false)}
              className="bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Main Split Layout: Left: Salon Map. Right: POS Tablet or Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Floor Salon Map */}
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredTables.map((tab) => {
              const activeOrderObj = tab.currentOrderId ? orders.find(o => o.id === tab.currentOrderId) : null;
              
              let cardBg = 'bg-white hover:border-emerald-200 border-slate-100 hover:bg-emerald-50/5';
              let badgeColor = 'bg-slate-100 text-slate-500';
              let label = 'Libre';
              
              if (tab.status === 'ocupada') {
                if (activeOrderObj?.status === 'pendiente') {
                  cardBg = 'bg-rose-50/10 border-rose-200 hover:border-rose-400';
                  badgeColor = 'bg-rose-500 text-white animate-pulse';
                  label = 'Ocupada - Pendiente';
                } else if (activeOrderObj?.status === 'preparando') {
                  cardBg = 'bg-amber-50/10 border-amber-200 hover:border-amber-400';
                  badgeColor = 'bg-amber-500 text-slate-900';
                  label = 'Ocupada - En Cocina';
                } else if (activeOrderObj?.status === 'listo') {
                  cardBg = 'bg-purple-100/20 border-purple-300 hover:border-purple-500';
                  badgeColor = 'bg-purple-500 text-white font-bold';
                  label = '¡Servir de Inmediato!';
                } else {
                  cardBg = 'bg-sky-50/10 border-sky-200 hover:border-sky-400';
                  badgeColor = 'bg-blue-600 text-white';
                  label = 'Ocupada - Servido';
                }
              } else if (tab.status === 'reservada') {
                cardBg = 'bg-amber-50/5 border-amber-200/60 hover:border-slate-300';
                badgeColor = 'bg-amber-600/10 text-amber-700 border border-amber-200';
                label = 'Reservada';
              }

              const isCurrentlySelected = selectedTable?.id === tab.id;

              return (
                <div
                  key={tab.id}
                  id={`table-card-${tab.number}`}
                  onClick={() => handleSelectTable(tab)}
                  className={`border-2 rounded-2xl p-4 cursor-pointer text-left transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between h-40 relative group ${cardBg} ${isCurrentlySelected ? 'ring-2 ring-slate-800 scale-[1.02] border-slate-800' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Canal Físico</span>
                      <h4 className="text-lg font-extrabold text-slate-800">Mesa {tab.number}</h4>
                    </div>
                    
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${badgeColor}`}>
                      {label}
                    </span>
                  </div>

                  {tab.status === 'ocupada' && activeOrderObj && (
                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-600 font-medium line-clamp-2">
                        {activeOrderObj.items.map((it, i) => {
                          const itemObj = menuItems.find(m => m.id === it.menuItemId);
                          return (
                            <span key={i} className="mr-1">
                              {it.quantity}x {itemObj?.name.split(' ')[0]}
                            </span>
                          );
                        })}
                      </div>
                      <div className="text-[11px] font-bold font-mono text-slate-800">
                        Total: ${activeOrderObj.subtotal}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-100/80 pt-2 font-medium text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {tab.capacity} Pax
                    </span>
                    {tab.status === 'libre' && (
                      <span className="text-emerald-500 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                        Toma Comanda →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTables.length === 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400">
              Ninguna mesa coincide con el filtro "{tableFilter}".
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: POS POS Order Builder & billing desk */}
        <div className="lg:col-span-6">
          {!selectedTable ? (
            <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                <Coffee className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">Consola de Pedidos Inactiva</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Haz clic en cualquier mesa del salón para abrir una comanda, ver cobros activos o planificar reservas.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col justify-between min-h-[500px]">
              {/* Card Header */}
              <div className="bg-slate-900 text-white p-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-amber-500 text-slate-950 font-bold rounded-xl flex items-center justify-center font-mono">
                    {selectedTable.number}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Consola de Control: Mesa {selectedTable.number}</h3>
                    <p className="text-[10px] text-slate-400">
                      Capacidad: {selectedTable.capacity} personas · Estado: <span className="capitalize text-amber-400 font-semibold">{selectedTable.status}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  {selectedTable.status !== 'ocupada' && (
                    <button
                      onClick={handleToggleReservation}
                      className={`font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${selectedTable.status === 'reservada' ? 'bg-amber-600 text-white border-transparent' : 'bg-transparent text-slate-300 border-slate-700 hover:text-white'}`}
                    >
                      {selectedTable.status === 'reservada' ? 'Deshacer Reserva' : 'Reservar'}
                    </button>
                  )}

                  {currentUserRole !== 'mesero' && (
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar la Mesa ${selectedTable.number} definitivamente?`)) {
                          onDeleteTable(selectedTable.id);
                          setSelectedTable(null);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-red-900/40 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 cursor-pointer"
                      title="Eliminar Mesa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* TABS: Comanda POS vs Cobro Bill */}
              <div className="border-b border-rose-100 flex">
                <button
                  type="button"
                  onClick={() => setShowInvoicePreview(false)}
                  className={`flex-1 py-3 text-xs font-bold border-b-2 text-center transition-colors cursor-pointer ${!showInvoicePreview ? 'border-amber-500 text-slate-800 bg-amber-50/10' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  {selectedTable.status === 'ocupada' ? '1. Editar Comanda' : '1. Levantar Pedido'}
                </button>
                {selectedTable.status === 'ocupada' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowInvoicePreview(true);
                      setInvoicePrinted(false);
                    }}
                    className={`flex-1 py-3 text-xs font-bold border-b-2 text-center transition-colors cursor-pointer ${showInvoicePreview ? 'border-amber-500 text-slate-800 bg-amber-50/10' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    2. Caja / Cobros y Ticket
                  </button>
                )}
              </div>

              {/* ERRORS ALERT DESK */}
              {errorMsg && (
                <div className={`mx-5 mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${errorMsg.startsWith('✓') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* MAIN WORKING CAROUSEL AREA */}
              {!showInvoicePreview ? (
                /* VIEW 1: POS WORKSTATION */
                <div className="flex-1 p-5 space-y-4 flex flex-col justify-between">
                  {/* Step A: Roster and Customer Select bindings */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Mesero Asignado</label>
                      <select
                        value={builderWaiterId}
                        onChange={(e) => setBuilderWaiterId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-medium text-slate-700 outline-hidden"
                      >
                        <option value="">Seleccione Mesero...</option>
                        {staff.filter(s => s.role === 'mesero' && s.status === 'activo').map(s => (
                          <option key={s.id} value={s.id}>{s.name.split(' ')[1] || s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Chef (Recibe)</label>
                      <select
                        value={builderChefId}
                        onChange={(e) => setBuilderChefId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-medium text-slate-700 outline-hidden"
                      >
                        <option value="">Seleccione Chef...</option>
                        {staff.filter(s => s.role === 'chef' && s.status === 'activo').map(s => (
                          <option key={s.id} value={s.id}>{s.name.split(' ')[1] || s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Cliente Reservado</label>
                      <select
                        value={builderCustomerId}
                        onChange={(e) => setBuilderCustomerId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-medium text-slate-700 outline-hidden"
                      >
                        <option value="">Consumidor Final</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Split content: Menu Picker vs Ticket Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 items-start min-h-[220px]">
                    
                    {/* Active Order Cart List (6 cols) */}
                    <div className="md:col-span-5 bg-slate-50 rounded-2xl p-3.5 border border-slate-100 flex flex-col justify-between h-full">
                      <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1.5 mb-2">
                        Resumen Comanda
                      </h4>

                      {orderItems.length === 0 ? (
                        <div className="text-center py-10 flex-1 flex flex-col items-center justify-center text-slate-400">
                          <ShoppingBag className="w-8 h-8 opacity-40 mb-1" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">Vacía</span>
                          <span className="text-[10px] text-slate-400">Agrega insumos a la derecha</span>
                        </div>
                      ) : (
                        <div className="space-y-2 flex-1 overflow-y-auto max-h-[140px] pr-1">
                          {orderItems.map((item) => {
                            const menuItemObj = menuItems.find(m => m.id === item.menuItemId);
                            return (
                              <div key={item.menuItemId} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                                <div className="flex-1 min-w-0 pr-1">
                                  <p className="font-bold text-slate-800 truncate text-[11px]">{menuItemObj?.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">${item.price} c/u</p>
                                </div>
                                
                                <div className="flex items-center gap-1.5 bg-slate-100 rounded-md p-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItemFromBuilder(item.menuItemId)}
                                    className="text-slate-500 hover:text-slate-700"
                                  >
                                    <MinusCircle className="w-4 h-4" />
                                  </button>
                                  <span className="text-[11px] font-bold text-slate-800 font-mono w-4 text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (menuItemObj) handleAddItemToBuilder(menuItemObj);
                                    }}
                                    className="text-slate-500 hover:text-slate-700"
                                  >
                                    <PlusCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="border-t border-slate-200 pt-2.5 mt-2 flex items-center justify-between font-bold text-slate-700 text-xs">
                        <span>Subtotal estimado:</span>
                        <span className="font-mono text-amber-600 text-[13px]">${calculateBuilderSubtotal()}</span>
                      </div>
                    </div>

                    {/* Menu Item Catalog Picker (7 cols) */}
                    <div className="md:col-span-7 flex flex-col h-full bg-slate-50 rounded-2xl border border-slate-100 p-2 text-xs">
                      {/* Sub-Tabs */}
                      <div className="flex bg-slate-200 p-0.5 rounded-lg mb-2 overflow-x-auto gap-0.5 shrink-0">
                        {(['todos', 'entradas', 'fuertes', 'bebidas', 'postres'] as const).map(tab => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setMenuTab(tab)}
                            className={`px-2 py-1 text-[10px] capitalize font-bold rounded-md shrink-0 cursor-pointer ${menuTab === tab ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      {/* Quick Search Item */}
                      <div className="relative mb-2 shrink-0">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                        <input
                          type="text"
                          placeholder="Filtro rápido platillo..."
                          value={menuSearch}
                          onChange={(e) => setMenuSearch(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-2 py-1 outline-hidden text-[11px] text-slate-700"
                        />
                      </div>

                      {/* Pickable list of Menu */}
                      <div className="space-y-1.5 overflow-y-auto max-h-[140px] flex-1 pr-1">
                        {filteredMenuItems.map(menu => {
                          const quantityInCart = orderItems.find(it => it.menuItemId === menu.id)?.quantity || 0;
                          return (
                            <div 
                              key={menu.id} 
                              onClick={() => handleAddItemToBuilder(menu)}
                              className={`p-2 rounded-xl bg-white border cursor-pointer flex items-center justify-between hover:bg-amber-50/10 transition-all ${quantityInCart > 0 ? 'border-amber-500 shadow-2xs' : 'border-slate-100'}`}
                            >
                              <div className="text-left pr-2 flex-1">
                                <h5 className="font-bold text-[11px] text-slate-700 flex items-center gap-1">
                                  {menu.name}
                                  {quantityInCart > 0 && (
                                    <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                                      {quantityInCart}
                                    </span>
                                  )}
                                </h5>
                                <p className="text-[9px] text-slate-400 line-clamp-1">{menu.description}</p>
                              </div>
                              
                              <span className="font-mono font-extrabold text-[11px] text-slate-800 shrink-0 bg-slate-50 px-2 py-1 rounded-md">
                                ${menu.price}
                              </span>
                            </div>
                          );
                        })}

                        {filteredMenuItems.length === 0 && (
                          <p className="text-center text-slate-400 text-[10px] py-4">Sin platillos disponibles.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for placing Comanda */}
                  <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveOrderSubmit()}
                      className="w-full sm:flex-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md cursor-pointer transition-colors"
                    >
                      Guardar Comanda (Pendiente)
                    </button>
                    
                    {selectedTable.status === 'ocupada' && (
                      <div className="w-full sm:w-auto flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSaveOrderSubmit('preparando')}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold py-3 px-3.5 rounded-xl cursor-pointer transition-colors"
                          title="Cambiar estado a Cocinando"
                        >
                          Mandarse a Preparar (Cocina)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveOrderSubmit('listo')}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-3 px-3.5 rounded-xl cursor-pointer transition-colors"
                          title="Cambiar estado a Para Servir"
                        >
                          Listo Para Servir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* VIEW 2: BILLING CHECKOUT RECEIPT (COBROS) */
                <div className="flex-1 p-5 space-y-4 flex flex-col justify-between">
                  {/* Bill computations */}
                  {activeOrder ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                      
                      {/* Receipt preview box (7 cols) */}
                      <div className="md:col-span-7 bg-slate-50 p-4 rounded-3xl border border-slate-200 shadow-2xs font-mono text-[11px] text-slate-600 space-y-2 relative">
                        {/* Fake receipt teeth */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-radial-gradient flex overflow-hidden">
                          {Array.from({ length: 40 }).map((_, i) => (
                            <span key={i} className="w-2.5 h-2.5 bg-slate-200 border border-t-0 rounded-b-full shrink-0 -mt-1.5" />
                          ))}
                        </div>

                        <div className="text-center pt-2 pb-2 border-b border-dashed border-slate-300">
                          <h4 className="font-extrabold text-sm text-slate-800">CORTESÍA DE LA CASA</h4>
                          <p className="text-[9px] uppercase">Cocina Contemporánea & Bar</p>
                          <p className="text-[9px]">RFC: SME-12102026</p>
                          <p className="text-[9px] mt-1 text-slate-400">Comanda: #{activeOrder.id.split('-').pop()}</p>
                          <p className="text-[9px] text-slate-400">{new Date(activeOrder.createdAt).toLocaleDateString()} {new Date(activeOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>

                        {/* Customer & Staff */}
                        <div className="border-b border-dashed border-slate-300 pb-1.5 text-[10px]">
                          <p>Mesa: <strong className="text-slate-800">Mesa {selectedTable.number}</strong></p>
                          <p>Mesero: <strong className="text-slate-800">{staff.find(s => s.id === activeOrder.waiterId)?.name || 'Luis'}</strong></p>
                          {activeOrder.customerId && (
                            <p>Cliente: <strong className="text-slate-800">{customers.find(c => c.id === activeOrder.customerId)?.name}</strong></p>
                          )}
                        </div>

                        {/* Order lines */}
                        <div className="space-y-1 py-1 text-slate-800 border-b border-dashed border-slate-300 max-h-[140px] overflow-y-auto">
                          {activeOrder.items.map((line, i) => {
                            const menuItemObj = menuItems.find(m => m.id === line.menuItemId);
                            return (
                              <div key={i} className="flex justify-between items-center whitespace-pre">
                                <span>{line.quantity}x {menuItemObj?.name.substring(0, 20).padEnd(20)}</span>
                                <span className="font-bold">${line.price * line.quantity}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Math breakdown */}
                        <div className="space-y-1 border-b border-dashed border-slate-300 pb-2">
                          <div className="flex justify-between">
                            <span>Subtotal Alimentos</span>
                            <span className="font-bold">${activeOrder.subtotal}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>IVA General (16% Incl.)</span>
                            <span>${(activeOrder.subtotal * 0.16).toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between text-slate-700">
                            <span>Propina Voluntaria ({customTipAmt ? 'Personal' : `${checkoutTipPercent}%`})</span>
                            <span className="font-bold">
                              ${customTipAmt ? parseFloat(customTipAmt) || 0 : Math.round(activeOrder.subtotal * (checkoutTipPercent / 100))}
                            </span>
                          </div>
                        </div>

                        {/* Grand Total */}
                        <div className="flex justify-between items-center text-slate-900 text-sm font-black pt-1">
                          <span>TOTAL A PAGAR</span>
                          <span className="text-amber-600">
                            ${activeOrder.subtotal + (customTipAmt ? parseFloat(customTipAmt) || 0 : Math.round(activeOrder.subtotal * (checkoutTipPercent / 100)))}
                          </span>
                        </div>

                        <div className="text-center text-[9px] text-slate-400 border-t border-dashed border-slate-300 pt-3 mt-2">
                          <p>¡Muchas gracias por su preferencia!</p>
                          <p>Conserve su recibo para aclaraciones.</p>
                        </div>
                      </div>

                      {/* Right Settings (5 cols) */}
                      <div className="md:col-span-5 space-y-4 text-left">
                        {/* Setup Tip Preset */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Propina (Sugerida)</label>
                          <div className="grid grid-cols-4 gap-1">
                            {[0, 10, 15, 20].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => {
                                  setCheckoutTipPercent(pct);
                                  setCustomTipAmt('');
                                }}
                                className={`py-1.5 text-xs font-bold rounded-lg border text-center cursor-pointer transition-colors ${checkoutTipPercent === pct && !customTipAmt ? 'bg-amber-600 text-white border-transparent' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Tip Amt */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Propina Customizada ($)</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs">$</span>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={customTipAmt}
                              onChange={(e) => {
                                setCustomTipAmt(e.target.value);
                                setCheckoutTipPercent(0);
                              }}
                              className="w-full bg-slate-50 border border-slate-200 outline-hidden pl-7 pr-2 py-1 text-xs font-semibold text-slate-700 rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Cash out option */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Método de Cobro</label>
                          <div className="grid grid-cols-1 gap-1.5">
                            {(['tarjeta', 'efectivo', 'transferencia'] as const).map((method) => (
                              <button
                                key={method}
                                type="button"
                                onClick={() => setCheckoutPaymentMethod(method)}
                                className={`p-2 font-bold text-xs rounded-xl border flex items-center gap-2 cursor-pointer transition-colors capitalize ${checkoutPaymentMethod === method ? 'bg-slate-900 text-white border-transparent' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}
                              >
                                {method === 'tarjeta' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                                {method === 'efectivo' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                                {method === 'transferencia' && <span className="w-2 h-2 rounded-full bg-purple-500" />}
                                {method}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <p className="text-center font-bold text-rose-500 py-12">No hay órdenes cargadas.</p>
                  )}

                  <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        alert('¡Ticket enviado a la caja registradora e impreso de prueba!');
                        setInvoicePrinted(true);
                      }}
                      className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 px-4 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1 transition-all"
                    >
                      <Receipt className="w-4 h-4" /> 
                      {invoicePrinted ? '¡Ticket Impreso de prueba! ✓' : 'Imprimir Ticket de Prueba'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleCheckoutSubmit}
                      className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1"
                    >
                      Registar Pago & Liberar Mesa (Caja)
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
