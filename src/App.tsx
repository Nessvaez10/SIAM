import React, { useState, useMemo, useEffect } from 'react';
import { 
  MunicipalitySummary, 
  Incident, 
  SemaforoLevel, 
  AffectationCategory,
  ExtractionChangeItem
} from './types';
import { INITIAL_OFFICIAL_INCIDENTS, OFFICIAL_REPORT_METADATA } from './data/officialIncidents';
import { buildMunicipalitiesSummary } from './utils/semaforoLogic';
import { Header } from './components/Header';
import { MapComponent } from './components/MapComponent';
import { DashboardMetrics } from './components/DashboardMetrics';
import { IncidentsTable } from './components/IncidentsTable';
import { MunicipalityDetailModal } from './components/MunicipalityDetailModal';
import { SemaforoCriteriaModal } from './components/SemaforoCriteriaModal';
import { ReportUploadModal } from './components/ReportUploadModal';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import { FileText, X, ExternalLink, ShieldCheck, History, UploadCloud, Link2, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'mapa' | 'dashboard' | 'tabla'>('mapa');
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_OFFICIAL_INCIDENTS);
  const [userOverrides, setUserOverrides] = useState<Record<string, { semaforo: SemaforoLevel; validado: boolean; motivo: string }>>({});
  
  // Selected municipality for detailed inspection
  const [selectedMunicipality, setSelectedMunicipality] = useState<MunicipalitySummary | null>(null);

  // Modals state
  const [isCriteriaOpen, setIsCriteriaOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isExecutiveReportOpen, setIsExecutiveReportOpen] = useState<boolean>(false);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState<boolean>(false);

  // Dynamic official PDF configuration (allows daily updates via SFTP / manifest)
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string>('/assets/aistudio/Concentrado_Ejecutivo_Lluvias_20Oct2026_2113_Corregido_Infraestructura_Federal_63c258fe.pdf');
  const [currentPdfTitle, setCurrentPdfTitle] = useState<string>('Concentrado Ejecutivo de Lluvias (20/10/2026 21:13 h)');
  const [pdfHistorico, setPdfHistorico] = useState<Array<{ fecha: string; archivo: string; nombre: string }>>([
    {
      fecha: "20/10/2026 21:13 h",
      archivo: "/assets/aistudio/Concentrado_Ejecutivo_Lluvias_20Oct2026_2113_Corregido_Infraestructura_Federal_63c258fe.pdf",
      nombre: "Corte Oficial 20/Octubre - SIPDUS e Infraestructura Federal"
    }
  ]);
  const [customPdfInputUrl, setCustomPdfInputUrl] = useState<string>('');
  const [showPdfSourceSettings, setShowPdfSourceSettings] = useState<boolean>(false);

  // Load manifest if available
  useEffect(() => {
    fetch('/assets/aistudio/reporte_vigente.json')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.archivoPdf) {
          setCurrentPdfUrl(data.archivoPdf);
          if (data.titulo) {
            setCurrentPdfTitle(`${data.titulo} (${data.fechaCorte || 'Vigente'})`);
          }
          if (data.historico && Array.isArray(data.historico) && data.historico.length > 0) {
            setPdfHistorico(data.historico);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateActivePdf = (fileUrl: string, fileName: string) => {
    setCurrentPdfUrl(fileUrl);
    setCurrentPdfTitle(`Corte Actualizado: ${fileName}`);
    setPdfHistorico(prev => [
      {
        fecha: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        archivo: fileUrl,
        nombre: fileName
      },
      ...prev
    ]);
  };
  
  // Initial category filter passed to IncidentsTable when clicked from Dashboard
  const [tableCategoryFilter, setTableCategoryFilter] = useState<AffectationCategory | 'all'>('all');

  // Compute municipality summaries with semáforo calculation
  const municipalitiesSummary = useMemo(() => {
    return buildMunicipalitiesSummary(incidents, userOverrides);
  }, [incidents, userOverrides]);

  const totalActivos = useMemo(() => {
    return incidents.filter(i => i.estatusCategoria === 'vigente_activo' || i.estatusCategoria === 'en_seguimiento').length;
  }, [incidents]);

  const totalAtendidos = useMemo(() => {
    return incidents.filter(i => i.estatusCategoria === 'atendido').length;
  }, [incidents]);

  // Handle user manual override / validation of a municipality's status
  const handleUpdateSemaforoOverride = (
    cve_mun: string, 
    semaforo: SemaforoLevel, 
    motivo: string, 
    validado: boolean
  ) => {
    setUserOverrides(prev => ({
      ...prev,
      [cve_mun]: { semaforo, motivo, validado }
    }));

    if (selectedMunicipality && selectedMunicipality.cve_mun === cve_mun) {
      setSelectedMunicipality(prev => prev ? {
        ...prev,
        semaforo,
        motivoSemaforo: motivo,
        semaforoValidado: validado
      } : null);
    }
  };

  // Apply user-validated changes from AI extraction
  const handleApplyExtractionChanges = (validatedChanges: ExtractionChangeItem[]) => {
    const updatedIncidents = [...incidents];

    validatedChanges.forEach(change => {
      // Find matching incident
      const existingIdx = updatedIncidents.findIndex(inc => 
        inc.municipio.toLowerCase().includes(change.municipio.toLowerCase()) &&
        (inc.comunidadPunto.toLowerCase().includes(change.comunidadPunto.toLowerCase()) ||
         change.comunidadPunto.toLowerCase().includes(inc.comunidadPunto.toLowerCase()))
      );

      if (existingIdx !== -1) {
        // Update existing incident
        const existing = updatedIncidents[existingIdx];
        const isResolved = change.tipoCambio === 'resuelto';

        updatedIncidents[existingIdx] = {
          ...existing,
          estatusOficial: change.estatusNuevo,
          estatusCategoria: isResolved ? 'atendido' : 'vigente_activo',
          afectacionDetalle: `${change.detalle} (Actualizado tras reporte validado)`,
          ultimaVerificacion: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' h'
        };
      } else if (change.tipoCambio === 'nuevo') {
        // Add new incident
        updatedIncidents.push({
          id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          municipio: change.municipio,
          comunidadPunto: change.comunidadPunto,
          ubicacion: change.comunidadPunto,
          tipoAfectacion: change.tipoAfectacion,
          tipoAfectacionLabel: change.tipoAfectacion.replace('_', ' ').toUpperCase(),
          estatusOficial: change.estatusNuevo,
          estatusCategoria: 'vigente_activo',
          afectacionDetalle: change.detalle,
          accionAtencion: "Registrado e inspeccionado por cuadrilla de atención.",
          documentoOrigen: "Reporte_Actualizacion_Validado.pdf",
          paginaDocumento: change.paginaReferencia,
          fechaReporte: new Date().toLocaleDateString('es-MX'),
          ultimaVerificacion: "Recién validado",
          puntosContabilizados: 1
        });
      }
    });

    setIncidents(updatedIncidents);
  };

  const handleFilterByCategoryFromDashboard = (cat: AffectationCategory | 'all') => {
    setTableCategoryFilter(cat);
    setCurrentTab('tabla');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Official Government Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenCriteria={() => setIsCriteriaOpen(true)}
        onOpenExecutiveReport={() => setIsExecutiveReportOpen(true)}
        onOpenPdfOriginal={() => setIsPdfViewerOpen(true)}
        totalActivos={totalActivos}
        totalAtendidos={totalAtendidos}
      />

      {/* Main Tab Content */}
      <main className="flex-1 flex flex-col">
        {currentTab === 'mapa' && (
          <MapComponent
            municipalities={municipalitiesSummary}
            incidents={incidents}
            selectedMunicipality={selectedMunicipality}
            onSelectMunicipality={(mun) => setSelectedMunicipality(mun)}
            onOpenCriteria={() => setIsCriteriaOpen(true)}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardMetrics
            municipalities={municipalitiesSummary}
            incidents={incidents}
            reportMetadata={OFFICIAL_REPORT_METADATA}
            onSelectMunicipality={(mun) => setSelectedMunicipality(mun)}
            onFilterByCategory={handleFilterByCategoryFromDashboard}
          />
        )}

        {currentTab === 'tabla' && (
          <IncidentsTable
            incidents={incidents}
            municipalities={municipalitiesSummary}
            onSelectMunicipality={(mun) => setSelectedMunicipality(mun)}
            initialCategoryFilter={tableCategoryFilter}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-3.5 px-4 sm:px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#BC955B]"></span>
            <span>
              <strong>Gobierno del Estado de Hidalgo</strong> • Subsecretaría de Protección Civil y Gestión de Riesgos
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Sistema SIG de Monitoreo Hidrometeorológico</span>
            <span>•</span>
            <span>84 Municipios Monitoreados</span>
            <span>•</span>
            <button 
              onClick={() => setIsPdfViewerOpen(true)}
              className="hover:text-amber-300 underline cursor-pointer"
            >
              Consultar PDF Fuente (26 Páginas)
            </button>
          </div>
        </div>
      </footer>

      {/* Municipality Drilldown Modal */}
      <MunicipalityDetailModal
        municipality={selectedMunicipality}
        incidents={incidents}
        onClose={() => setSelectedMunicipality(null)}
        onUpdateSemaforoOverride={handleUpdateSemaforoOverride}
      />

      {/* Semaforo Technical Criteria Modal */}
      <SemaforoCriteriaModal
        isOpen={isCriteriaOpen}
        onClose={() => setIsCriteriaOpen(false)}
      />

      {/* Report Upload & AI Extraction Modal */}
      <ReportUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onApplyChanges={handleApplyExtractionChanges}
        onUpdateActivePdf={handleUpdateActivePdf}
      />

      {/* Executive Printable Situation Report Modal */}
      <ExecutiveReportModal
        isOpen={isExecutiveReportOpen}
        onClose={() => setIsExecutiveReportOpen(false)}
        municipalities={municipalitiesSummary}
        incidents={incidents}
        reportMetadata={OFFICIAL_REPORT_METADATA}
      />

      {/* Official PDF Document Viewer Modal */}
      {isPdfViewerOpen && (
        <div className="fixed inset-0 z-[1400] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#531325] px-4 sm:px-5 py-3 text-white flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#BC955B]">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-5 h-5 text-[#BC955B] shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] font-mono tracking-wider bg-rose-950/70 px-2 py-0.5 rounded text-amber-200 block sm:inline mr-2">
                    REPORTE OFICIAL EN CONSULTA
                  </span>
                  <span className="text-sm font-bold text-white truncate">
                    {currentPdfTitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {/* Historical selector if available */}
                {pdfHistorico.length > 1 && (
                  <select
                    value={currentPdfUrl}
                    onChange={(e) => {
                      const selected = pdfHistorico.find(h => h.archivo === e.target.value);
                      if (selected) {
                        setCurrentPdfUrl(selected.archivo);
                        setCurrentPdfTitle(`Corte: ${selected.nombre} (${selected.fecha})`);
                      }
                    }}
                    className="bg-rose-950 border border-rose-800 text-amber-100 rounded px-2 py-1 text-xs focus:outline-none"
                  >
                    {pdfHistorico.map((h, i) => (
                      <option key={i} value={h.archivo}>
                        {h.fecha} - {h.nombre.substring(0, 30)}...
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={() => setShowPdfSourceSettings(!showPdfSourceSettings)}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-amber-200 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="Configurar origen SFTP o enlace web"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Origen SFTP / Enlace</span>
                </button>

                <a
                  href={currentPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pestaña externa</span>
                </a>

                <button
                  onClick={() => setIsPdfViewerOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick configuration bar for SFTP / external URL or testing local files */}
            {showPdfSourceSettings && (
              <div className="bg-slate-800 text-slate-200 px-4 py-2.5 border-b border-slate-700 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex-1 min-w-[260px] flex items-center gap-2">
                  <span className="text-slate-400 whitespace-nowrap">URL directa / SFTP Web:</span>
                  <input
                    type="url"
                    placeholder="https://servidor.hidalgo.gob.mx/reportes/corte_23Oct.pdf"
                    value={customPdfInputUrl}
                    onChange={(e) => setCustomPdfInputUrl(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={() => {
                      if (customPdfInputUrl.trim()) {
                        setCurrentPdfUrl(customPdfInputUrl.trim());
                        setCurrentPdfTitle(`Enlace Remoto: ${customPdfInputUrl.trim().split('/').pop() || 'Reporte'}`);
                      }
                    }}
                    className="px-2.5 py-1 bg-[#BC955B] text-slate-950 font-bold rounded text-xs hover:bg-amber-400 cursor-pointer"
                  >
                    Cargar
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded cursor-pointer text-xs font-medium">
                    <span>Probar archivo local (.pdf)</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          handleUpdateActivePdf(url, file.name);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Document Iframe */}
            <div className="flex-1 bg-slate-100 relative">
              <iframe
                src={currentPdfUrl}
                title={currentPdfTitle}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
