import React, { useState, useEffect } from 'react';
import { Order, MenuItem, StaffMember, OrderStatus } from '../types';
import { 
  Flame, 
  CheckCircle, 
  Clock, 
  RotateCcw, 
  ChefHat, 
  AlertCircle, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  User, 
  Coffee, 
  BellRing,
  UtensilsCrossed,
  Hourglass,
  ArrowRight
} from 'lucide-react';

interface KitchenMonitorProps {
  orders: Order[];
  menuItems: MenuItem[];
  staff: StaffMember[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  currentUser?: StaffMember | null;
}

export default function KitchenMonitor({
  orders,
  menuItems,
  staff,
  onUpdateOrderStatus,
  currentUser
}: KitchenMonitorProps) {
  const [filterChefId, setFilterChefId] = useState<string>('todos');
  const [activeTab, setActiveTab] = useState<'cola' | 'preparando' | 'completas'>('cola');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Audio chime simulation triggers (visual notification)
  const [visualAlert, setVisualAlert] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Pre-set filter to current logged chef if possible
  useEffect(() => {
    if (currentUser?.role === 'chef') {
      setFilterChefId(currentUser.id);
    }
  }, [currentUser]);

  // Audio simulation alert when new order enters
  useEffect(() => {
    const pendingOrders = orders.filter(o => o.status === 'pendiente');
    if (pendingOrders.length > 0) {
      const topPending = pendingOrders[0];
      setVisualAlert(`¡Nueva comanda para ${topPending.tableName}!`);
      const timer = setTimeout(() => setVisualAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [orders.length]);

  // Handle status update & show chime
  const handleStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    onUpdateOrderStatus(orderId, nextStatus);
  };

  // Helper to obtain time difference
  const getElapsedMinutes = (dateTimeStr: string): number => {
    const created = new Date(dateTimeStr);
    const diffMs = currentTime.getTime() - created.getTime();
    return Math.floor(diffMs / 60000);
  };

  // Get difficulty color based on elapsed time
  const getElapsedTimeColorAndLabel = (dateTimeStr: string) => {
    const mins = getElapsedMinutes(dateTimeStr);
    if (mins < 5) return { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', label: 'Recién llegada' };
    if (mins < 15) return { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', label: 'Tiempo regular' };
    return { color: 'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse font-black', label: '¡CON RETRASO!' };
  };

  // Filter orders related to active kitchen state
  const kitchenOrders = orders.filter(order => {
    if (order.status === 'pagado') return false;
    
    // Filter by assigned Chef
    if (filterChefId !== 'todos' && order.chefId !== filterChefId) {
      return false;
    }
    
    if (activeTab === 'cola') {
      return order.status === 'pendiente';
    }
    if (activeTab === 'preparando') {
      return order.status === 'preparando';
    }
    if (activeTab === 'completas') {
      // In kitchen monitor view, completed orders would be 'listo' and 'servido' (but before 'pagado' which goes to cashier)
      return order.status === 'listo' || order.status === 'servido';
    }
    return true;
  });

  // Calculate some analytics for kitchen performance
  const pendingCount = orders.filter(o => o.status === 'pendiente').length;
  const preparingCount = orders.filter(o => o.status === 'preparando').length;
  const readyTodayCount = orders.filter(o => o.status === 'listo').length;

  return (
    <div className="space-y-6">
      
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500 animate-bounce" />
            <h2 className="text-xl font-bold text-slate-800">Monitor de Comandero y Cocina</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Control de tiempos de cocción, asignación de cocinas y control de pase de servicio</p>
        </div>

        {/* Global Select filter for Chef */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 font-mono whitespace-nowrap uppercase">Cocina Activa:</label>
          <select
            value={filterChefId}
            onChange={(e) => setFilterChefId(e.target.value)}
            className="bg-white border border-slate-200 text-slate-750 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
            disabled={currentUser?.role === 'chef'} // Locks for chef accounts to keep them focused
          >
            <option value="todos">Todos los Chefs (Monitoreo General)</option>
            {staff.filter(s => s.role === 'chef' && s.status === 'activo').map(s => (
              <option key={s.id} value={s.id}>{s.name} (Chef)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Chime Overlay for New Orders */}
      {visualAlert && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 p-3.5 rounded-2xl shadow-lg border border-amber-400/20 flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3 text-left">
            <BellRing className="w-5 h-5 text-slate-950 animate-pulse" />
            <div>
              <p className="font-extrabold text-xs uppercase tracking-wider">Aviso Sonoro de Cocina</p>
              <p className="text-xs font-medium font-serif">{visualAlert}</p>
            </div>
          </div>
          <span className="text-[10px] bg-slate-950/20 px-2 py-0.5 rounded font-mono font-black">ENTRANTE</span>
        </div>
      )}

      {/* Analytics Kinds Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-xs text-left">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Ordenes en Cola</span>
            <div className="flex items-baseline gap-1.5 label text-left">
              <span className="text-2xl font-extrabold text-slate-800">{pendingCount}</span>
              <span className="text-[10px] text-orange-500 font-bold">Por Iniciar</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-xs text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">En Preparación</span>
            <div className="flex items-baseline gap-1.5 text-left">
              <span className="text-2xl font-extrabold text-slate-800">{preparingCount}</span>
              <span className="text-[10px] text-amber-600 font-bold">En Fuego</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-xs text-left">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Listas en Pase</span>
            <div className="flex items-baseline gap-1.5 text-left">
              <span className="text-2xl font-extrabold text-slate-800">{readyTodayCount}</span>
              <span className="text-[10px] text-purple-600 font-bold">Por Servir</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center gap-3 shadow-xs text-left">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-500 shrink-0">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-450 text-slate-400 font-bold uppercase block tracking-wider">Operador Chef</span>
            <div className="text-left mt-0.5">
              <p className="font-extrabold text-xs text-white truncate max-w-[130px]">{currentUser?.name || "Administrador"}</p>
              <p className="text-[10px] text-amber-500 font-mono">Terminal de Cocción</p>
            </div>
          </div>
        </div>

      </div>

      {/* Tab Selectors */}
      <div className="bg-slate-200/60 p-1.5 rounded-2xl flex max-w-md border border-slate-250">
        <button
          onClick={() => setActiveTab('cola')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${activeTab === 'cola' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Hourglass className="w-4 h-4 text-orange-500" />
          <span>Cola Recibidos</span>
          {pendingCount > 0 && (
            <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('preparando')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${activeTab === 'preparando' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Flame className="w-4 h-4 text-amber-500" />
          <span>En Estufa</span>
          {preparingCount > 0 && (
            <span className="bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black">
              {preparingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('completas')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${activeTab === 'completas' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <CheckCircle className="w-4 h-4 text-purple-500" />
          <span>Completadas (Al Mesero)</span>
        </button>
      </div>

      {/* Orders Grid Rendering */}
      {kitchenOrders.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-3.5 shadow-xs">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <UtensilsCrossed className="w-8 h-8 opacity-65" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-800 text-base">No hay órdenes en este estado</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-normal">
              {activeTab === 'cola' && "Todos los pedidos han sido atendidos por cocina. ¡Excelente ritmo de servicio!"}
              {activeTab === 'preparando' && "No posees comanda encendida o cocinándose actualmente."}
              {activeTab === 'completas' && "Ninguna cocina ha terminado platillos en esta sesión todavía."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kitchenOrders.map((order) => {
            const timeInfo = getElapsedTimeColorAndLabel(order.createdAt);
            const waiterObj = staff.find(s => s.id === order.waiterId);
            const chefObj = staff.find(s => s.id === order.chefId);

            return (
              <div 
                key={order.id} 
                className={`bg-white border text-left rounded-3xl overflow-hidden transition-all duration-300 relative ${activeTab === 'preparando' ? 'border-amber-500/40 shadow-md shadow-amber-500/2' : 'border-slate-100 shadow-xs'}`}
              >
                {/* Header card indicator */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block font-mono">Ubicación Comanda</span>
                    <h4 className="font-black text-slate-800 text-[15px]">{order.tableName}</h4>
                  </div>
                  
                  {/* Elapsed Timer Counter */}
                  <div className={`px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-600 font-mono border ${timeInfo.color} flex items-center gap-1.5`}>
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Hace {getElapsedMinutes(order.createdAt)} min</span>
                  </div>
                </div>

                {/* Staff identities labels */}
                <div className="px-4 py-2 bg-slate-100/50 border-b border-slate-100 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
                  <div className="truncate">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Envía (Mesero):</span>
                    <span className="font-bold text-slate-700">{waiterObj?.name || 'Comensal'}</span>
                  </div>
                  <div className="truncate text-right border-l border-slate-200 pl-2">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Prepara (Chef):</span>
                    <span className="font-bold text-amber-600">{chefObj?.name.split(' ')[0] || 'Asignado'}</span>
                  </div>
                </div>

                {/* Items loop */}
                <div className="p-4 space-y-3 flex-1 min-h-[140px]">
                  <span className="text-[10px] uppercase font-bold text-slate-450 text-slate-400 tracking-wider font-mono">Platillos a Preparar:</span>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {order.items.map((item, idx) => {
                      const menuItem = menuItems.find(m => m.id === item.menuItemId);
                      return (
                        <div key={idx} className="flex gap-2.5 items-start py-2 border-b border-slate-50 last:border-0 text-xs">
                          {/* Quantity bubble */}
                          <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-500 font-black font-mono flex items-center justify-center shrink-0">
                            {item.quantity}x
                          </span>
                          <div className="flex-1 text-left">
                            <p className="font-black text-slate-800 leading-snug">{menuItem?.name || "Insumo Eliminado"}</p>
                            {item.notes ? (
                              <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100/30 px-2 py-0.5 rounded-md mt-1 italic font-medium">
                                Nota: "{item.notes}"
                              </p>
                            ) : (
                              <p className="text-[10px] text-slate-400 capitalize mt-0.5 font-mono">{menuItem?.category}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions Box */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/40">
                  {order.status === 'pendiente' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'preparando')}
                      className="w-full bg-slate-900 text-amber-500 hover:bg-slate-800 font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                    >
                      <Flame className="w-4.5 h-4.5 animate-pulse text-amber-500" />
                      <span>Comenzar Preparación</span>
                    </button>
                  )}

                  {order.status === 'preparando' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'listo')}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                    >
                      <CheckCircle className="w-4.5 h-4.5 text-slate-950" />
                      <span>Listo (Enviar al Mesero)</span>
                    </button>
                  )}

                  {(order.status === 'listo' || order.status === 'servido') && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-purple-600 bg-purple-500/10 border border-purple-500/20 py-2 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Terminado y en Pase al Mesero</span>
                      </div>
                      
                      {currentUser?.role !== 'chef' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'pendiente')}
                          className="w-full text-[10px] font-bold py-1 text-slate-400 hover:text-slate-600 font-mono text-center flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" /> Reabrir en Cocina
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
