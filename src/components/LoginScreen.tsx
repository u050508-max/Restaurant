import React, { useState, useEffect } from 'react';
import { StaffMember, StaffRole } from '../types';
import { ChefHat, ShieldCheck, Clock, KeyRound, AlertTriangle } from 'lucide-react';

interface LoginScreenProps {
  staff: StaffMember[];
  onLogin: (member: StaffMember) => void;
}

export default function LoginScreen({ staff, onLogin }: LoginScreenProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter active staff list
  const activeStaff = staff.filter(s => s.status === 'activo');

  // Pre-select first waiter or admin first
  useEffect(() => {
    if (activeStaff.length > 0 && !selectedStaffId) {
      const defaultOption = activeStaff.find(s => s.role === 'mesero') || activeStaff[0];
      setSelectedStaffId(defaultOption.id);
    }
  }, [activeStaff, selectedStaffId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const member = activeStaff.find(s => s.id === selectedStaffId);
    if (!member) {
      setErrorMsg('Empleado no válido.');
      return;
    }

    // Default PIN is 1234 if not specified
    const configuredPassword = member.password || '1234';
    
    if (pin === configuredPassword) {
      onLogin(member);
    } else {
      setErrorMsg('PIN de acceso incorrecto. Intenta de nuevo.');
      setPin('');
    }
  };

  const getRoleLabel = (role: StaffRole): string => {
    switch(role) {
      case 'administrador': return 'Gerente / Admin';
      case 'mesero': return 'Mesero / Camarero';
      case 'chef': return 'Cocinero / Chef';
      case 'cajero': return 'Cajero Contable';
      default: return role;
    }
  };

  const roleColors: Record<StaffRole, string> = {
    chef: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    mesero: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    cajero: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    administrador: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none">
      {/* Absolute Decorative Blurred Ambient Light */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute bottom-[0%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-700/10 blur-3xl" />

      {/* Main Login Frame */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative z-10">
        
        {/* Restaurant Header branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black text-2xl shadow-xl shadow-amber-950/20 font-serif">
            SB
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-500 tracking-widest font-mono">Sistema Gastronómico SGR</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight leading-none mt-1">SABOR & BRASA</h2>
            <p className="text-xs text-slate-400 font-mono mt-1">Control de Comandas y Punto de Venta</p>
          </div>
        </div>

        {/* Live POS Terminal Clock */}
        <div className="flex items-center justify-center gap-2 bg-slate-950/70 border border-slate-850 px-4 py-2.5 rounded-2xl text-[11px] font-mono font-medium text-slate-450 text-slate-400">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>{currentTime.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          <span className="text-slate-700">|</span>
          <span className="text-amber-500 font-bold">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span>
        </div>

        {/* Error Notification banner */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-2xl flex items-start gap-2.5 text-xs animate-shake text-left">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <p className="font-semibold">{errorMsg}</p>
          </div>
        )}

        {/* Primary Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">ID/Usuario Operativo</label>
            <select
              value={selectedStaffId}
              onChange={(e) => {
                setSelectedStaffId(e.target.value);
                setErrorMsg('');
              }}
              required
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 font-medium rounded-xl px-3.5 py-3 outline-hidden hover:border-slate-750 focus:border-amber-500 transition-colors cursor-pointer text-xs capitalize"
            >
              <option value="" disabled>Selecciona tu cuenta...</option>
              {activeStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({getRoleLabel(s.role)})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">PIN / Código de Acceso</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <KeyRound className="w-4 h-4 text-slate-500" />
              </div>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9a-zA-Z]*"
                maxLength={12}
                required
                placeholder="Digita tu PIN contraseña"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full bg-slate-950 border border-slate-800 text-white tracking-widest font-black rounded-xl pl-10 pr-3.5 py-3 outline-hidden focus:border-amber-500 transition-colors text-xs"
              />
            </div>
          </div>

          {/* Quick Digit Pad helpers for faster touch screens */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {['1', '2', '3', '4', '5'].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setPin(prev => (prev + val).slice(0, 12));
                  setErrorMsg('');
                }}
                className="bg-slate-950 hover:bg-slate-850 active:bg-amber-500 active:text-slate-950 font-bold text-xs py-2 rounded-lg border border-slate-850 text-slate-300 transition-colors cursor-pointer"
              >
                {val}
              </button>
            ))}
            {['6', '7', '8', '9', '0'].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setPin(prev => (prev + val).slice(0, 12));
                  setErrorMsg('');
                }}
                className="bg-slate-950 hover:bg-slate-850 active:bg-amber-500 active:text-slate-950 font-bold text-xs py-2 rounded-lg border border-slate-850 text-slate-300 transition-colors cursor-pointer"
              >
                {val}
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setPin('');
                setErrorMsg('');
              }}
              className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer text-center"
            >
              Borrar
            </button>
            <button
              type="submit"
              className="flex-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl transition-all shadow-md shadow-amber-950/10 cursor-pointer text-center"
            >
              Ingresar Terminal
            </button>
          </div>
        </form>

        {/* Demo Credentials Access Quick Guide Block */}
        <div className="border-t border-slate-800 pt-5 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Modo Demo: Guía de PINs creados</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            {activeStaff.slice(0, 6).map((s) => (
              <div 
                key={s.id} 
                onClick={() => {
                  setSelectedStaffId(s.id);
                  setPin(s.password || '1234');
                  setErrorMsg('');
                }}
                className="bg-slate-950/50 hover:bg-slate-850/60 p-2 rounded-xl border border-slate-850 cursor-pointer transition-colors text-left flex flex-col justify-between"
              >
                <span className="text-slate-300 font-bold truncate block">{s.name.split(' ').slice(-2).join(' ')}</span>
                <div className="flex items-center justify-between gap-1 mt-1 border-t border-slate-900 pt-1 text-[9px]">
                  <span className={`px-1 py-0.2 rounded-sm border uppercase text-[8px] tracking-tight ${roleColors[s.role]}`}>
                    {s.role}
                  </span>
                  <span className="text-amber-500 font-black tracking-widest font-sans">PIN: {s.password || '1234'}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-slate-500 font-mono italic leading-normal block">
            * Haz clic en cualquier tarjeta del personal para rellenar automáticamente la selección y el PIN de demostración.
          </p>
        </div>

      </div>
    </div>
  );
}
