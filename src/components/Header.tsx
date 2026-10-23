import React from 'react';
import { 
  ShieldAlert, 
  FileText, 
  UploadCloud, 
  SlidersHorizontal, 
  MapPin, 
  BarChart3, 
  Table2, 
  Printer, 
  ExternalLink,
  Clock
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'mapa' | 'dashboard' | 'tabla';
  setCurrentTab: (tab: 'mapa' | 'dashboard' | 'tabla') => void;
  onOpenUpload: () => void;
  onOpenCriteria: () => void;
  onOpenExecutiveReport: () => void;
  onOpenPdfOriginal: () => void;
  totalActivos: number;
  totalAtendidos: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenUpload,
  onOpenCriteria,
  onOpenExecutiveReport,
  onOpenPdfOriginal,
  totalActivos,
  totalAtendidos,
}) => {
  return (
    <header className="bg-gradient-to-r from-[#531325] via-[#691C32] to-[#801e3b] text-white shadow-xl border-b-4 border-[#BC955B]">
      {/* Top micro bar */}
      <div className="bg-[#3e0b1a] px-4 py-1.5 text-xs text-amber-100 flex flex-wrap items-center justify-between border-b border-rose-900/60 font-medium">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-rose-950/80 text-rose-200 px-2 py-0.5 rounded border border-rose-800/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SISTEMA ACTIVO EN TIEMPO OPERATIVO
          </span>
          <span className="hidden sm:inline text-rose-300">|</span>
          <span className="flex items-center gap-1 text-rose-200">
            <Clock className="w-3.5 h-3.5 text-[#BC955B]" />
            Corte Informativo: <strong>20/Octubre/2026 21:13 h</strong> (Ref. SIPDUS 10/10 15:00 h)
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="hidden md:inline text-rose-300">
            Línea de Emergencia Estatal: <strong>911</strong> / Protección Civil Hidalgo: <strong>(771) 714 8505</strong>
          </span>
          <button 
            onClick={onOpenPdfOriginal}
            className="inline-flex items-center gap-1 text-amber-200 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
            title="Ver Concentrado Ejecutivo Oficial en PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ver PDF Fuente Oficial</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-white/10 p-1.5 border border-amber-300/30 flex items-center justify-center shadow-inner shrink-0">
            <ShieldAlert className="w-8 h-8 text-[#BC955B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs uppercase tracking-widest font-semibold text-[#f3dfc5] bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                Gobierno del Estado de Hidalgo
              </span>
              <span className="text-[10px] sm:text-xs text-rose-300 hidden md:inline">
                Subsecretaría de Protección Civil y Gestión de Riesgos
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-tight font-serif mt-0.5">
              Sistema de Monitoreo de Afectaciones Meteorológicas
            </h1>
            <p className="text-xs text-rose-200/90 font-sans">
              Geovisualización de los 84 Municipios • Semáforo Oficial • Trazabilidad Operativa
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenCriteria}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-medium rounded-md border border-white/20 transition-all text-white cursor-pointer shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#BC955B]" />
            <span>Criterios Semáforo</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 active:scale-95 text-xs font-semibold rounded-md border border-amber-400/40 transition-all text-white cursor-pointer shadow-md"
          >
            <UploadCloud className="w-3.5 h-3.5 text-white" />
            <span>Cargar Nuevo PDF (IA)</span>
          </button>

          <button
            onClick={onOpenExecutiveReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#42101e] hover:bg-[#340b17] active:scale-95 text-xs font-semibold rounded-md border border-[#BC955B]/60 transition-all text-amber-200 hover:text-white cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-[#BC955B]" />
            <span>Boletín Ejecutivo</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-[#480f1f] px-4 sm:px-6 border-t border-rose-900/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <nav className="flex space-x-1 sm:space-x-3 text-xs sm:text-sm font-medium">
            <button
              onClick={() => setCurrentTab('mapa')}
              className={`flex items-center gap-2 py-2.5 px-3.5 border-b-2 font-semibold transition-colors cursor-pointer ${
                currentTab === 'mapa'
                  ? 'border-[#BC955B] text-white bg-white/10 rounded-t'
                  : 'border-transparent text-rose-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#BC955B]" />
              <span>Mapa Interactivo SIG</span>
            </button>

            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 py-2.5 px-3.5 border-b-2 font-semibold transition-colors cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'border-[#BC955B] text-white bg-white/10 rounded-t'
                  : 'border-transparent text-rose-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[#BC955B]" />
              <span>Dashboard de Indicadores</span>
            </button>

            <button
              onClick={() => setCurrentTab('tabla')}
              className={`flex items-center gap-2 py-2.5 px-3.5 border-b-2 font-semibold transition-colors cursor-pointer ${
                currentTab === 'tabla'
                  ? 'border-[#BC955B] text-white bg-white/10 rounded-t'
                  : 'border-transparent text-rose-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Table2 className="w-4 h-4 text-[#BC955B]" />
              <span>Tabla de Incidentes y Trazabilidad</span>
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-3 text-xs text-rose-200">
            <span className="flex items-center gap-1.5 bg-rose-950/70 px-2.5 py-1 rounded border border-rose-800">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Activas: <strong>{totalActivos}</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-rose-950/70 px-2.5 py-1 rounded border border-rose-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Atendidas: <strong>{totalAtendidos}</strong>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
