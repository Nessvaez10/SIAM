import React, { useState } from 'react';
import { 
  MunicipalitySummary, 
  Incident, 
  SemaforoLevel,
  StatusCategory
} from '../types';
import { 
  X, 
  ShieldAlert, 
  MapPin, 
  Clock, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  Home, 
  Truck, 
  Droplets, 
  Zap, 
  ExternalLink,
  Edit3,
  Save,
  Check
} from 'lucide-react';

interface MunicipalityDetailModalProps {
  municipality: MunicipalitySummary | null;
  incidents: Incident[];
  onClose: () => void;
  onUpdateSemaforoOverride: (cve_mun: string, semaforo: SemaforoLevel, motivo: string, validado: boolean) => void;
}

const SEMAFORO_BADGES: Record<SemaforoLevel, { label: string; bg: string; text: string; border: string; desc: string }> = {
  rojo: { label: 'Rojo (Crítico)', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', desc: 'Incomunicación activa, colapso de vías prioritarias o riesgo estructural grave.' },
  naranja: { label: 'Naranja (Alto)', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', desc: 'Restricción severa de carriles, servicios interrumpidos o riesgo en escuelas.' },
  amarillo: { label: 'Amarillo (Moderado)', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300', desc: 'Afectaciones bajo control, pasos provisionales o monitoreo preventivo.' },
  verde: { label: 'Verde (Sin afectación activa)', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', desc: 'Incidentes 100% atendidos y concluidos.' },
  gris: { label: 'Gris (Información no reportada)', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-300', desc: 'Sin registro en este corte oficial.' }
};

export const MunicipalityDetailModal: React.FC<MunicipalityDetailModalProps> = ({
  municipality,
  incidents,
  onClose,
  onUpdateSemaforoOverride,
}) => {
  if (!municipality) return null;

  const [activeTab, setActiveTab] = useState<'todos' | 'activos' | 'atendidos'>('todos');
  const [isEditingOverride, setIsEditingOverride] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<SemaforoLevel>(municipality.semaforo);
  const [overrideReason, setOverrideReason] = useState<string>(municipality.motivoSemaforo);
  const [overrideValidated, setOverrideValidated] = useState<boolean>(municipality.semaforoValidado);

  const munIncidents = incidents.filter(i => {
    const incName = i.municipio.trim().toLowerCase();
    const munName = municipality.nombre.trim().toLowerCase();
    return incName === munName || 
      (incName.includes(munName) || munName.includes(incName)) ||
      (i.municipio.includes("/") && i.municipio.toLowerCase().includes(munName));
  });

  const filteredIncidents = munIncidents.filter(i => {
    if (activeTab === 'activos') return i.estatusCategoria === 'vigente_activo' || i.estatusCategoria === 'en_seguimiento';
    if (activeTab === 'atendidos') return i.estatusCategoria === 'atendido';
    return true;
  });

  const badge = SEMAFORO_BADGES[municipality.semaforo];

  const handleSaveOverride = () => {
    onUpdateSemaforoOverride(municipality.cve_mun, selectedLevel, overrideReason, overrideValidated);
    setIsEditingOverride(false);
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#531325] via-[#691C32] to-[#791c38] px-5 py-4 text-white flex items-center justify-between border-b-4 border-[#BC955B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-amber-300/30">
              <MapPin className="w-5 h-5 text-[#BC955B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-wider bg-rose-950/70 px-2 py-0.5 rounded text-amber-200">
                  CVE INEGI: {municipality.cve_mun}
                </span>
                <span className="text-xs text-rose-200">
                  Región: {municipality.regionPC}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif leading-tight">
                {municipality.nombre}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Semáforo Status and Criteria Card */}
          <div className={`p-4 rounded-xl border ${badge.border} ${badge.bg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${badge.text} bg-white shadow-xs border ${badge.border}`}>
                    Semáforo: {badge.label}
                  </span>
                  {municipality.semaforoValidado && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      <Check className="w-3 h-3" /> Validado por Analista
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-800 mt-2">
                  {municipality.motivoSemaforo}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {badge.desc}
                </p>
              </div>

              <button
                onClick={() => setIsEditingOverride(!isEditingOverride)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-slate-700 shadow-xs cursor-pointer self-start sm:self-center shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#691C32]" />
                <span>Validar / Ajustar</span>
              </button>
            </div>

            {/* Criteria Checklist */}
            {municipality.criteriosCumplidos.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">
                  Criterios Técnicos de Protección Civil Cumplidos:
                </span>
                <ul className="space-y-1">
                  {municipality.criteriosCumplidos.map((crit, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                      <span className="text-rose-700 font-bold shrink-0">●</span>
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Incommunicado communities callout */}
            {municipality.comunidadesIncomunicadas.length > 0 && (
              <div className="mt-3 p-2.5 rounded-lg bg-red-100 border border-red-300 text-red-900 text-xs">
                <strong className="flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-700" />
                  Comunidades o accesos sin paso vehicular reportados:
                </strong>
                <p className="mt-0.5 font-medium">
                  {municipality.comunidadesIncomunicadas.join(', ')}
                </p>
              </div>
            )}

            {/* Override Edit Box */}
            {isEditingOverride && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-slate-300 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Panel de Validación y Reclasificación Oficial
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['rojo', 'naranja', 'amarillo', 'verde', 'gris'] as SemaforoLevel[]).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedLevel(lvl)}
                      className={`p-2 rounded text-xs font-bold capitalize border cursor-pointer ${
                        selectedLevel === lvl 
                          ? 'border-[#691C32] bg-[#691C32] text-white' 
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Justificación Técnica / Número de Oficio o Validación:
                  </label>
                  <textarea
                    rows={2}
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Escriba el motivo técnico o la tarjeta informativa de referencia..."
                    className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#691C32] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overrideValidated}
                      onChange={(e) => setOverrideValidated(e.target.checked)}
                      className="rounded text-[#691C32]"
                    />
                    <span>Marcar como "Validado formalmente por Protección Civil"</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingOverride(false)}
                      className="px-3 py-1.5 rounded text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveOverride}
                      className="px-3 py-1.5 rounded text-xs font-bold bg-[#691C32] text-white hover:bg-[#501526] flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar Validación</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Municipal Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Total Puntos</span>
              <strong className="text-xl font-bold text-slate-800">{municipality.totalIncidentes}</strong>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-[10px] text-rose-700 font-semibold uppercase block">Afectaciones Activas</span>
              <strong className="text-xl font-bold text-rose-800">{municipality.activos}</strong>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-emerald-700 font-semibold uppercase block">Atendidas / Libres</span>
              <strong className="text-xl font-bold text-emerald-800">{municipality.atendidos}</strong>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-[10px] text-amber-700 font-semibold uppercase block">En Seguimiento</span>
              <strong className="text-xl font-bold text-amber-800">{municipality.enSeguimiento}</strong>
            </div>
          </div>

          {/* Incidents Table with Tabs */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <h3 className="font-bold text-slate-800 text-sm font-serif">
                Bitácora de Incidentes y Trazabilidad Documental
              </h3>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setActiveTab('todos')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    activeTab === 'todos' ? 'bg-white shadow-xs font-bold text-slate-800' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos ({munIncidents.length})
                </button>
                <button
                  onClick={() => setActiveTab('activos')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    activeTab === 'activos' ? 'bg-white shadow-xs font-bold text-red-700' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Activos ({municipality.activos})
                </button>
                <button
                  onClick={() => setActiveTab('atendidos')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    activeTab === 'atendidos' ? 'bg-white shadow-xs font-bold text-emerald-700' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Atendidos ({municipality.atendidos})
                </button>
              </div>
            </div>

            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs">
                No hay incidentes bajo esta clasificación en el reporte oficial del 20 de octubre.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIncidents.map(inc => {
                  const isActive = inc.estatusCategoria === 'vigente_activo' || inc.estatusCategoria === 'en_seguimiento';

                  return (
                    <div 
                      key={inc.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isActive 
                          ? 'bg-red-50/40 border-red-200 shadow-xs' 
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              {inc.comunidadPunto}
                            </span>
                            <span className="text-[10px] bg-slate-200/70 text-slate-700 font-semibold px-2 py-0.5 rounded">
                              {inc.tipoAfectacionLabel}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              isActive ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                            }`}>
                              {inc.estatusOficial}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 font-medium mt-1">
                            <strong>Ubicación:</strong> {inc.ubicacion}
                          </p>
                        </div>

                        {/* Page & Document badge */}
                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                            <FileText className="w-3 h-3 text-[#BC955B]" />
                            Pág. {inc.paginaDocumento}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                        {inc.afectacionDetalle}
                      </p>

                      {inc.accionAtencion && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60 text-xs text-slate-600 flex items-start gap-1.5">
                          <strong className="text-slate-800 shrink-0">Acción Operativa:</strong>
                          <span>{inc.accionAtencion}</span>
                        </div>
                      )}

                      <div className="mt-2 text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/40 pt-1 font-mono">
                        <span>Doc: {inc.documentoOrigen}</span>
                        <span>Verificación: {inc.ultimaVerificacion}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Fuente Oficial: Subsecretaría de Protección Civil y Gestión de Riesgos</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold cursor-pointer transition-colors"
          >
            Cerrar Ficha Municipal
          </button>
        </div>
      </div>
    </div>
  );
};
