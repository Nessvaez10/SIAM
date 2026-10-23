import React, { useState } from 'react';
import { 
  MunicipalitySummary, 
  Incident, 
  PDFReportMetadata,
  AffectationCategory
} from '../types';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Truck, 
  Home, 
  Droplets, 
  Zap, 
  ShieldAlert, 
  Users, 
  ArrowUpRight,
  Filter,
  BarChart2,
  FileCheck
} from 'lucide-react';

interface DashboardMetricsProps {
  municipalities: MunicipalitySummary[];
  incidents: Incident[];
  reportMetadata: PDFReportMetadata;
  onSelectMunicipality: (municipality: MunicipalitySummary) => void;
  onFilterByCategory: (category: AffectationCategory | 'all') => void;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  municipalities,
  incidents,
  reportMetadata,
  onSelectMunicipality,
  onFilterByCategory,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  // Summary counts
  const totalMun = municipalities.length;
  const rojos = municipalities.filter(m => m.semaforo === 'rojo');
  const naranjas = municipalities.filter(m => m.semaforo === 'naranja');
  const amarillos = municipalities.filter(m => m.semaforo === 'amarillo');
  const verdes = municipalities.filter(m => m.semaforo === 'verde');
  const grises = municipalities.filter(m => m.semaforo === 'gris');

  const totalActivos = incidents.filter(i => i.estatusCategoria === 'vigente_activo' || i.estatusCategoria === 'en_seguimiento').length;
  const totalAtendidos = incidents.filter(i => i.estatusCategoria === 'atendido').length;
  const totalPuntos = incidents.reduce((acc, curr) => acc + (curr.puntosContabilizados || 1), 0);

  // Grouped by Category
  const categoryStats = [
    { key: 'derrumbes', label: 'Derrumbes en Caminos y Carreteras', icon: Truck, ...reportMetadata.resumenIncidentes.derrumbes },
    { key: 'afectaciones_estructurales', label: 'Afectaciones Estructurales', icon: Home, ...reportMetadata.resumenIncidentes.estructurales },
    { key: 'deslaves', label: 'Deslaves y Deslizamientos', icon: AlertOctagon, ...reportMetadata.resumenIncidentes.deslaves },
    { key: 'creciente_rios', label: 'Creciente de Ríos y Cuerpos de Agua', icon: Droplets, ...reportMetadata.resumenIncidentes.crecienteRios },
    { key: 'vias_accesos', label: 'Afectaciones a Vías y Accesos', icon: AlertTriangle, ...reportMetadata.resumenIncidentes.viasAccesos },
    { key: 'socavon', label: 'Socavones en Zonas Viales/Habitadas', icon: Activity, ...reportMetadata.resumenIncidentes.socavones },
    { key: 'encharcamientos', label: 'Encharcamientos e Inundaciones', icon: Droplets, ...reportMetadata.resumenIncidentes.encharcamientos },
    { key: 'suministro_electrico', label: 'Afectaciones a Suministro Eléctrico', icon: Zap, ...reportMetadata.resumenIncidentes.suministroElectrico },
    { key: 'caida_arboles', label: 'Caída de Árboles', icon: CheckCircle2, ...reportMetadata.resumenIncidentes.caidaArboles },
  ];

