import React, { useState } from 'react';
import { MenuItem, MenuItemCategory, InventoryItem, MenuItemRecipeIngredient } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  ToggleLeft, 
  ToggleRight, 
  ListFilter,
  Package,
  BookOpen,
  X,
  AlertCircle
} from 'lucide-react';

interface MenuViewProps {
  menuItems: MenuItem[];
  inventory: InventoryItem[];
  onAddMenuItem: (menuItem: MenuItem) => void;
  onUpdateMenuItem: (menuItem: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
}

export default function MenuView({
  menuItems,
  inventory,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem
}: MenuViewProps) {
  // Filters
  const [activeCategory, setActiveCategory] = useState<'todos' | MenuItemCategory>('todos');
  const [menuSearch, setMenuSearch] = useState('');

  // Editing / Creating State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<MenuItemCategory>('fuertes');
  const [formPrice, setFormPrice] = useState<number>(150);
  const [formDescription, setFormDescription] = useState('');
  const [formAvailable, setFormAvailable] = useState(true);
  
  // Recipe Builder (Ingredients linked to the menu item)
  const [recipeIngredients, setRecipeIngredients] = useState<MenuItemRecipeIngredient[]>([]);
  const [selectedInvId, setSelectedInvId] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number>(1);

  const categories: MenuItemCategory[] = ['entradas', 'fuertes', 'bebidas', 'postres'];

  const handleOpenNewForm = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('fuertes');
    setFormPrice(150);
    setFormDescription('');
    setFormAvailable(true);
    setRecipeIngredients([]);
    setSelectedInvId(inventory[0]?.id || '');
    setSelectedAmount(1);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.price);
    setFormDescription(item.description);
    setFormAvailable(item.available);
    setRecipeIngredients(item.recipe || []);
    setSelectedInvId(inventory[0]?.id || '');
    setSelectedAmount(1);
    setIsFormOpen(true);
  };

  const handleAddIngredientToRecipe = () => {
    if (!selectedInvId || selectedAmount <= 0) return;
    
    // Check if ingredient already in recipe
    const existingIndex = recipeIngredients.findIndex(i => i.inventoryItemId === selectedInvId);
    if (existingIndex >= 0) {
      const updated = [...recipeIngredients];
      updated[existingIndex].amountNeeded = selectedAmount;
      setRecipeIngredients(updated);
    } else {
      setRecipeIngredients([...recipeIngredients, { inventoryItemId: selectedInvId, amountNeeded: selectedAmount }]);
    }
  };

  const handleRemoveRecipeIngredient = (invId: string) => {
    setRecipeIngredients(recipeIngredients.filter(ri => ri.inventoryItemId !== invId));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice < 0) return;

    const finalItem: MenuItem = {
      id: editingItem ? editingItem.id : `menu-${Date.now()}`,
      name: formName,
      category: formCategory,
      price: formPrice,
      description: formDescription,
      available: formAvailable,
      recipe: recipeIngredients
    };

    if (editingItem) {
      onUpdateMenuItem(finalItem);
    } else {
      onAddMenuItem(finalItem);
    }

    setIsFormOpen(false);
  };

  const handleToggleAvailability = (item: MenuItem) => {
    onUpdateMenuItem({
      ...item,
      available: !item.available
    });
  };

  // Filtered list
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'todos' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
                          item.description.toLowerCase().includes(menuSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Menú & Recetario</h2>
          <p className="text-xs text-slate-400 mt-0.5">Define especialidades, asigna costos de porciones y asocia recetas a insumos de almacén</p>
        </div>

        <button
          onClick={handleOpenNewForm}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Nuevo Platillo
        </button>
      </div>

      {/* Main Form Overlay Drawer */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100 shadow-2xl flex flex-col p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingItem ? `Editar Producto: ${editingItem.name}` : 'Crear Nueva Especialidad de Menú'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
              {/* Product Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Nombre del Platillo</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Tacos de Ribeye"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-hidden text-xs"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Categoría</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MenuItemCategory)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-hidden text-xs capitalize"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Precio Público MXN ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formPrice}
                    onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold px-3 py-2 outline-hidden text-xs font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Descripción en Menú (Ingredientes, Presentación)</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detalles sobre el plato que verá el mesero y el cliente..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-hidden text-xs"
                />
              </div>

              {/* Recipe Cost Builder */}
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Package className="w-4 h-4 text-amber-500" /> Receta de Descuento (Almacén)
                  </h4>
                  <p className="text-[10px] text-slate-400 font-normal">Cuando se pida, estos ingredientes se restan del inventario</p>
                </div>

                {/* Recipe Input Row */}
                <div className="flex flex-wrap items-end gap-3 text-xs">
                  <div className="flex-1 min-w-[150px] space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400 block">Ingrediente Base</label>
                    <select
                      value={selectedInvId}
                      onChange={(e) => setSelectedInvId(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-1.5 outline-hidden"
                    >
                      <option value="">Selecciona insumo...</option>
                      {inventory.map(i => (
                        <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                      ))}
                    </select>
                  </div>

                  <div className="w-28 space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400 block">Cantidad requerida</label>
                    <input
                      type="number"
                      step="any"
                      min="0.001"
                      value={selectedAmount}
                      onChange={(e) => setSelectedAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 text-slate-700 px-2 py-1.5 outline-hidden font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddIngredientToRecipe}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-3 rounded-lg cursor-pointer shrink-0 transition-colors"
                  >
                    Asociar
                  </button>
                </div>

                {/* Active Recipe Ingredients Loop */}
                {recipeIngredients.length > 0 ? (
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">Lista de Descuento:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {recipeIngredients.map((ri, index) => {
                        const invItem = inventory.find(i => i.id === ri.inventoryItemId);
                        return (
                          <div key={index} className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded-xl text-slate-700 shadow-2xs">
                            <span className="font-semibold text-[11px] truncate">{invItem?.name || 'Insumo'}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-amber-600 text-[11px]">
                                {ri.amountNeeded} <span className="text-[9px] text-slate-400 font-normal">{invItem?.unit}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveRecipeIngredient(ri.inventoryItemId)}
                                className="text-rose-400 hover:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 text-[10px] text-slate-400">
                    Ningún ingrediente asociado. Este artículo no descontará insumos de almacén.
                  </div>
                )}
              </div>

              {/* Status Select */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="form-available"
                  checked={formAvailable}
                  onChange={(e) => setFormAvailable(e.target.checked)}
                  className="w-4 h-4 border-slate-300 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="form-available" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  Disponible para venta en comandas (Activo)
                </label>
              </div>

              {/* Form Buttons */}
              <div className="border-t border-slate-50 pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  {editingItem ? 'Guardar Cambios' : 'Ingresar Platillo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Categories Bar & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <div className="flex overflow-x-auto gap-1 w-full md:w-auto p-0.5 bg-slate-200/60 rounded-xl">
          <button
            onClick={() => setActiveCategory('todos')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors cursor-pointer ${activeCategory === 'todos' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Todos ({menuItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors cursor-pointer ${activeCategory === cat ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {cat} ({menuItems.filter(i => i.category === cat).length})
            </button>
          ))}
        </div>

        {/* Filter input */}
        <div className="relative w-full md:w-64">
          <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar en menú..."
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 text-xs text-slate-700 rounded-xl pl-9 pr-3 py-2.5 outline-hidden shadow-xs focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Grid Menu Catalog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => {
          const categoryColors = {
            entradas: 'bg-blue-50 text-blue-700 border-blue-100',
            fuertes: 'bg-amber-50 text-amber-700 border-amber-100',
            bebidas: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            postres: 'bg-pink-50 text-pink-700 border-pink-100',
          };

          return (
            <div 
              key={item.id}
              className={`border border-slate-100 bg-white rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[170px] relative ${!item.available ? 'opacity-65 grayscale' : ''}`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className={`text-[9px] uppercase font-mono font-black border px-2 py-0.5 rounded-full ${categoryColors[item.category]}`}>
                    {item.category}
                  </span>

                  <span className="font-mono font-extrabold text-slate-900 border border-slate-100 rounded-md px-2 py-1 bg-slate-50/50 text-sm">
                    ${item.price}
                  </span>
                </div>

                <div className="text-left">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                    {item.description || 'Sin descripción provista.'}
                  </p>
                </div>
              </div>

              {/* Footer specs / controls */}
              <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between">
                <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  {item.recipe.length > 0 ? (
                    <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      📦 {item.recipe.length} insumos receta
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Sin ingredientes desc.</span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs">
                  {/* Toggle switch for availability */}
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className="p-1.5 hover:bg-slate-50 text-slate-500 rounded-lg cursor-pointer"
                    title={item.available ? 'Apagar disponibilidad' : 'Encender disponibilidad'}
                  >
                    {item.available ? (
                      <ToggleRight className="w-6 h-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-300" />
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenEditForm(item)}
                    className="p-1.5 hover:bg-slate-50 text-amber-600 rounded-lg cursor-pointer"
                    title="Editar Platillo"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar "${item.name}"?`)) {
                        onDeleteMenuItem(item.id);
                      }
                    }}
                    className="p-1.5 hover:bg-slate-50 text-rose-500 rounded-lg cursor-pointer"
                    title="Borrar Platillo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-3xl p-12 text-center border text-slate-400">
            Nuestros filtros no hallaron ningún plato coincidente que mostrar.
          </div>
        )}
      </div>
    </div>
  );
}
