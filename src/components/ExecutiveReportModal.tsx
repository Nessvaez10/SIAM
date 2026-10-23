import React from 'react';
import { MunicipalitySummary, Incident, PDFReportMetadata } from '../types';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  ShieldAlert, 
  Calendar, 
  CheckCircle2, 
  AlertOctagon,
  Building2
} from 'lucide-react';
import { exportMunicipalitiesToCSV } from '../utils/exportUtils';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  municipalities: MunicipalitySummary[];
  incidents: Incident[];
  reportMetadata: PDFReportMetadata;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  municipalities,
  incidents,
  reportMetadata,
}) => {
  if (!isOpen) return null;

  const rojos = municipalities.filter(m => m.semaforo === 'rojo');
  const naranjas = municipalities.filter(m => m.semaforo === 'naranja');
  const amarillos = municipalities.filter(m => m.semaforo === 'amarillo');
  const verdes = municipalities.filter(m => m.semaforo === 'verde');
  const grises = municipalities.filter(m => m.semaforo === 'gris');

  const totalActivos = incidents.filter(i => i.estatusCategoria === 'vigente_activo' || i.estatusCategoria === 'en_seguimiento').length;
  const totalAtendidos = incidents.filter(i => i.estatusCategoria === 'atendido').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    exportMunicipalitiesToCSV(municipalities, `concentrado_ejecutivo_hidalgo_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="fixed inset-0 z-[1300] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Control Bar (Non-printable) */}
        <div className="bg-[#531325] px-5 py-3 text-white flex items-center justify-between border-b-2 border-[#BC955B] print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#BC955B]" />
            <span className="text-sm font-bold">Vista Previa de Impresión - Boletín Ejecutivo</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs rounded font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Datos</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar como PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 font-serif text-slate-800 bg-white" id="printable-report">
          {/* Institutional Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-slate-600">
                Gobierno del Estado de Hidalgo
              </div>
              <div className="text-xs font-sans font-bold uppercase tracking-wider text-[#691C32]">
                Subsecretaría de Protección Civil y Gestión de Riesgos
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-1">
                Boletín Ejecutivo de Situación Hidrometeorológica
              </h1>
              <p className="text-xs font-sans text-slate-600">
                Evaluación Técnica Operativa de los 84 Municipios del Estado
              </p>
            </div>

            <div className="text-left sm:text-right font-sans text-xs space-y-0.5 border-l-2 sm:border-l-0 pl-3 sm:pl-0 border-[#691C32]">
              <div><strong>Fecha de Integración:</strong> {reportMetadata.fechaIntegracion}</div>
              <div><strong>Hora del Corte:</strong> {reportMetadata.horaIntegracion}</div>
              <div><strong>Referencia SIPDUS:</strong> {reportMetadata.referenciaSIPDUS}</div>
              <div className="text-[10px] text-slate-500">Documento Clasificado para Mando y Operaciones</div>
            </div>
          </div>

          {/* Key Executive Metrics */}
          <div className="grid grid-cols-4 gap-3 text-center font-sans text-xs">
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <span className="text-[10px] text-red-700 font-bold uppercase block">Nivel Rojo (Crítico)</span>
              <strong className="text-2xl font-black text-red-900">{rojos.length}</strong>
              <span className="text-[10px] text-slate-600 block mt-0.5">municipios</span>
            </div>
            <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
              <span className="text-[10px] text-orange-700 font-bold uppercase block">Nivel Naranja (Alto)</span>
              <strong className="text-2xl font-black text-orange-900">{naranjas.length}</strong>
              <span className="text-[10px] text-slate-600 block mt-0.5">municipios</span>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <span className="text-[10px] text-yellow-700 font-bold uppercase block">Nivel Amarillo (Mod.)</span>
              <strong className="text-2xl font-black text-yellow-900">{amarillos.length}</strong>
              <span className="text-[10px] text-slate-600 block mt-0.5">municipios</span>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Nivel Verde (Resuelto)</span>
              <strong className="text-2xl font-black text-emerald-900">{verdes.length}</strong>
              <span className="text-[10px] text-slate-600 block mt-0.5">100% atendidos</span>
            </div>
          </div>

          {/* Section: Priority Municipalities */}
          <div className="space-y-3 font-sans">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#691C32] border-b border-slate-300 pb-1">
              1. Municipios en Situación Crítica y Alta Prioridad Operativa
            </h2>
            <div className="space-y-2">
              {[...rojos, ...naranjas].map(m => (
                <div key={m.cve_mun} className="p-3 rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${m.semaforo === 'rojo' ? 'bg-red-600' : 'bg-orange-500'}`} />
                      <strong className="text-slate-900 text-sm font-bold">{m.nombre}</strong>
                      <span className="text-slate-500 text-[11px]">({m.regionPC})</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                        m.semaforo === 'rojo' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {m.semaforo.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {m.motivoSemaforo}
                    </p>
                    {m.comunidadesIncomunicadas.length > 0 && (
                      <p className="text-red-700 font-semibold text-[11px]">
                        ⚠️ Comunidades con paso interrumpido: {m.comunidadesIncomunicadas.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-[11px] text-slate-500 shrink-0">
                    <div>Activas: <strong className="text-red-700">{m.activos}</strong></div>
                    <div>Atendidas: <strong className="text-emerald-700">{m.atendidos}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Road Volumetry & SIPDUS Actions */}
          <div className="space-y-2 font-sans text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#691C32] border-b border-slate-300 pb-1">
              2. Balance de Infraestructura y Retiro de Material (SIPDUS / SICT)
            </h2>
            <p className="text-slate-700 leading-relaxed">
              De acuerdo con el informe de la Secretaría de Infraestructura Pública y Desarrollo Urbano Sostenible (SIPDUS) al corte de referencia:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
              <li><strong>39 caminos con contingencia registrada:</strong> 7 cerrados en su totalidad, 16 habilitados con paso provisional o parcial, y 16 atendidos al 100%.</li>
              <li><strong>12 puentes con afectaciones:</strong> Se mantiene vigilancia prioritaria en el Puente Garcés (Xochiatipan, con restricción a vehículos ligeros e inicio de obras SICT el 26/10) y puente Petlapixca-Tlalocuil (Tepehuacán, con cruce asistido en lancha).</li>
              <li><strong>Retiro de Escombros:</strong> 6,035 m³ cuantificados en derrumbes, habiéndose retirado 3,180 m³ (52.7%) y restando 2,855 m³ pendientes de remoción.</li>
            </ul>
          </div>

          {/* Section: Human Balance */}
          <div className="space-y-2 font-sans text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#691C32] border-b border-slate-300 pb-1">
              3. Saldo a la Población y Acciones Asistenciales
            </h2>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
              <li><strong>Personas Lesionadas:</strong> 3 personas registradas en el acumulado estatal, sin reporte de gravedad crítica ni identificación individual en la tarjeta informativa.</li>
              <li><strong>Personas Fallecidas:</strong> 1 persona localizada sin signos vitales en Agua Blanca de Iturbide (El Xúchil, arrastrada por corriente pluvial); diligencias ministeriales concluidas.</li>
              <li><strong>Personas Rescatadas:</strong> 2 jóvenes rescatados con vida durante contingencia por creciente en Atlapexco (saldo blanco).</li>
              <li><strong>Evacuaciones Preventivas:</strong> 1 adulto mayor evacuado preventivamente en la comunidad de Itztamichapa, Tlahuiltepa.</li>
              <li><strong>Refugios Temporales:</strong> 1 albergue preventivo habilitado en la cabecera municipal de San Agustín Metzquititlán.</li>
            </ul>
          </div>

          {/* Signatures block for official printout */}
          <div className="pt-8 border-t border-slate-300 font-sans text-xs grid grid-cols-2 gap-8 text-center mt-6">
            <div>
              <div className="border-b border-slate-400 w-48 mx-auto mb-1"></div>
              <strong className="block text-slate-800">Mesa de Situación Operativa</strong>
              <span className="text-[10px] text-slate-500">Subsecretaría de Protección Civil y Gestión de Riesgos</span>
            </div>
            <div>
              <div className="border-b border-slate-400 w-48 mx-auto mb-1"></div>
              <strong className="block text-slate-800">Coordinación de Monitoreo SIG</strong>
              <span className="text-[10px] text-slate-500">Comité Estatal de Emergencias de Hidalgo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
