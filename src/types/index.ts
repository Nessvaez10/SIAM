export type SemaforoLevel = 'rojo' | 'naranja' | 'amarillo' | 'verde' | 'gris';

export type StatusCategory = 
  | 'vigente_activo'        // Rojo en el reporte oficial
  | 'atendido'              // Verde en el reporte oficial
  | 'en_seguimiento'        // Con trabajos u operativos en curso
  | 'pendiente_confirmacion'// Requiere verificación municipal/SIPDUS
  | 'historico_sipdus';     // Antecedente histórico

export type AffectationCategory =
  | 'deslaves'
  | 'derrumbes'
  | 'socavon'
  | 'afectaciones_estructurales'
  | 'creciente_rios'
  | 'vias_accesos'
  | 'encharcamientos'
  | 'personas_atrapadas'
  | 'personas_lesionadas'
  | 'persona_sin_signos'
  | 'caida_arboles'
  | 'suministro_electrico'
  | 'drenaje_colapsado'
  | 'evacuaciones_preventivas'
  | 'refugios_temporales'
  | 'monitoreo_hidrologico'
  | 'monitoreo_preventivo'
  | 'accidentes'
  | 'vehiculos_atrapados';

export interface Incident {
  id: string;
  municipio: string;
  comunidadPunto: string;
  ubicacion: string;
  tipoAfectacion: AffectationCategory;
  tipoAfectacionLabel: string;
  estatusOficial: string;
  estatusCategoria: StatusCategory;
  afectacionDetalle: string;
  accionAtencion?: string;
  documentoOrigen: string;
  paginaDocumento: number;
  fechaReporte: string;
  referenciaSIPDUS?: string;
  ultimaVerificacion: string;
  puntosContabilizados?: number;
  esHistoricoSipdus?: boolean;
  coordenadasAprox?: [number, number];
}

export interface MunicipalitySummary {
  cve_mun: string;
  nombre: string;
  nombreOficial: string;
  regionPC: string;
  cabecera: string;
  lat: number;
  lng: number;
  semaforo: SemaforoLevel;
  semaforoValidado: boolean;
  motivoSemaforo: string;
  criteriosCumplidos: string[];
  totalIncidentes: number;
  activos: number;
  atendidos: number;
  enSeguimiento: number;
  comunidadesAfectadas: string[];
  viasAfectadas: string[];
  comunidadesIncomunicadas: string[];
  serviciosAfectados: string[];
  refugioTemporalActivo?: boolean;
  personaFallecida?: boolean;
  personasLesionadas?: number;
  personasRescatadas?: number;
  notasOficiales?: string;
}

export interface SemaforoRule {
  id: string;
  nivel: SemaforoLevel;
  nombre: string;
  descripcion: string;
  criterios: string[];
  baseLegal: string;
  validadorSugerido: string;
}

export interface PDFReportMetadata {
  titulo: string;
  subtitulo: string;
  dependencia: string;
  fechaIntegracion: string;
  horaIntegracion: string;
  referenciaSIPDUS: string;
  volumetriaSIPDUS: {
    caminosContingencia: number;
    caminosCerrados: number;
    caminosAbiertosParcial: number;
    caminosAtendidos100: number;
    puentesAfectados: number;
    m3Cuantificados: number;
    m3Retirados: number;
    m3Pendientes: number;
  };
  resumenIncidentes: {
    deslaves: { activos: number; atendidos: number; total: number };
    derrumbes: { activos: number; atendidos: number; total: number };
    socavones: { activos: number; atendidos: number; total: number };
    estructurales: { activos: number; atendidos: number; total: number };
    crecienteRios: { activos: number; atendidos: number; total: number };
    viasAccesos: { activos: number; atendidos: number; total: number };
    encharcamientos: { activos: number; atendidos: number; total: number };
    personasLesionadas: number;
    personasAtrapadas: { activos: number; atendidos: number; total: number };
    personaSinSignos: { activos: number; atendidos: number; total: number };
    caidaArboles: { activos: number; atendidos: number; total: number };
    suministroElectrico: { activos: number; atendidos: number; total: number };
    drenajeColapsado: { activos: number; atendidos: number; total: number };
    evacuacionesPreventivas: { activos: number; atendidos: number; total: number };
    refugiosTemporales: { activos: number; atendidos: number; total: number };
    monitoreoHidrologico: { activos: number; atendidos: number; total: number };
    monitoreoPreventivo: { activos: number; atendidos: number; total: number };
    accidentes: { activos: number; atendidos: number; total: number };
    vehiculosAtrapados: { activos: number; atendidos: number; total: number };
  };
}

export interface ExtractionChangeItem {
  id: string;
  municipio: string;
  comunidadPunto: string;
  tipoAfectacion: AffectationCategory;
  estatusAnterior?: string;
  estatusNuevo: string;
  tipoCambio: 'nuevo' | 'actualizacion_estatus' | 'resuelto' | 'sin_cambio';
  detalle: string;
  paginaReferencia: number;
  aprobadoParaAplicar: boolean;
}