  // Incommunicado communities list
  const incommunicadoCommunities = incidents
    .filter(i => i.estatusOficial.includes("COMUNIDAD INCOMUNICADA") || i.estatusOficial.includes("COMUNIDADES SIN PASO") || i.estatusOficial.includes("SIN PASO"))
    .map(i => ({
      municipio: i.municipio,
      comunidad: i.comunidadPunto,
      ubicacion: i.ubicacion,
      detalle: i.afectacionDetalle,
      pagina: i.paginaDocumento
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner with Situation Brief */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-[#691C32]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#691C32] text-white">
              SITUACIÓN GENERAL DEL ESTADO
            </span>
            <span className="text-xs text-slate-500">
              Integración: {reportMetadata.fechaIntegracion} {reportMetadata.horaIntegracion}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 font-serif mt-1">
            Concentrado Ejecutivo de Daños y Acciones Operativas
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
            Monitoreo oficial coordinado entre la Subsecretaría de Protección Civil y Gestión de Riesgos, SIPDUS, SICT Federal y las 84 Unidades Municipales de Protección Civil del Estado de Hidalgo.
          </p>
        </div>

        {/* SIPDUS Volumetry badge */}
        <div className="bg-amber-50/80 rounded-lg p-3 border border-amber-200/80 text-xs shrink-0 min-w-[280px]">
          <div className="flex items-center justify-between text-amber-900 font-bold mb-1 pb-1 border-b border-amber-200">
            <span>Volumetría de Material SIPDUS</span>
            <span className="font-mono text-[11px]">10/Oct 15:00 h</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div>
              <span className="text-[10px] text-amber-700 block">Cuantificado</span>
              <strong className="text-sm font-bold text-amber-950">{reportMetadata.volumetriaSIPDUS.m3Cuantificados.toLocaleString()} m³</strong>
            </div>
            <div>
              <span className="text-[10px] text-emerald-700 block">Retirado</span>
              <strong className="text-sm font-bold text-emerald-800">{reportMetadata.volumetriaSIPDUS.m3Retirados.toLocaleString()} m³</strong>
            </div>
            <div>
              <span className="text-[10px] text-rose-700 block">Pendiente</span>
              <strong className="text-sm font-bold text-rose-800">{reportMetadata.volumetriaSIPDUS.m3Pendientes.toLocaleString()} m³</strong>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards: Semáforo breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Municipios */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Municipios</span>
            <ShieldAlert className="w-4 h-4 text-[#691C32]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">84</div>
            <p className="text-[11px] text-slate-500">Total en el Estado</p>
          </div>
        </div>

        {/* Rojo */}
        <div className="bg-red-50/70 rounded-xl p-4 shadow-sm border border-red-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Rojo (Crítico)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-red-900">{rojos.length}</div>
            <p className="text-[11px] text-red-700 truncate" title={rojos.map(m => m.nombre).join(', ')}>
              {rojos.map(m => m.nombre).join(', ')}
            </p>
          </div>
        </div>

        {/* Naranja */}
        <div className="bg-orange-50/70 rounded-xl p-4 shadow-sm border border-orange-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">Naranja (Alto)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-orange-900">{naranjas.length}</div>
            <p className="text-[11px] text-orange-700 truncate" title={naranjas.map(m => m.nombre).join(', ')}>
              {naranjas.map(m => m.nombre).join(', ')}
            </p>
          </div>
        </div>

        {/* Amarillo */}
        <div className="bg-yellow-50/70 rounded-xl p-4 shadow-sm border border-yellow-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-yellow-800 uppercase tracking-wider">Amarillo (Mod.)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-yellow-900">{amarillos.length}</div>
            <p className="text-[11px] text-yellow-700 truncate" title={amarillos.map(m => m.nombre).join(', ')}>
              {amarillos.map(m => m.nombre).join(', ')}
            </p>
          </div>
        </div>

        {/* Verde */}
        <div className="bg-emerald-50/70 rounded-xl p-4 shadow-sm border border-emerald-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Verde (Solvent.)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-900">{verdes.length}</div>
            <p className="text-[11px] text-emerald-700">100% Atendidos</p>
          </div>
        </div>

        {/* Gris */}
        <div className="bg-slate-100/70 rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Gris (Sin rep.)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-700">{grises.length}</div>
            <p className="text-[11px] text-slate-500">Sin afectación reportada</p>
          </div>
        </div>
      </div>

      {/* Second row: Human impact & Road situation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Human Impact */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <Users className="w-4 h-4 text-[#691C32]" />
            <h3 className="font-bold text-slate-800 text-sm">Afectaciones a Personas (Oficial)</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100">
              <span className="text-[11px] text-rose-700 block font-semibold">Lesionadas</span>
              <span className="text-xl font-bold text-rose-900">3 personas</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Sin identificación personal o municipal en el reporte</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-700 block font-semibold">Localizada s/ signos</span>
              <span className="text-xl font-bold text-slate-900">1 persona</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Agua Blanca de Iturbide (El Xúchil, traslado vía La Vereda)</span>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="text-[11px] text-emerald-700 block font-semibold">Rescates Exitosos</span>
              <span className="text-xl font-bold text-emerald-900">2 personas</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Atlapexco (jóvenes en creciente, saldo blanco)</span>
            </div>

            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100">
              <span className="text-[11px] text-blue-700 block font-semibold">Evacuación Preventiva</span>
              <span className="text-xl font-bold text-blue-900">1 persona</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Tlahuiltepa (adulto mayor en Itztamichapa)</span>
            </div>
          </div>
        </div>

        {/* SIPDUS Road status */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <Truck className="w-4 h-4 text-[#691C32]" />
            <h3 className="font-bold text-slate-800 text-sm">Caminos y Puentes (Corte SIPDUS)</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-700 font-medium">Caminos con contingencia:</span>
              <strong className="text-slate-900 font-bold">{reportMetadata.volumetriaSIPDUS.caminosContingencia} caminos</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-rose-50 border border-rose-100">
              <span className="text-rose-800 font-medium">Caminos cerrados:</span>
              <strong className="text-rose-950 font-bold">{reportMetadata.volumetriaSIPDUS.caminosCerrados} tramos</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-amber-50 border border-amber-100">
              <span className="text-amber-800 font-medium">Abiertos parcialmente:</span>
              <strong className="text-amber-950 font-bold">{reportMetadata.volumetriaSIPDUS.caminosAbiertosParcial} tramos</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-emerald-50 border border-emerald-100">
              <span className="text-emerald-800 font-medium">Atendidos al 100%:</span>
              <strong className="text-emerald-950 font-bold">{reportMetadata.volumetriaSIPDUS.caminosAtendidos100} tramos</strong>
            </div>
          </div>
        </div>

        {/* Priority Works & SICT notices */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-slate-800 text-sm">Actualizaciones Prioritarias (20/Oct)</h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
              <strong className="text-amber-900 font-semibold block">XOCHIATIPAN - Puente Garcés</strong>
              <p className="text-slate-700 text-[11px] mt-0.5">
                Sólo se permite paso a vehículos de baja carga. La SICT Federal iniciará trabajos de rehabilitación el <strong>lunes 26/10/2026</strong>.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <strong className="text-slate-800 font-semibold block">TENANGO DE DORIA - Acceso a La Laguna</strong>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Paso a medio carril bajo estricta supervisión de Protección Civil.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200">
              <strong className="text-rose-900 font-semibold block">TLAHUILTEPA - Falla Geológica Activa</strong>
              <p className="text-rose-800 text-[11px] mt-0.5">
                Agua del Cuervo - La Yezca y puente provisional sobre río Amajac intransitables para vehículos (paso exclusivamente peatonal).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-base font-serif">
              Distribución de Incidentes por Rubro de Afectación
            </h3>
            <p className="text-xs text-slate-500">
              Desglose cuantitativo oficial: Activas / Restringidas (Rojo) vs Atendidas / Abiertas (Verde)
            </p>
          </div>
          <button
            onClick={() => onFilterByCategory('all')}
            className="text-xs text-blue-700 hover:underline font-semibold cursor-pointer"
          >
            Ver todos los registros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryStats.map(cat => {
            const Icon = cat.icon;
            const pct = cat.total > 0 ? Math.round((cat.atendidos / cat.total) * 100) : 100;

            return (
              <div 
                key={cat.key}
                onClick={() => onFilterByCategory(cat.key as AffectationCategory)}
                className="p-3 rounded-lg border border-slate-200 hover:border-amber-400/80 hover:shadow-md transition-all bg-slate-50/50 hover:bg-white cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#691C32]/10 text-[#691C32] flex items-center justify-center shrink-0 group-hover:bg-[#691C32] group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#691C32] transition-colors leading-tight">
                        {cat.label}
                      </h4>
                      <span className="text-[10px] text-slate-400">Total: {cat.total} puntos</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#691C32] transition-colors" />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-semibold text-red-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    Activas: {cat.activos}
                  </span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    Atendidas: {cat.atendidos}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-1.5 transition-all duration-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1 text-right text-[10px] text-slate-500 font-mono">
                  {pct}% resuelto
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical communities incommunicado alert table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-red-100 text-red-800">
              <AlertOctagon className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Comunidades y Accesos con Incomunicación o Sin Paso Confirmado
              </h3>
              <p className="text-xs text-slate-500">
                Puntos donde la población no cuenta con salida vehicular ordinaria
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800">
            {incommunicadoCommunities.length} puntos prioritarios
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Municipio</th>
                <th className="py-2.5 px-3">Comunidad / Punto</th>
                <th className="py-2.5 px-3">Ubicación / Vía</th>
                <th className="py-2.5 px-3">Detalle Operativo</th>
                <th className="py-2.5 px-3 text-center">Pág. PDF</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incommunicadoCommunities.map((item, idx) => (
                <tr key={idx} className="hover:bg-rose-50/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-800">{item.municipio}</td>
                  <td className="py-2.5 px-3 font-semibold text-rose-800">{item.comunidad}</td>
                  <td className="py-2.5 px-3 text-slate-600">{item.ubicacion}</td>
                  <td className="py-2.5 px-3 text-slate-700 max-w-md">{item.detalle}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-500">Pág. {item.pagina}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => {
                        const m = municipalities.find(mun => mun.nombre === item.municipio);
                        if (m) onSelectMunicipality(m);
                      }}
                      className="px-2 py-1 rounded bg-[#691C32] hover:bg-[#501526] text-white text-[11px] font-medium cursor-pointer transition-colors"
                    >
                      Ficha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
