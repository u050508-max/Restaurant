import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { 
  Plus, 
  Search, 
  TrendingUp, 
  Percent, 
  Trash2, 
  AlertTriangle, 
  Truck, 
  X, 
  CheckCircle,
  TrendingDown,
  ChevronDown
} from 'lucide-react';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onAddInventoryItem: (item: InventoryItem) => void;
  onUpdateInventoryItem: (item: InventoryItem) => void;
  onDeleteInventoryItem: (id: string) => void;
}

export default function InventoryView({
  inventory,
  onAddInventoryItem,
  onUpdateInventoryItem,
  onDeleteInventoryItem
}: InventoryViewProps) {
  const [inventSearch, setInventSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterType, setFilterType] = useState<'todos' | 'bajo' | 'saludable'>('todos');

  // Fields for new ingredient
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState<number>(10);
  const [itemUnit, setItemUnit] = useState('kg');
  const [itemMinQty, setItemMinQty] = useState<number>(3);
  const [itemCost, setItemCost] = useState<number>(80);

  // Quick Inline Restock States
  const [quickRestockAmts, setQuickRestockAmts] = useState<Record<string, string>>({});

  const handleCreateNewItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || itemQuantity < 0 || itemMinQty < 0) return;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: itemName,
      quantity: itemQuantity,
      unit: itemUnit,
      minQuantity: itemMinQty,
      cost: itemCost
    };

    onAddInventoryItem(newItem);
    setIsFormOpen(false);

    // reset fields
    setItemName('');
    setItemQuantity(10);
    setItemUnit('kg');
    setItemMinQty(3);
    setItemCost(80);
  };

  const handleQuickRestock = (id: string) => {
    const rawAmt = quickRestockAmts[id];
    const addAmt = parseFloat(rawAmt) || 0;
    if (addAmt <= 0) return;

    const currentItem = inventory.find(i => i.id === id);
    if (currentItem) {
      onUpdateInventoryItem({
        ...currentItem,
        quantity: currentItem.quantity + addAmt
      });
      // Clear specific input
      setQuickRestockAmts(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleDeductOne = (id: string, amountToDeduct = 1) => {
    const currentItem = inventory.find(i => i.id === id);
    if (currentItem && currentItem.quantity >= amountToDeduct) {
      onUpdateInventoryItem({
        ...currentItem,
        quantity: Math.max(0, currentItem.quantity - amountToDeduct)
      });
    }
  };

  // Sum valuations
  const totalStockInvestment = inventory.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
  const lowStockCount = inventory.filter(i => i.quantity <= i.minQuantity).length;

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(inventSearch.toLowerCase()) || 
                          item.unit.toLowerCase().includes(inventSearch.toLowerCase());
    const isLow = item.quantity <= item.minQuantity;
    
    if (filterType === 'bajo') return matchesSearch && isLow;
    if (filterType === 'saludable') return matchesSearch && !isLow;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Almacén & Inventarios</h2>
          <p className="text-xs text-slate-400 mt-0.5">Control de despensa de materias primas, alertas automáticas de abasto y reabastecimiento exprés</p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Registrar Insumo
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Valor de Almacén</p>
            <h4 className="text-xl font-extrabold text-slate-800 mt-0.5 font-mono">${totalStockInvestment.toLocaleString('es-MX', { minimumFractionDigits: 0 })}</h4>
            <p className="text-[9px] text-slate-400 mt-0.5">Costo acumulado de insumos activos</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lowStockCount > 0 ? 'bg-rose-50 text-rose-500 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Alertas de Rebase</p>
            <h4 className="text-xl font-extrabold text-slate-800 mt-0.5 font-mono">{lowStockCount} materiales</h4>
            <p className="text-[9px] text-slate-400 mt-0.5">{lowStockCount > 0 ? 'Requieren compra urgente' : 'Todos los insumos óptimos'}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Insumos Registrados</p>
            <h4 className="text-xl font-extrabold text-slate-800 mt-0.5 font-mono">{inventory.length} tipos</h4>
            <p className="text-[9px] text-slate-400 mt-0.5">Variedad de almacén activo</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <div className="flex p-0.5 bg-slate-200/60 rounded-xl gap-0.5 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setFilterType('todos')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${filterType === 'todos' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Todos ({inventory.length})
          </button>
          <button
            onClick={() => setFilterType('bajo')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${filterType === 'bajo' ? 'bg-rose-550 bg-white text-rose-600 shadow-3xs' : 'text-slate-500 hover:text-rose-600'}`}
          >
            Bajo Stock ({inventory.filter(i => i.quantity <= i.minQuantity).length})
          </button>
          <button
            onClick={() => setFilterType('saludable')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${filterType === 'saludable' ? 'bg-white text-emerald-600 shadow-3xs' : 'text-slate-500 hover:text-emerald-700'}`}
          >
            Estables ({inventory.filter(i => i.quantity > i.minQuantity).length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar insumos..."
            value={inventSearch}
            onChange={(e) => setInventSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 text-xs text-slate-700 rounded-xl pl-9 pr-3 py-2.5 outline-hidden shadow-xs focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Main Form Drawer */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-100 p-6 space-y-4 shadow-2xl animate-scale-up text-xs font-semibold text-slate-500">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Registrar Insumo de Almacén</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewItemSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Nombre del Insumo / Materia Prima</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Tomate Verde, Pechuga de Pollo"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Stock Inicial</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Unidad de Medida</label>
                  <select
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-hidden"
                  >
                    <option value="kg">kg (Kilogramos)</option>
                    <option value="litros">litros (Litros)</option>
                    <option value="piezas">piezas (Piezas)</option>
                    <option value="paquetes">paquetes (Paquetes)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Límite Crítico (Alerta Bajo)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={itemMinQty}
                    onChange={(e) => setItemMinQty(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-hidden font-mono"
                    title="Alerta si el stock decae por debajo de este límite"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-0.5">
                    Costo Compra Unid. ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={itemCost}
                    onChange={(e) => setItemCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Confirmar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid of supplies with fast re-stock bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.map(item => {
          const isLow = item.quantity <= item.minQuantity;
          const statusBg = isLow ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700';
          const alertClass = isLow ? 'outline-2 outline-rose-500 outline-offset-1 text-slate-900' : '';

          return (
            <div 
              key={item.id}
              className={`border border-slate-100 bg-white rounded-2xl p-4 shadow-3xs flex flex-col justify-between h-44 transition-all hover:shadow-sm ${alertClass}`}
            >
              {/* Card Title Header */}
              <div className="flex items-start justify-between">
                <div className="text-left max-w-[200px]">
                  <span className="text-[10px] text-slate-400 font-mono font-bold tracking-wider uppercase">Insumo ID: #{item.id.split('-').pop()}</span>
                  <h4 className="font-extrabold text-slate-800 text-sm mt-0.5 truncate">{item.name}</h4>
                </div>

                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${statusBg}`}>
                  {isLow ? '⚠️ Crítico' : '✓ Estable'}
                </span>
              </div>

              {/* Quantification row */}
              <div className="flex justify-between items-end py-2">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Disponible</span>
                  <span className="text-lg font-black font-mono text-slate-800">
                    {item.quantity} <span className="text-xs font-normal text-slate-400 font-sans">{item.unit}</span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Inversión</span>
                  <span className="text-xs font-bold font-mono text-slate-600 block">
                    ${Math.round(item.cost * item.quantity)}
                  </span>
                  <span className="text-[9px] text-slate-400 italic block">
                    (${item.cost} x {item.unit})
                  </span>
                </div>
              </div>

              {/* Restock interactive controls bar */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-1">
                {/* Micro restocker form */}
                <div className="flex items-center gap-1 flex-1">
                  <input
                    type="number"
                    step="any"
                    placeholder={`Restock (${item.unit})`}
                    value={quickRestockAmts[item.id] || ''}
                    onChange={(e) => setQuickRestockAmts(prev => ({ ...prev, [item.id]: e.target.value }))}
                    className="w-full bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-2 py-1.5 outline-hidden text-[11px] font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuickRestock(item.id)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs p-1.5 rounded-lg shrink-0 cursor-pointer transition-colors"
                    title="Cargar abastecimiento"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Trash trigger */}
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar "${item.name}"? Cualquier receta vinculada a este ingrediente perderá su referencia de descuento.`)) {
                      onDeleteInventoryItem(item.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
                  title="Eliminar del almacén"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>

            </div>
          );
        })}

        {filteredInventory.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-12 text-center rounded-3xl border text-slate-400">
            No se hallaron materiales con los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
}
