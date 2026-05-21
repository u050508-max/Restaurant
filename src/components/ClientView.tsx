import React, { useState } from 'react';
import { Customer } from '../types';
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Trash2, 
  X, 
  Check, 
  Star, 
  Grid, 
  Heart, 
  Sliders, 
  Sparkles,
  Award
} from 'lucide-react';

interface ClientViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export default function ClientView({
  customers,
  onAddCustomer,
  onDeleteCustomer
}: ClientViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  // Form Fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [clientFavTable, setClientFavTable] = useState<number>(0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    const newCustomer: Customer = {
      id: `c-${Date.now()}`,
      name: clientName,
      phone: clientPhone || '55-0000-0000',
      email: clientEmail || 'cliente@general.com',
      visits: 1, // Start with 1 on manual sign up
      notes: clientNotes,
      favoriteTableNumber: clientFavTable > 0 ? clientFavTable : undefined
    };

    onAddCustomer(newCustomer);
    setIsFormOpen(false);

    // Reset
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setClientNotes('');
    setClientFavTable(0);
  };

  const filteredCustomers = customers.filter(c => {
    return c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
           c.phone.includes(customerSearch) ||
           c.email.toLowerCase().includes(customerSearch.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Directorio de Clientes</h2>
          <p className="text-xs text-slate-400 mt-0.5">Administra perfiles de comensales frecuentes, notas alimenticias de alergias, preferencias de mesa y visitas</p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Registrar Cliente
        </button>
      </div>

      {/* Metrics Header bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Base de Datos</p>
            <h4 className="text-xl font-extrabold text-slate-800 mt-0.5 font-mono">{customers.length} comensales</h4>
            <p className="text-[9px] text-slate-400 mt-0.5">Clientes asiduos y asimilados</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Award className="w-5 h-5 text-xl" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Líder de Visitas</p>
            <h4 className="text-xl font-extrabold text-slate-800 mt-0.5 truncate max-w-[150px]">
              {customers.reduce((max, current) => (current.visits > max.visits) ? current : max, customers[0])?.name || 'Varios'}
            </h4>
            <p className="text-[9px] text-slate-400 mt-0.5">Socio distinguido del salón</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-sans">Visitas Totales</p>
            <h4 className="text-xl font-extrabold text-slate-800 mt-0.5 font-mono">{customers.reduce((sum, c) => sum + c.visits, 0)} visitas</h4>
            <p className="text-[9px] text-slate-400 mt-0.5">Asistencia consolidada histórica</p>
          </div>
        </div>
      </div>

      {/* Roster Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <label className="text-xs font-bold text-slate-500 shrink-0 select-none">Búsqueda rápida de clientes:</label>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Filtrar por nombre, correo electrónico, teléfono..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 text-xs text-slate-700 rounded-xl pl-9 pr-3 py-2.5 outline-hidden shadow-xs focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Form Overlay Drawer */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-100 p-6 space-y-4 shadow-2xl animate-scale-up text-xs font-semibold text-slate-500">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Registrar Cliente en Base de Datos</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Nombre Completo del Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Andrés García Treviño"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Celular / Teléfono</label>
                  <input
                    type="text"
                    placeholder="Ej. 55-1122-3344"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-hidden"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Correo Electrónico (Para Factura)</label>
                  <input
                    type="email"
                    placeholder="Ej. andres@gmail.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Preferencia de Mesa (Salón)</label>
                  <select
                    value={clientFavTable}
                    onChange={(e) => setClientFavTable(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-hidden text-xs"
                  >
                    <option value={0}>Sin preferencias de mesa...</option>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i+1} value={i+1}>Mesa {i+1}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Notas de Preferencia (Gustos, Términos, Alergias)</label>
                <textarea
                  placeholder="Ej. Alérgico a mariscos y aceites vegetales. Gusta pedir Ribeye término medio a tres cuartos..."
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-hidden"
                />
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
                  Cerrar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid of registered clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(c => {
          return (
            <div 
              key={c.id}
              className="border border-slate-100 bg-white rounded-2xl p-5 shadow-xs flex flex-col justify-between h-64 text-left hover:shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-extrabold flex items-center justify-center font-serif">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-[14px] truncate max-w-[155px]">{c.name}</h4>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">ID: #{c.id.split('-').pop()}</p>
                    </div>
                  </div>

                  {/* Visit Badge */}
                  <span className="text-[10px] font-black bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 flex items-center gap-1 font-mono text-slate-600">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" /> {c.visits} Visitas
                  </span>
                </div>

                {/* Info contact items */}
                <div className="space-y-1.5 text-[11px] text-slate-500 font-mono">
                  <p className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-300" /> {c.phone}
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-300" /> {c.email}
                  </p>
                  {c.favoriteTableNumber && (
                    <p className="flex items-center gap-1.5">
                      <Grid className="w-3.5 h-3.5 text-amber-400" /> Mesa Favorita: <strong className="text-slate-600">Mesa {c.favoriteTableNumber}</strong>
                    </p>
                  )}
                </div>

                {/* Preferences list */}
                {c.notes && (
                  <div className="text-[10px] font-sans text-slate-500 border-t border-slate-100 pt-2 line-clamp-2 italic leading-relaxed">
                    "{c.notes}"
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="border-t border-slate-50 pt-2 flex justify-end items-center">
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar al cliente "${c.name}"?`)) {
                      onDeleteCustomer(c.id);
                    }
                  }}
                  className="p-1 hover:bg-rose-50 rounded-md text-slate-400 hover:text-rose-500 cursor-pointer"
                  title="Eliminar Cliente"
                >
                  <Trash2 className="w-4 h-4 animate-fade-in" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredCustomers.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-12 text-center border text-slate-400 rounded-3xl">
            Ninguno de nuestros clientes coincide con los términos descritos.
          </div>
        )}
      </div>
    </div>
  );
}
