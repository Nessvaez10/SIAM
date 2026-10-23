import { Incident, MunicipalitySummary } from '../types';

export function exportIncidentsToCSV(incidents: Incident[], fileName = 'afectaciones_meteorologicas_hidalgo.csv') {
  const headers = [
    'ID',
    'Municipio',
    'Tipo de Afectación',
    'Comunidad / Punto',
    'Ubicación Específica',
    'Estatus Oficial',
    'Categoría Estatus',
    'Descripción de la Afectación',
    'Acción de Atención / Operativo',
    'Documento Origen',
    'Página',
    'Fecha del Reporte',
    'Referencia SIPDUS',
    'Última Verificación'
  ];

  const escapeCSV = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = incidents.map(inc => [
    escapeCSV(inc.id),
    escapeCSV(inc.municipio),
    escapeCSV(inc.tipoAfectacionLabel),
    escapeCSV(inc.comunidadPunto),
    escapeCSV(inc.ubicacion),
    escapeCSV(inc.estatusOficial),
    escapeCSV(inc.estatusCategoria),
    escapeCSV(inc.afectacionDetalle),
    escapeCSV(inc.accionAtencion || ''),
    escapeCSV(inc.documentoOrigen),
    escapeCSV(inc.paginaDocumento),
    escapeCSV(inc.fechaReporte),
    escapeCSV(inc.referenciaSIPDUS || ''),
    escapeCSV(inc.ultimaVerificacion)
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportMunicipalitiesToCSV(municipalities: MunicipalitySummary[], fileName = 'semaforo_municipal_hidalgo.csv') {
  const headers = [
    'Clave INEGI',
    'Municipio',
    'Región PC',
    'Cabecera',
    'Semáforo',
    'Estado Validación',
    'Total Incidentes',
    'Activos / Vigentes',
    'Atendidos',
    'En Seguimiento',
    'Comunidades Incomunicadas',
    'Motivo Semáforo'
  ];

  const escapeCSV = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = municipalities.map(m => [
    escapeCSV(m.cve_mun),
    escapeCSV(m.nombre),
    escapeCSV(m.regionPC),
    escapeCSV(m.cabecera),
    escapeCSV(m.semaforo.toUpperCase()),
    escapeCSV(m.semaforoValidado ? 'Validado por Usuario' : 'Calculado'),
    escapeCSV(m.totalIncidentes),
    escapeCSV(m.activos),
    escapeCSV(m.atendidos),
    escapeCSV(m.enSeguimiento),
    escapeCSV(m.comunidadesIncomunicadas.join('; ')),
    escapeCSV(m.motivoSemaforo)
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
