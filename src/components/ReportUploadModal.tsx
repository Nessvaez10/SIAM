import React, { useState } from 'react';
import { Incident, AffectationCategory, ExtractionChangeItem } from '../types';
import { 
  X, 
  UploadCloud, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Save, 
  CheckSquare, 
  Square,
  RefreshCw,
  Eye,
  FileCheck2
} from 'lucide-react';

interface ReportUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyChanges: (validatedChanges: ExtractionChangeItem[]) => void;
}

export const ReportUploadModal: React.FC<ReportUploadModalProps> = ({
  isOpen,
  onClose,
  onApplyChanges,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('actualizacion_21_octubre');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractedChanges, setExtractedChanges] = useState<ExtractionChangeItem[] | null>(null);
  const [documentMeta, setDocumentMeta] = useState<{ title: string; date: string; pageCount: number } | null>(null);

  if (!isOpen) return null;

  // Preset sample operational updates for testing & demonstration
  const handleRunAnalysis = (presetType = selectedPreset) => {
    setIsProcessing(true);

    setTimeout(() => {
      if (presetType === 'actualizacion_21_octubre') {
        setDocumentMeta({
          title: "Boletín Operativo Lluvias - Corte Matutino 21 de Octubre",
          date: "21/10/2026, 08:30 h",
          pageCount: 6
        });

        setExtractedChanges([
          {
            id: "chg-1",
            municipio: "Juárez Hidalgo",
            comunidadPunto: "Todo el municipio",
            tipoAfectacion: "suministro_electrico",
            estatusAnterior: "SIN ENERGÍA ELÉCTRICA",
            estatusNuevo: "SUMINISTRO RESTABLECIDO AL 100% / ATENDIDO",
            tipoCambio: "resuelto",
            detalle: "CFE concluyó la reposición del tendido eléctrico troncal a las 05:40 h; servicio reanudado en la totalidad de las comunidades.",
            paginaReferencia: 2,
            aprobadoParaAplicar: true
          },
          {
            id: "chg-2",
            municipio: "Xochiatipan",
            comunidadPunto: "Puente / Río Garcés",
            tipoAfectacion: "afectaciones_estructurales",
            estatusAnterior: "PASO RESTRINGIDO / SOLO VEHÍCULOS DE BAJA CARGA",
            estatusNuevo: "CIRCULACIÓN A DOS CARRILES HABILITADA PREVENTIVAMENTE",
            tipoCambio: "actualizacion_estatus",
            detalle: "Maquinaria de SICT Federal colocó terraplén de refuerzo temporal permitiendo paso de vehículos de carga media hasta inicio formal de obra el 26/10.",
            paginaReferencia: 3,
            aprobadoParaAplicar: true
          },
          {
            id: "chg-3",
            municipio: "Tlahuiltepa",
            comunidadPunto: "Barrio de Guadalupe",
            tipoAfectacion: "derrumbes",
            estatusAnterior: "COMUNIDAD INCOMUNICADA / DERRUMBES",
            estatusNuevo: "PASO PROVISIONAL EN UN CARRIL / MAQUINARIA EN SITIO",
            tipoCambio: "actualizacion_estatus",
            detalle: "Cuadrilla SIPDUS abrió brecha de emergencia a un carril; la comunidad sale del estatus de incomunicación absoluta.",
            paginaReferencia: 4,
            aprobadoParaAplicar: true
          },
          {
            id: "chg-4",
            municipio: "Mineral de la Reforma",
            comunidadPunto: "Avenida San Judas",
            tipoAfectacion: "encharcamientos",
            estatusAnterior: "NIVEL EN DESCENSO / SEGUIMIENTO",
            estatusNuevo: "NIVEL NORMALIZADO / VIALIDAD LIBRE",
            tipoCambio: "resuelto",
            detalle: "Descenso total del nivel del agua, azolve retirado por cuadrillas de servicios municipales.",
            paginaReferencia: 5,
            aprobadoParaAplicar: true
          },
          {
            id: "chg-5",
            municipio: "Zimapán",
            comunidadPunto: "Carretera Tasquillo-Zimapán km 102",
            tipoAfectacion: "derrumbes",
            estatusAnterior: undefined,
            estatusNuevo: "DERRUMBE MENOR / RETIRO EN CURSO",
            tipoCambio: "nuevo",
            detalle: "Nuevo desprendimiento menor de rocas registrado a las 06:15 h en el km 102; paso alternado por un carril.",
            paginaReferencia: 6,
            aprobadoParaAplicar: true
          }
        ]);
      } else {
        // Current initial report re-scan
        setDocumentMeta({
          title: "Concentrado Ejecutivo de Lluvias - 20 de Octubre de 2026",
          date: "20/10/2026, 21:13 h",
          pageCount: 26
        });

        setExtractedChanges([
          {
            id: "chg-init-1",
            municipio: "Calnali",
            comunidadPunto: "Barrio Ahuimol",
            tipoAfectacion: "deslaves",
            estatusAnterior: "RIESGO ACTIVO / VIVIENDA DESHABITADA",
            estatusNuevo: "RIESGO ACTIVO / VIVIENDA DESHABITADA",
            tipoCambio: "sin_cambio",
            detalle: "Confirmado deslave activo en Barrio Ahuimol, vivienda deshabitada preventivamente.",
            paginaReferencia: 4,
            aprobadoParaAplicar: true
          },
          {
            id: "chg-init-2",
            municipio: "Tlanchinol",
            comunidadPunto: "Barrio Linda Vista",
            tipoAfectacion: "afectaciones_estructurales",
            estatusAnterior: "AFECTACIÓN ACTIVA",
            estatusNuevo: "AFECTACIÓN ACTIVA",
            tipoCambio: "sin_cambio",
            detalle: "Barda colapsada sobre vivienda; pendiente remoción completa.",
            paginaReferencia: 16,
            aprobadoParaAplicar: true
          }
        ]);
      }

      setIsProcessing(false);
    }, 1200);
  };

  const handleToggleChange = (id: string) => {
    if (!extractedChanges) return;
    setExtractedChanges(extractedChanges.map(c => 
      c.id === id ? { ...c, aprobadoParaAplicar: !c.aprobadoParaAplicar } : c
    ));
  };

  const handleSelectAll = (select: boolean) => {
    if (!extractedChanges) return;
    setExtractedChanges(extractedChanges.map(c => ({ ...c, aprobadoParaAplicar: select })));
  };

  const handleApply = () => {
    if (!extractedChanges) return;
    const toApply = extractedChanges.filter(c => c.aprobadoParaAplicar);
    onApplyChanges(toApply);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1300] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#531325] via-[#691C32] to-[#791c38] px-5 py-4 text-white flex items-center justify-between border-b-4 border-[#BC955B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-amber-300/30">
              <Sparkles className="w-5 h-5 text-[#BC955B]" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider bg-rose-950/70 px-2 py-0.5 rounded text-amber-200">
                PROCESAMIENTO INTELIGENTE DE REPORTES (IA)
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-serif leading-tight">
                Módulo de Carga y Extracción de Documentos PDF
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Upload Dropzone */}
          <div className="p-5 border-2 border-dashed border-slate-300 hover:border-[#691C32] rounded-xl text-center bg-slate-50 transition-colors">
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">
              Cargue el nuevo reporte oficial en formato PDF
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              El motor extraerá automáticamente los incidentes, cruzará con la base histórica SIPDUS y resaltará los cambios para su validación previa.
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <label className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-xs cursor-pointer">
                <span>Seleccionar archivo PDF del equipo</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFile(f);
                      handleRunAnalysis();
                    }
                  }}
                />
              </label>

              <span className="text-xs text-slate-400">o probar actualización simulada:</span>

              <select
                value={selectedPreset}
                onChange={(e) => {
                  setSelectedPreset(e.target.value);
                  handleRunAnalysis(e.target.value);
                }}
                className="py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-700 focus:outline-none"
              >
                <option value="actualizacion_21_octubre">Boletín Matutino (21/Octubre - Aperturas y Restablecimientos)</option>
                <option value="reporte_inicial">Reanalizar Reporte Inicial (20/Octubre - 26 páginas)</option>
              </select>
            </div>

            {file && (
              <div className="mt-3 inline-flex items-center gap-2 bg-rose-50 text-rose-900 border border-rose-200 px-3 py-1 rounded-full text-xs font-medium">
                <FileText className="w-3.5 h-3.5 text-[#691C32]" />
                <span>{file.name}</span>
                <span className="text-[10px] text-slate-500">({(file.size / 1024).toFixed(0)} KB)</span>
              </div>
            )}
          </div>

          {/* Processing Spinner */}
          {isProcessing && (
            <div className="py-8 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-[#691C32] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-700">
                Extrayendo entidades geográficas y cotejando incidentes con IA...
              </p>
              <p className="text-[11px] text-slate-400">
                Detectando cambios de estatus (Activo → Atendido) y nuevas incidencias en los 84 municipios.
              </p>
            </div>
          )}

          {/* Extracted Changes Review Section */}
          {extractedChanges && !isProcessing && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <span>Resultados de la Extracción Previa a Validación</span>
                  </h4>
                  {documentMeta && (
                    <p className="text-[11px] text-slate-500">
                      Documento: <strong>{documentMeta.title}</strong> • Corte: {documentMeta.date} ({documentMeta.pageCount} págs.)
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => handleSelectAll(true)}
                    className="text-blue-700 hover:underline font-medium cursor-pointer"
                  >
                    Seleccionar todos
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => handleSelectAll(false)}
                    className="text-slate-500 hover:underline cursor-pointer"
                  >
                    Desmarcar
                  </button>
                </div>
              </div>

              {/* Notice of User Validation Requirement */}
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                <span>
                  Por protocolo de Protección Civil, <strong>ningún dato se sobrescribe automáticamente</strong> sin la aprobación expresa del analista. Marque las casillas de los cambios que desea aplicar.
                </span>
                <span className="font-bold text-blue-950 ml-2 whitespace-nowrap">
                  {extractedChanges.filter(c => c.aprobadoParaAplicar).length} / {extractedChanges.length} aprobados
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {extractedChanges.map(change => {
                  return (
                    <div
                      key={change.id}
                      onClick={() => handleToggleChange(change.id)}
                      className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        change.aprobadoParaAplicar 
                          ? 'bg-white border-[#691C32]/40 shadow-xs ring-1 ring-[#691C32]/20' 
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={change.aprobadoParaAplicar}
                            onChange={() => {}} // handled by parent onClick
                            className="mt-0.5 rounded text-[#691C32] focus:ring-[#691C32] pointer-events-none"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-sm">{change.municipio}</span>
                              <span className="text-slate-400">•</span>
                              <span className="font-semibold text-slate-700">{change.comunidadPunto}</span>
                              
                              {change.tipoCambio === 'resuelto' && (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                  ✓ Resuelto / Atendido
                                </span>
                              )}
                              {change.tipoCambio === 'actualizacion_estatus' && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                  ⚡ Actualización Operativa
                                </span>
                              )}
                              {change.tipoCambio === 'nuevo' && (
                                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                  + Nuevo Incidente
                                </span>
                              )}
                              {change.tipoCambio === 'sin_cambio' && (
                                <span className="bg-slate-200 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded">
                                  Sin Cambio
                                </span>
                              )}
                            </div>

                            {/* Status evolution */}
                            {change.estatusAnterior && (
                              <div className="mt-1 flex items-center gap-2 text-[11px]">
                                <span className="line-through text-slate-400">{change.estatusAnterior}</span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <strong className="text-emerald-700">{change.estatusNuevo}</strong>
                              </div>
                            )}

                            <p className="mt-1 text-slate-600 leading-relaxed">
                              {change.detalle}
                            </p>
                          </div>
                        </div>

                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                          Pág. {change.paginaReferencia}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Trazabilidad garantizada con sellado de tiempo
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
            >
              Cancelar
            </button>
            <button
              disabled={!extractedChanges || extractedChanges.filter(c => c.aprobadoParaAplicar).length === 0}
              onClick={handleApply}
              className="px-4 py-2 bg-[#691C32] hover:bg-[#501526] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Aplicar Cambios Aprobados</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
