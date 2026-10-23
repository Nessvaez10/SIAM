import React, { useState, useMemo } from 'react';
import { Incident, AffectationCategory, StatusCategory, MunicipalitySummary } from '../types';
import { exportIncidentsToCSV } from '../utils/exportUtils';
import { 
  Download, 
  Search, 
  Filter, 
  FileText, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface IncidentsTableProps {
  incidents: Incident[];
  municipalities: MunicipalitySummary[];
  onSelectMunicipality: (municipality: MunicipalitySummary) => void;
  initialCategoryFilter?: AffectationCategory | 'all';
}

export const IncidentsTable: React.FC<IncidentsTableProps> = ({
  incidents,
  municipalities,
  onSelectMunicipality,
  initialCategoryFilter = 'all',
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<AffectationCategory | 'all'>(initialCategoryFilter);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTerm = 
          inc.municipio.toLowerCase().includes(term) ||
          inc.comunidadPunto.toLowerCase().includes(term) ||
          inc.ubicacion.toLowerCase().includes(term) ||
          inc.afectacionDetalle.toLowerCase().includes(term) ||
          inc.estatusOficial.toLowerCase().includes(term);
        if (!matchesTerm) return false;
      }

      // Municipality filter
      if (selectedMunicipality !== 'all') {
        if (!inc.municipio.toLowerCase().includes(selectedMunicipality.toLowerCase())) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (inc.tipoAfectacion !== selectedCategory) return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'activos' && inc.estatusCategoria !== 'vigente_activo' && inc.estatusCategoria !== 'en_seguimiento') {
          return false;
        }
        if (selectedStatus === 'atendidos' && inc.estatusCategoria !== 'atendido') {
          return false;
        }
        if (selectedStatus === 'pendiente' && inc.estatusCategoria !== 'pendiente_confirmacion') {
          return false;
        }
      }

      return true;
    });
  }, [incidents, searchTerm, selectedMunicipality, selectedCategory, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredIncidents.slice(start, start + itemsPerPage);
  }, [filteredIncidents, currentPage]);

  const handleExportCSV = () => {
    exportIncidentsToCSV(filteredIncidents, `afectaciones_hidalgo_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedMunicipality('all');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  // Distinct municipalities present in incidents
  const incidentMunicipalities = useMemo(() => {
    return Array.from(new Set(incidents.map(i => i.municipio))).sort();
  }, [incidents]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Control & Filter Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-serif">
              Catálogo de Afectaciones y Trazabilidad de Reportes
            </h2>
            <p className="text-xs text-slate-500">
              Registros verificados del Concentrado Oficial con trazabilidad a página, fecha y referencia de origen.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer self-start md:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Tabla a Excel / CSV</span>
          </button>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar comunidad, carretera, nota..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#691C32] focus:outline-none"
            />
          </div>

          {/* Municipality filter */}
          <div>
            <select
              value={selectedMunicipality}
              onChange={(e) => { setSelectedMunicipality(e.target.value); setCurrentPage(1); }}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#691C32] focus:outline-none bg-white"
            >
              <option value="all">Todos los Municipios ({incidentMunicipalities.length})</option>
              {incidentMunicipalities.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value as any); setCurrentPage(1); }}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#691C32] focus:outline-none bg-white"
            >
              <option value="all">Todos los Rubros de Afectación</option>
              <option value="derrumbes">Derrumbes (70 puntos)</option>
              <option value="afectaciones_estructurales">Afectaciones Estructurales (46 puntos)</option>
              <option value="deslaves">Deslaves (27 puntos)</option>
              <option value="creciente_rios">Creciente de Ríos (19 puntos)</option>
              <option value="vias_accesos">Vías y Accesos (13 puntos)</option>
              <option value="caida_arboles">Caída de Árboles (8 puntos)</option>
              <option value="monitoreo_preventivo">Monitoreo Preventivo (6 puntos)</option>
              <option value="encharcamientos">Encharcamientos (5 puntos)</option>
              <option value="suministro_electrico">Suministro Eléctrico (5 puntos)</option>
              <option value="monitoreo_hidrologico">Monitoreo Hidrológico (5 puntos)</option>
              <option value="socavon">Socavones (3 puntos)</option>
              <option value="vehiculos_atrapados">Vehículos Atrapados (2 puntos)</option>
              <option value="personas_atrapadas">Personas Atrapadas (1 punto)</option>
              <option value="persona_sin_signos">Persona sin signos (1 punto)</option>
              <option value="refugios_temporales">Refugios Temporales (1 punto)</option>
              <option value="drenaje_colapsado">Drenaje Colapsado (1 punto)</option>
              <option value="evacuaciones_preventivas">Evacuaciones Preventivas (1 punto)</option>
              <option value="accidentes">Accidentes (1 punto)</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#691C32] focus:outline-none bg-white"
            >
              <option value="all">Todos los Estatus</option>
              <option value="activos">Sólo Activas / Restringidas (Rojo)</option>
              <option value="atendidos">Sólo Atendidas / Abiertas (Verde)</option>
              <option value="pendiente">Pendiente de Confirmación</option>
            </select>

            <button
              onClick={handleResetFilters}
              title="Restablecer filtros"
              className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Results count counter */}
        <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
          <span>Mostrando <strong>{filteredIncidents.length}</strong> de <strong>{incidents.length}</strong> incidentes registrados</span>
          {(selectedMunicipality !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all' || searchTerm) && (
            <span className="text-rose-700 font-semibold text-[11px]">Filtros activos</span>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#531325] text-white font-semibold">
              <tr>
                <th className="py-3 px-3">Municipio</th>
                <th className="py-3 px-3">Rubro</th>
                <th className="py-3 px-3">Comunidad / Punto</th>
                <th className="py-3 px-3">Ubicación</th>
                <th className="py-3 px-3">Estatus Oficial</th>
                <th className="py-3 px-3">Detalle de Afectación</th>
                <th className="py-3 px-3 text-center">Pág.</th>
                <th className="py-3 px-3">Verificación</th>
                <th className="py-3 px-3 text-right">Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No se encontraron incidentes que coincidan con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedItems.map(inc => {
                  const isActive = inc.estatusCategoria === 'vigente_activo' || inc.estatusCategoria === 'en_seguimiento';

                  return (
                    <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap">
                        {inc.municipio}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                          {inc.tipoAfectacionLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800 max-w-[180px]">
                        {inc.comunidadPunto}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-[160px] truncate" title={inc.ubicacion}>
                        {inc.ubicacion}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isActive 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {inc.estatusOficial}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 max-w-sm leading-relaxed">
                        {inc.afectacionDetalle}
                        {inc.accionAtencion && (
                          <div className="text-[11px] text-slate-500 mt-1 italic">
                            Acción: {inc.accionAtencion}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap font-mono text-slate-500">
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded text-[11px]">
                          p.{inc.paginaDocumento}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-500 whitespace-nowrap font-mono">
                        {inc.ultimaVerificacion}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            const m = municipalities.find(mun => mun.nombre === inc.municipio);
                            if (m) onSelectMunicipality(m);
                          }}
                          className="px-2 py-1 rounded bg-[#691C32] hover:bg-[#501526] text-white text-[11px] font-medium cursor-pointer transition-colors"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Anterior
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded text-xs font-semibold cursor-pointer ${
                      currentPage === pageNum 
                        ? 'bg-[#691C32] text-white' 
                        : 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
