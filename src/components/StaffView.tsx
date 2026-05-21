import React, { useState } from 'react';
import { StaffMember, StaffRole, StaffSchedule } from '../types';
import { 
  Plus, 
  Clock, 
  Phone, 
  Trash2, 
  X, 
  Check, 
  Calendar, 
  UserPlus, 
  Briefcase, 
  MapPin, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';

interface StaffViewProps {
  staff: StaffMember[];
  onAddStaffMember: (member: StaffMember) => void;
  onUpdateStaffMember: (member: StaffMember) => void;
  onDeleteStaffMember: (id: string) => void;
}

export default function StaffView({
  staff,
  onAddStaffMember,
  onUpdateStaffMember,
  onDeleteStaffMember
}: StaffViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeRoleFilter, setActiveRoleFilter] = useState<'todos' | StaffRole>('todos');

  // Fields
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<StaffRole>('mesero');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  
  // Create schedule defaults
  const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const [editShifts, setEditShifts] = useState<Record<string, string>>({
    'Lunes': '13:00 - 22:00',
    'Martes': '13:00 - 22:00',
    'Miércoles': '13:00 - 22:00',
    'Jueves': '13:00 - 22:00',
    'Viernes': '14:00 - 23:30',
    'Sábado': '14:00 - 23:30',
    'Domingo': 'Descanso'
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    // Convert shifts to types
    const formattedSchedule: StaffSchedule[] = Object.entries(editShifts)
      .filter(([_, value]) => value !== 'Descanso' && value !== '')
      .map(([day, shift]) => ({ day, shift: shift as string }));

    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: formName,
      role: formRole,
      phone: formPhone || '55-0000-0000',
      status: 'activo',
      schedule: formattedSchedule,
      password: formPassword.trim() || '1234'
    };

    onAddStaffMember(newStaff);
    setIsFormOpen(false);

    // Reset fields
    setFormName('');
    setFormRole('mesero');
    setFormPhone('');
    setFormPassword('');
    setEditShifts({
      'Lunes': '13:00 - 22:00',
      'Martes': '13:00 - 22:00',
      'Miércoles': '13:00 - 22:00',
      'Jueves': '13:00 - 22:00',
      'Viernes': '14:00 - 23:30',
      'Sábado': '14:00 - 23:30',
      'Domingo': 'Descanso'
    });
  };

  const handleUpdateShiftHours = (member: StaffMember, day: string, nextShift: string) => {
    // Modify existing member schedule
    let updatedSchedule = [...member.schedule];
    const index = updatedSchedule.findIndex(s => s.day === day);

    if (nextShift === 'Descanso' || nextShift === '') {
      // remove
      updatedSchedule = updatedSchedule.filter(s => s.day !== day);
    } else if (index >= 0) {
      updatedSchedule[index].shift = nextShift;
    } else {
      updatedSchedule.push({ day, shift: nextShift });
    }

    onUpdateStaffMember({
      ...member,
      schedule: updatedSchedule
    });
  };

  const handleToggleStatus = (member: StaffMember) => {
    onUpdateStaffMember({
      ...member,
      status: member.status === 'activo' ? 'inactivo' : 'activo'
    });
  };

  const filteredStaff = staff.filter(member => {
    if (activeRoleFilter === 'todos') return true;
    return member.role === activeRoleFilter;
  });

  const roleColors = {
    chef: 'bg-rose-50 border-rose-100 text-rose-700',
    mesero: 'bg-amber-50 border-amber-100 text-amber-700',
    cajero: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    administrador: 'bg-blue-50 border-blue-100 text-blue-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Personal & Horarios</h2>
          <p className="text-xs text-slate-400 mt-0.5">Controla altas de chefs, meseros y cajeros, define turnos de trabajo y verifica la cobertura semanal</p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Registrar Empleado
        </button>
      </div>

      {/* Roster tab filters */}
      <div className="flex overflow-x-auto gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-250 shrink-0 max-w-max">
        <button
          onClick={() => setActiveRoleFilter('todos')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${activeRoleFilter === 'todos' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Todo el Equipo ({staff.length})
        </button>
        {([ 'chef', 'mesero', 'cajero', 'administrador' ] as StaffRole[]).map((r) => (
          <button
            key={r}
            onClick={() => setActiveRoleFilter(r)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${activeRoleFilter === r ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {r}s ({staff.filter(s => s.role === r).length})
          </button>
        ))}
      </div>

      {/* Create form drawer */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl border border-slate-100 p-6 space-y-4 shadow-2xl animate-scale-up text-xs font-semibold text-slate-500">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Registrar Nuevo Miembro de Equipo</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Rodrigo Gómez"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-hidden"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Teléfono (Contacto)</label>
                  <input
                    type="text"
                    placeholder="Ej. 55-1234-5678"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Rol Operativo</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as StaffRole)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-hidden capitalize text-xs"
                  >
                    <option value="chef">Chef / Cocinero</option>
                    <option value="mesero">Mesero / Camarero</option>
                    <option value="cajero">Cajero</option>
                    <option value="administrador">Gerente / Administrador</option>
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block font-sans">PIN o Contraseña de Acceso</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 1234 y/o su PIN"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-hidden"
                  />
                </div>
              </div>

              {/* Weekly shift template */}
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center gap-1.5 border-b border-light-100 pb-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Definición de Horarios de Semana</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {weekdays.map(day => (
                    <div key={day} className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-600">{day}</span>
                      <select
                        value={editShifts[day]}
                        onChange={(e) => setEditShifts({ ...editShifts, [day]: e.target.value })}
                        className="bg-slate-50 text-slate-700 outline-hidden px-1.5 py-1 rounded border border-slate-200 text-[10px] font-medium"
                      >
                        <option value="08:00 - 17:00">08:00 - 17:00 (Apertura)</option>
                        <option value="13:00 - 22:00">13:00 - 22:00 (Intermedio)</option>
                        <option value="14:00 - 23:30">14:00 - 23:30 (Cierre)</option>
                        <option value="15:00 - 24:00">15:00 - 24:00 (Cierre Ventas)</option>
                        <option value="Descanso">Descanso</option>
                      </select>
                    </div>
                  ))}
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
                  Registrar Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team cards display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map(member => {
          return (
            <div 
              key={member.id}
              className={`border border-slate-100 bg-white rounded-2xl p-5 shadow-xs flex flex-col justify-between h-72 text-left relative ${member.status === 'inactivo' ? 'opacity-60 grayscale' : ''}`}
            >
              {/* Card top */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] uppercase font-mono font-black border px-2 py-0.5 rounded-full ${roleColors[member.role]}`}>
                    {member.role}
                  </span>
                  
                  {/* Status Toggle Switch */}
                  <button
                    onClick={() => handleToggleStatus(member)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={member.status === 'activo' ? 'Poner Inactivo / Descanso' : 'Activar de nuevo'}
                  >
                    {member.status === 'activo' ? (
                      <ToggleRight className="w-6 h-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-300" />
                    )}
                  </button>
                </div>

                <div>
                  <h4 className="font-extrabold text-[15px] text-slate-800 truncate">{member.name}</h4>
                  <div className="flex flex-wrap items-center justify-between gap-y-1 gap-x-2 mt-1">
                    <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 inline text-slate-400" /> {member.phone}
                    </p>
                    <div className="text-[11px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md flex items-center gap-1.5 border border-amber-500/20">
                      <span>PIN: <span className="font-sans font-black tracking-widest">{member.password || '1234'}</span></span>
                      <button
                        onClick={() => {
                          const nextPin = prompt(`Asignar nueva contraseña/PIN para ${member.name}:`, member.password || '1234');
                          if (nextPin !== null && nextPin.trim() !== '') {
                            onUpdateStaffMember({
                              ...member,
                              password: nextPin.trim()
                            });
                          }
                        }}
                        className="text-[9px] text-amber-500 hover:text-amber-600 hover:underline uppercase font-bold cursor-pointer bg-transparent border-0 p-0"
                        title="Cambiar PIN"
                      >
                        (Editar)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Shifts List Grid Preview */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Turnos Programados</p>
                  
                  <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 text-[11px] font-mono text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    {weekdays.map(day => {
                      const shiftObj = member.schedule.find(s => s.day === day);
                      return (
                        <div key={day} className="flex justify-between items-center py-0.5 border-b border-white last:border-0">
                          <span className="font-bold text-slate-500">{day}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${shiftObj ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-400 italic bg-slate-100/50'}`}>
                            {shiftObj ? shiftObj.shift : 'Descanso'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card footer */}
              <div className="border-t border-slate-50 pt-3 mt-4 flex justify-between items-center text-[10px] text-slate-400">
                <span>ID: #{member.id.substring(member.id.length - 4)}</span>
                
                <button
                  onClick={() => {
                    if (confirm(`¿Dar de baja definitiva al empleado "${member.name}"?`)) {
                      onDeleteStaffMember(member.id);
                    }
                  }}
                  className="p-1 hover:bg-rose-50 rounded-md text-slate-400 hover:text-rose-500 cursor-pointer"
                  title="Eliminar registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredStaff.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-12 text-center border text-slate-400 rounded-3xl">
            Ninguno de nuestros empleados de salón cumple con el rol seleccionado.
          </div>
        )}
      </div>
    </div>
  );
}
