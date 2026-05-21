import React, { useState } from 'react';
import { Table, Order, MenuItem, InventoryItem, StaffMember, Customer, MenuItemCategory } from '../types';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  DollarSign, 
  Utensils, 
  Clock, 
  CheckCircle, 
  Grid,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

interface DashboardProps {
  orders: Order[];
  tables: Table[];
  menuItems: MenuItem[];
  inventory: InventoryItem[];
  staff: StaffMember[];
  customers: Customer[];
  onNavigate: (view: string) => void;
  onSelectTable: (tableId: string) => void;
}

export default function Dashboard({
  orders,
  tables,
  menuItems,
  inventory,
  staff,
  customers,
  onNavigate,
  onSelectTable
}: DashboardProps) {
  // Metrics calculation
  const closedOrders = orders.filter(o => o.status === 'pagado');
  const activeOrders = orders.filter(o => o.status !== 'pagado');
  
  const todaySales = closedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalTips = closedOrders.reduce((sum, o) => sum + o.tip, 0);
  
  const occupiedTablesCount = tables.filter(t => t.status === 'ocupada').length;
  const totalTablesCount = tables.length;
  const occupiedPercentage = totalTablesCount > 0 ? Math.round((occupiedTablesCount / totalTablesCount) * 105) : 0;
  
  const lowStockCount = inventory.filter(i => i.quantity <= i.minQuantity).length;
  
  // Sales by Category
  const categorySales = {
    entradas: 0,
    fuertes: 0,
    bebidas: 0,
    postres: 0
  };
  
  orders.forEach(order => {
    order.items.forEach(item => {
      const menu = menuItems.find(m => m.id === item.menuItemId);
      if (menu) {
        categorySales[menu.category] += item.price * item.quantity;
      }
    });
  });

  const totalCategorySales = Object.values(categorySales).reduce((a, b) => a + b, 0) || 1;
  const categoryColors = {
    entradas: '#3b82f6', // blue
    fuertes: '#f59e0b', // amber
    bebidas: '#10b981', // emerald
    postres: '#ec4899'  // pink
  };

  // 5-day sales data for chart
  const getLast5Days = () => {
    const dates = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }));
    }
    return dates;
  };

  const salesByDay = [1540, 2430, 1890, 2800, todaySales]; // Mix of historical inputs + live total
  const maxSalesVal = Math.max(...salesByDay, 2000) * 1.1;

  // Render SVG Line Chart
  const renderLineChart = () => {
    const days = getLast5Days();
    const width = 500;
    const height = 180;
    const padding = 35;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = salesByDay.map((val, idx) => {
      const x = padding + (idx / (salesByDay.length - 1)) * chartWidth;
      const y = height - padding - (val / maxSalesVal) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Grids */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + ratio * chartHeight;
          const val = Math.round(maxSalesVal * (1 - ratio));
          return (
            <g key={i} className="opacity-25">
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4" />
              <text x={padding - 5} y={y + 4} fill="#64748b" className="text-[10px] text-right font-mono" textAnchor="end">
                ${val}
              </text>
            </g>
          );
        })}
        
        {/* Line Path */}
        <polyline
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="transition-all duration-500 ease-in-out"
        />

        {/* Target Points with Tooltips */}
        {salesByDay.map((val, idx) => {
          const x = padding + (idx / (salesByDay.length - 1)) * chartWidth;
          const y = height - padding - (val / maxSalesVal) * chartHeight;
          return (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={x}
                cy={y}
                r="6"
                fill="#ffffff"
                stroke="#d97706"
                strokeWidth="3"
                className="transition-transform duration-200 hover:scale-150"
              />
              <text x={x} y={y - 10} fill="#1e293b" className="text-[10px] font-bold fill-slate-800 text-center font-mono opacity-0 group-hover:opacity-100 transition-opacity" textAnchor="middle bg-slate-900">
                ${Math.round(val)}
              </text>
              <text x={x} y={height - padding + 15} fill="#64748b" className="text-[10px] font-medium" textAnchor="middle">
                {days[idx]}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // Render SVG Donut Chart
  const renderDonutChart = () => {
    const width = 160;
    const height = 160;
    const radius = 60;
    const strokeWidth = 22;
    const circumference = 2 * Math.PI * radius;
    const center = width / 2;

    let accumulatedPercentage = 0;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 w-full">
        <div className="relative w-40 h-40">
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />
            {Object.entries(categorySales).map(([cat, val]) => {
              const perc = val / totalCategorySales;
              if (perc === 0) return null;
              
              const strokeDashoffset = circumference - (perc * circumference);
              const rotation = (accumulatedPercentage * 360) - 90;
              accumulatedPercentage += perc;

              return (
                <circle
                  key={cat}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={categoryColors[cat as MenuItemCategory]}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(${rotation} ${center} ${center})`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-slate-400 font-medium">Total</span>
            <span className="text-lg font-bold text-slate-800 font-mono">
              ${Math.round(orders.reduce((sum, o) => sum + o.subtotal, 0))}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full max-w-[200px]">
          {Object.entries(categorySales).map(([cat, val]) => {
            const perc = Math.round((val / totalCategorySales) * 100);
            return (
              <div key={cat} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: categoryColors[cat as MenuItemCategory] }}
                  />
                  <span className="capitalize text-slate-600 font-medium">{cat}</span>
                </div>
                <div className="text-right font-semibold font-mono text-slate-800">
                  ${Math.round(val)} <span className="text-[10px] text-slate-400 font-normal">({perc}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div id="metric-sales" className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4 transition-all hover:shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Ingresos Hoy</p>
            <h3 className="text-2xl font-bold font-mono text-slate-800 mt-1">${todaySales.toLocaleString('es-MX', { minimumFractionDigits: 0 })}</h3>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
              Propinas: <span className="text-emerald-600 font-semibold">${totalTips}</span>
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div id="metric-tables" className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4 transition-all hover:shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Utensils className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Mesa de Servicio</p>
            <h3 className="text-2xl font-bold font-mono text-slate-800 mt-1">
              {occupiedTablesCount} <span className="text-xs font-normal text-slate-400">/ {totalTablesCount}</span>
            </h3>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-700" 
                style={{ width: `${Math.min(occupiedPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div id="metric-orders" className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4 transition-all hover:shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Afluencia Activa</p>
            <h3 className="text-2xl font-bold font-mono text-slate-800 mt-1">{activeOrders.length}</h3>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-blue-500 inline" /> {activeOrders.filter(o => o.status === 'pendiente' || o.status === 'preparando').length} comandas en cocina
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div id="metric-stock" className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4 transition-all hover:shadow-xs">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lowStockCount > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-500'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Alertas Abasto</p>
            <h3 className="text-2xl font-bold font-mono text-slate-800 mt-1">{lowStockCount}</h3>
            <p className="text-[10px] text-slate-400 mt-1">
              {lowStockCount > 0 ? 'Ingredientes en stock crítico' : 'Todos los insumos estables'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Charts & Visual Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line Chart Component */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs lg:col-span-7 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Evolución de Ventas Diarias</h3>
              <p className="text-xs text-slate-400">Ingresos semanales acumulados al corte de hoy</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 font-mono flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14% vs Sem. Ant.
            </span>
          </div>
          <div className="h-44 flex items-center justify-center text-slate-500">
            {renderLineChart()}
          </div>
        </div>

        {/* Donut Chart Component */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs lg:col-span-5 flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800">Composición de Ventas</h3>
            <p className="text-xs text-slate-400">Distribución de consumo por categoría de producto</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {renderDonutChart()}
          </div>
        </div>
      </div>

      {/* Tables Floor Plan Overview and Live Orders Kitchen Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Kitchen Orders (Comandas en Cocina) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs lg:col-span-8 flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Monitor en Tiempo Real (Cocinando)</h3>
              <p className="text-xs text-slate-400">Seguimiento de pedidos en curso para chefs y meseros</p>
            </div>
            <button 
              onClick={() => onNavigate('mesas')} 
              className="text-amber-600 hover:text-amber-700 font-semibold text-xs transition-colors flex items-center gap-1"
            >
              Comandas detalladas <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl">
              <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
              <p className="text-slate-600 text-xs font-bold">¡Cocina al día!</p>
              <p className="text-slate-400 text-[10px] max-w-xs mt-0.5">No hay comandas pendientes de preparar ni servir en este momento.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {activeOrders.map((order) => {
                const waiter = staff.find(s => s.id === order.waiterId);
                const chef = staff.find(s => s.id === order.chefId);
                
                // Calculate elapsed minutes
                const elapsedMin = Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000);
                
                let badgeStyle = 'bg-rose-50 text-rose-600 border-rose-100';
                let statusName = 'Pendiente';
                if (order.status === 'preparando') {
                  badgeStyle = 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse';
                  statusName = 'Preparando';
                } else if (order.status === 'listo') {
                  badgeStyle = 'bg-purple-50 text-purple-600 border-purple-100';
                  statusName = '¡Para servir!';
                } else if (order.status === 'servido') {
                  badgeStyle = 'bg-blue-50 text-blue-600 border-blue-100';
                  statusName = 'Servido / Consumiendo';
                }

                return (
                  <div key={order.id} className="border border-slate-100 hover:border-slate-200 transition-colors p-3.5 rounded-xl bg-slate-50/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-700 text-xs">{order.tableName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{order.id.split('-').pop()}</span>
                        <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                          {statusName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-0.5 ml-auto sm:ml-0 bg-slate-100 px-1.5 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-slate-400" /> Hace {elapsedMin} min
                        </span>
                      </div>
                      
                      {/* Products display */}
                      <div className="text-xs text-slate-600 font-medium">
                        {order.items.map((item, idx) => {
                          const menuObj = menuItems.find(m => m.id === item.menuItemId);
                          return (
                            <span key={idx} className="inline-block bg-white border border-slate-100 rounded-md px-1.5 py-0.5 mr-1.5 mb-1 text-[11px] font-mono text-slate-600">
                              <span className="font-bold text-amber-600">{item.quantity}x</span> {menuObj?.name || 'Item'}
                              {item.notes && <span className="text-slate-400 text-[10px] block font-sans">({item.notes})</span>}
                            </span>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                        <span>A cargo de: <strong className="text-slate-600">{waiter?.name.split(' ')[1] || 'Sin mesero'}</strong></span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>Cocina: <strong className="text-slate-600">{chef?.name.split(' ')[1] || 'General'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 border-t border-slate-100 sm:border-0 pt-2 sm:pt-0">
                      <button
                        onClick={() => onSelectTable(order.tableId)}
                        className="w-full sm:w-auto text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-600 transition-colors cursor-pointer"
                      >
                        Gestionar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Operations Sidebar (Restaurante de un vistazo) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-2">Secciones Rápidas</h3>
            <p className="text-xs text-slate-400 mb-4">Atajos administrativos para la jornada laboral</p>
            
            <div className="space-y-2">
              <button 
                onClick={() => onNavigate('mesas')} 
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/20 text-slate-600 hover:text-amber-800 text-xs font-semibold transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Grid className="w-4 h-4 text-amber-500 text-lg group-hover:scale-110 transition-transform" />
                  <span>Mapa de Mesas</span>
                </div>
                <span className="text-[10px] bg-slate-100 group-hover:bg-amber-100/50 text-slate-500 rounded px-1.5 py-0.5 font-mono">{totalTablesCount}</span>
              </button>

              <button 
                onClick={() => onNavigate('inventario')} 
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 text-slate-600 hover:text-blue-800 text-xs font-semibold transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-blue-500 text-lg group-hover:scale-110 transition-transform" />
                  <span>Insumos y Almacén</span>
                </div>
                {lowStockCount > 0 && <span className="text-[10px] bg-rose-50 text-rose-600 rounded px-1.5 py-0.5 font-mono font-bold animate-pulse">{lowStockCount} Bajo stock</span>}
              </button>

              <button 
                onClick={() => onNavigate('personal')} 
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 text-slate-600 hover:text-emerald-800 text-xs font-semibold transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-emerald-500 text-lg group-hover:scale-110 transition-transform" />
                  <span>Roles y Horarios del Día</span>
                </div>
                <span className="text-[10px] bg-slate-100 group-hover:bg-emerald-100/50 text-slate-500 rounded px-1.5 py-0.5 font-mono">
                  {staff.filter(s => s.status === 'activo').length} Activos
                </span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-6">
            <div className="bg-slate-50/50 p-3 rounded-xl text-[11px] text-slate-500 space-y-1.5">
              <div className="flex justify-between font-mono">
                <span>Registros de clientes:</span>
                <span className="font-bold text-slate-700">{customers.length}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Capacidad Total Salón:</span>
                <span className="font-bold text-slate-700">{tables.reduce((sum, t) => sum + t.capacity, 0)} cubiertos</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Platillos en menú:</span>
                <span className="font-bold text-slate-700">{menuItems.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
