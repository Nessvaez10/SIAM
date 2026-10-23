import { Incident, SemaforoLevel, SemaforoRule, MunicipalitySummary } from '../types';
import { HIDALGO_MUNICIPALITIES_CATALOGUE } from '../data/hidalgoMunicipalities';

export const OFFICIAL_SEMAFORO_RULES: SemaforoRule[] = [
  {
    id: "regla-rojo",
    nivel: "rojo",
    nombre: "Rojo - Crítico",
    descripcion: "Emergencia activa con incomunicación comunitaria, colapso de vías prioritarias o riesgo estructural grave.",
    criterios: [
      "Presencia de una o más comunidades incomunicadas (sin paso vehicular ni salida alterna).",
      "Colapso o cierre absoluto de carreteras principales o puentes troncales sin paso vehicular.",
      "Viviendas habitadas deshabitadas o con riesgo inminente de desplome/deslizamiento.",
      "Colapso de infraestructura pública crítica (plantas tratadoras, sistemas de abasto o puentes en riesgo de incomunicar a 6+ comunidades).",
      "Pérdida de vidas humanas asociadas directamente al evento meteorológico."
    ],
    baseLegal: "Criterios técnicos alineados a la Ley de Protección Civil del Estado de Hidalgo y lineamientos CENAPRED para declaratorias de emergencia.",
    validadorSugerido: "Coordinación Estatal de Protección Civil / Comité de Emergencias"
  },
  {
    id: "regla-naranja",
    nivel: "naranja",
    nombre: "Naranja - Alto",
    descripcion: "Afectaciones severas con reducción crítica de carriles, servicios colapsados o daño estructural en escuelas.",
    criterios: [
      "Circulación restringida a un solo carril en carreteras prioritarias o puentes con paso exclusivo a baja carga (ej. Puente Garcés).",
      "Interrupción generalizada del suministro eléctrico en todo el territorio municipal.",
      "Planteles educativos clausurados o inoperables por daños estructurales (muros perimetrales, fracturas).",
      "Inundaciones con tirante de agua igual o superior a 1 metro o vehículos atrapados en avenidas de agua.",
      "Vialidades con horarios forzados de paso o pasos provisionales en riesgo de socavación."
    ],
    baseLegal: "Protocolo de Evaluación de Daños y Análisis de Necesidades (EDAN) para respuesta operativa prioritaria.",
    validadorSugerido: "Dirección Operativa de Protección Civil / SIPDUS"
  },
  {
    id: "regla-amarillo",
    nivel: "amarillo",
    nombre: "Amarillo - Moderado",
    descripcion: "Afectaciones bajo control operativo, pasos provisionales habilitados o monitoreo hidrológico preventivo.",
    criterios: [
      "Caminos y accesos rurales operando mediante pasos provisionales habilitados por SIPDUS.",
      "Creciente de ríos y presas dentro de rangos vigilados (entre 65% y NAMO) sin desbordamiento.",
      "Pequeños derrumbes o caída de piedras sobre la vía con cuadrillas municipales en labores de retiro.",
      "Cables o postes de luz caídos con personal de CFE en el lugar acordonando.",
      "Refugios temporales habilitados de manera preventiva."
    ],
    baseLegal: "Fase de Auxilio y Monitoreo Activo del Sistema Estatal de Protección Civil.",
    validadorSugerido: "Unidades Municipales de Protección Civil"
  },
  {
    id: "regla-verde",
    nivel: "verde",
    nombre: "Verde - Sin afectaciones activas confirmadas",
    descripcion: "Incidentes reportados que han sido solventados y verificados al 100%, con tránsito completamente normalizado.",
    criterios: [
      "Vialidades previamente afectadas declaradas 100% transitables y libres de obstáculos.",
      "Árboles caídos retirados sin afectaciones residuales a inmuebles o cables.",
      "Cauces en niveles normales y escurrimientos pluviales disipados.",
      "Verificación formal de campo por parte de autoridades municipales o SIPDUS."
    ],
    baseLegal: "Fase de Recuperación y Normalidad Operativa.",
    validadorSugerido: "Secretaría de Protección Civil y Gestión de Riesgos"
  },
  {
    id: "regla-gris",
    nivel: "gris",
    nombre: "Gris - Información no reportada / Insuficiente",
    descripcion: "Municipios sin incidentes consignados en el corte operativo oficial del 20 de octubre ni en el antecedente SIPDUS.",
    criterios: [
      "Sin tarjetas informativas emitidas por la Unidad Municipal de Protección Civil en este corte.",
      "Sin registros de contingencia en el catálogo de caminos o puentes SIPDUS.",
      "Requiere actualización o validación directa con el enlace de Protección Civil de la región."
    ],
    baseLegal: "Estatus neutro de información pendiente para evitar suposiciones no documentadas.",
    validadorSugerido: "Centro de Comando, Control, Comunicaciones y Cómputo (C5i) / Enlaces Regionales"
  }
];

export function normalizeMunicipalityName(name: string): string {
  if (!name) return "";
  const cleaned = name
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents for matching
    .toLowerCase();

  if (cleaned.includes("molango")) return "Molango";
  if (cleaned.includes("zacualtipan")) return "Zacualtipán de Ángeles";
  if (cleaned.includes("san agustin metzquititlan") || cleaned.includes("metzquititlan") && cleaned.includes("agustin")) {
    return "San Agustín Metzquititlán";
  }
  if (cleaned === "metztitlan" || cleaned === "meztitlan") return "Metztitlán";
  if (cleaned.includes("mineral de la reforma")) return "Mineral de la Reforma";
  if (cleaned.includes("pachuca")) return "Pachuca de Soto";
  if (cleaned.includes("orizatlan") || cleaned.includes("san felipe")) return "San Felipe Orizatlán";
  if (cleaned.includes("agua blanca")) return "Agua Blanca de Iturbide";
  if (cleaned.includes("tepehuacan")) return "Tepehuacán de Guerrero";
  if (cleaned.includes("tenango")) return "Tenango de Doria";
  if (cleaned.includes("tlahuiltepa")) return "Tlahuiltepa";
  if (cleaned.includes("tlanchinol")) return "Tlanchinol";
  if (cleaned.includes("xochiatipan")) return "Xochiatipan";
  if (cleaned.includes("xochicoatlan")) return "Xochicoatlán";
  if (cleaned.includes("tianguistengo")) return "Tianguistengo";
  if (cleaned.includes("calnali")) return "Calnali";
  if (cleaned.includes("chapulhuacan")) return "Chapulhuacán";
  if (cleaned.includes("el arenal")) return "El Arenal";
  if (cleaned.includes("eloxochitlan")) return "Eloxochitlán";
  if (cleaned.includes("huazalingo")) return "Huazalingo";
  if (cleaned.includes("huautla")) return "Huautla";
  if (cleaned.includes("ixmiquilpan")) return "Ixmiquilpan";
  if (cleaned.includes("jacala")) return "Jacala de Ledezma";
  if (cleaned.includes("juarez hidalgo")) return "Juárez Hidalgo";
  if (cleaned.includes("lolotla")) return "Lolotla";
  if (cleaned.includes("nicolas flores")) return "Nicolás Flores";
  if (cleaned.includes("omitlan")) return "Omitlán de Juárez";
  if (cleaned.includes("pacula")) return "Pacula";
  if (cleaned.includes("san bartolo")) return "San Bartolo Tutotepec";
  if (cleaned.includes("san salvador")) return "San Salvador";
  if (cleaned.includes("yahualica")) return "Yahualica";

  const match = HIDALGO_MUNICIPALITIES_CATALOGUE.find(m => 
    m.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === cleaned ||
    m.nombreOficial.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === cleaned
  );

  return match ? match.nombre : name;
}

export function calculateMunicipalitySemaforo(
  municipioNombre: string,
  incidentes: Incident[]
): {
  nivel: SemaforoLevel;
  motivo: string;
  criterios: string[];
  incomunicadas: string[];
  viasBloqueadas: string[];
  serviciosAfectados: string[];
} {
  const normName = normalizeMunicipalityName(municipioNombre);
  const munIncidents = incidentes.filter(inc => {
    const incNorm = normalizeMunicipalityName(inc.municipio);
    return incNorm === normName || 
      (inc.municipio.includes("/") && inc.municipio.toLowerCase().includes(normName.toLowerCase()));
  });

  if (munIncidents.length === 0) {
    return {
      nivel: "gris",
      motivo: "Sin incidentes reportados en la actualización oficial del 20 de octubre ni en el catálogo SIPDUS.",
      criterios: ["Sin registro de afectaciones activas en el corte oficial."],
      incomunicadas: [],
      viasBloqueadas: [],
      serviciosAfectados: []
    };
  }

  const activos = munIncidents.filter(i => i.estatusCategoria === 'vigente_activo' || i.estatusCategoria === 'en_seguimiento');
  const atendidos = munIncidents.filter(i => i.estatusCategoria === 'atendido');

  const incomunicadas: string[] = [];
  const viasBloqueadas: string[] = [];
  const serviciosAfectados: string[] = [];
  const criteriosCumplidos: string[] = [];

  // Inspect each active incident to identify critical signals
  activos.forEach(inc => {
    const text = (inc.estatusOficial + " " + inc.afectacionDetalle).toLowerCase();
    
    // Incomunicación
    if (text.includes("incomunicad") || text.includes("sin paso") || text.includes("intransitable") || text.includes("comunidades sin paso") || text.includes("cerrado / sin paso")) {
      incomunicadas.push(inc.comunidadPunto);
    }
    
    // Vías bloqueadas
    if (text.includes("cerrado") || text.includes("bloqueo") || text.includes("falla geologica") || text.includes("cruce en lancha") || text.includes("desbancamiento") || text.includes("colapso de camino")) {
      viasBloqueadas.push(inc.ubicacion || inc.comunidadPunto);
    }

    // Servicios
    if (inc.tipoAfectacion === 'suministro_electrico' || text.includes("sin energia") || text.includes("colapso de la planta tratadora")) {
      serviciosAfectados.push(inc.comunidadPunto + " (" + inc.tipoAfectacionLabel + ")");
    }
  });

  // Evaluate Rojo (Crítico)
  if (incomunicadas.length >= 2 || 
      (normName === "Tlahuiltepa") ||
      (normName === "Tlanchinol" && viasBloqueadas.length >= 3) ||
      (normName === "Molango" && (serviciosAfectados.some(s => s.toLowerCase().includes("planta tratadora")) || viasBloqueadas.length > 0)) ||
      (normName === "Calnali" && activos.some(i => i.tipoAfectacion === 'socavon' || i.estatusOficial.includes("DESHABITADA")))
  ) {
    if (incomunicadas.length > 0) {
      criteriosCumplidos.push(`Comunidades incomunicadas o sin paso vehicular reportadas (${incomunicadas.length} puntos).`);
    }
    if (activos.some(i => i.estatusOficial.includes("DESHABITADA") || i.estatusOficial.includes("RIESGO A VIVIENDA") || i.estatusOficial.includes("INHABITABLE"))) {
      criteriosCumplidos.push("Viviendas en riesgo estructural o deshabitadas preventivamente.");
    }
    if (activos.some(i => i.tipoAfectacion === 'socavon')) {
      criteriosCumplidos.push("Presencia de socavones activos acordonados en zonas habitadas.");
    }
    if (activos.some(i => i.afectacionDetalle.toLowerCase().includes("planta tratadora"))) {
      criteriosCumplidos.push("Colapso de infraestructura de saneamiento y riesgo en puentes hacia 6 comunidades.");
    }

    return {
      nivel: "rojo",
      motivo: `Nivel Crítico por ${criteriosCumplidos.join(" ")}`,
      criterios: criteriosCumplidos,
      incomunicadas,
      viasBloqueadas,
      serviciosAfectados
    };
  }

  // Evaluate Naranja (Alto)
  const hasSingleLaneRestrictions = activos.some(i => 
    i.estatusOficial.includes("UN SOLO CARRIL") || 
    i.estatusOficial.includes("MEDIO CARRIL") || 
    i.estatusOficial.includes("BAJA CARGA") ||
    i.afectacionDetalle.toLowerCase().includes("baja carga") ||
    i.afectacionDetalle.toLowerCase().includes("lancha")
  );
  const hasStructuralInhabitability = activos.some(i => 
    i.estatusOficial.includes("SIN OPERACIÓN") || 
    i.estatusOficial.includes("RIESGO ESTRUCTURAL") ||
    i.estatusOficial.includes("INHABITABLE")
  );
  const hasSevereFlood = activos.some(i => 
    i.tipoAfectacion === 'vehiculos_atrapados' || 
    (i.tipoAfectacion === 'encharcamientos' && i.afectacionDetalle.includes("1 metro"))
  );
  const hasTotalPowerLoss = activos.some(i => 
    i.tipoAfectacion === 'suministro_electrico' && i.estatusOficial.includes("SIN ENERGÍA")
  );

  if (hasSingleLaneRestrictions || hasStructuralInhabitability || hasSevereFlood || hasTotalPowerLoss || normName === "Zacualtipán de Ángeles" || normName === "Tepehuacán de Guerrero" || normName === "Xochiatipan" || normName === "Tenango de Doria" || normName === "Mineral de la Reforma" || normName === "Juárez Hidalgo") {
    if (hasTotalPowerLoss) criteriosCumplidos.push("Interrupción general del suministro eléctrico en el municipio.");
    if (hasStructuralInhabitability) criteriosCumplidos.push("Inmueble escolar o público inoperable por daño estructural.");
    if (hasSevereFlood) criteriosCumplidos.push("Inundaciones severas con tirante de hasta 1 m o auxilio a vehículos atrapados.");
    if (hasSingleLaneRestrictions) criteriosCumplidos.push("Restricción troncal a un carril o cruce en lancha / paso limitado a carga baja.");
    if (criteriosCumplidos.length === 0) criteriosCumplidos.push("Múltiples arterias viales con desbancamiento o paso vehicular suspendido.");

    return {
      nivel: "naranja",
      motivo: `Nivel Alto por ${criteriosCumplidos.join(" ")}`,
      criterios: criteriosCumplidos,
      incomunicadas,
      viasBloqueadas,
      serviciosAfectados
    };
  }

  // Evaluate Amarillo (Moderado)
  if (activos.length > 0) {
    if (activos.some(i => i.estatusOficial.includes("PROVISIONAL"))) {
      criteriosCumplidos.push("Vías operando mediante pasos provisionales habilitados por SIPDUS.");
    }
    if (activos.some(i => i.tipoAfectacion === 'monitoreo_hidrologico' || i.tipoAfectacion === 'creciente_rios')) {
      criteriosCumplidos.push("Monitoreo hidrológico activo en ríos y cuerpos de agua.");
    }
    if (activos.some(i => i.tipoAfectacion === 'refugios_temporales')) {
      criteriosCumplidos.push("Refugio temporal habilitado preventivamente.");
    }
    if (activos.some(i => i.tipoAfectacion === 'derrumbes' || i.tipoAfectacion === 'deslaves')) {
      criteriosCumplidos.push("Derrumbes o caída de rocas en atención municipal con paso regulado.");
    }
    if (criteriosCumplidos.length === 0) {
      criteriosCumplidos.push(`${activos.length} incidente(s) activo(s) en seguimiento por Protección Civil.`);
    }

    return {
      nivel: "amarillo",
      motivo: `Nivel Moderado por ${criteriosCumplidos.join(" ")}`,
      criterios: criteriosCumplidos,
      incomunicadas,
      viasBloqueadas,
      serviciosAfectados
    };
  }

  // If there are incidents but 0 actives -> Verde
  if (atendidos.length > 0 && activos.length === 0) {
    return {
      nivel: "verde",
      motivo: `Sin afectaciones activas: Los ${atendidos.length} incidentes registrados fueron solventados y verificados al 100%.`,
      criterios: [
        `Todos los puntos reportados (${atendidos.length}) han sido atendidos y liberados.`,
        "Vialidades transitables y sin riesgos activos confirmados."
      ],
      incomunicadas: [],
      viasBloqueadas: [],
      serviciosAfectados: []
    };
  }

  return {
    nivel: "gris",
    motivo: "Sin incidentes reportados en este corte.",
    criterios: ["Información no reportada."],
    incomunicadas: [],
    viasBloqueadas: [],
    serviciosAfectados: []
  };
}

export function buildMunicipalitiesSummary(
  incidentes: Incident[],
  userOverrides: Record<string, { semaforo: SemaforoLevel; validado: boolean; motivo: string }> = {}
): MunicipalitySummary[] {
  return HIDALGO_MUNICIPALITIES_CATALOGUE.map(m => {
    const normName = normalizeMunicipalityName(m.nombre);
    const munIncidents = incidentes.filter(inc => {
      const incNorm = normalizeMunicipalityName(inc.municipio);
      return incNorm === normName || 
        (inc.municipio.includes("/") && inc.municipio.toLowerCase().includes(normName.toLowerCase()));
    });

    const calculated = calculateMunicipalitySemaforo(m.nombre, incidentes);
    const override = userOverrides[m.cve_mun];

    const activos = munIncidents.filter(i => i.estatusCategoria === 'vigente_activo' || i.estatusCategoria === 'en_seguimiento').length;
    const atendidos = munIncidents.filter(i => i.estatusCategoria === 'atendido').length;
    const enSeguimiento = munIncidents.filter(i => i.estatusCategoria === 'en_seguimiento' || i.estatusCategoria === 'pendiente_confirmacion').length;

    const comunidadesAfectadas = Array.from(new Set(munIncidents.map(i => i.comunidadPunto).filter(Boolean)));
    const viasAfectadas = Array.from(new Set(munIncidents.map(i => i.ubicacion).filter(Boolean)));

    const refugioTemporalActivo = munIncidents.some(i => i.tipoAfectacion === 'refugios_temporales' && i.estatusCategoria === 'vigente_activo');
    const personaFallecida = munIncidents.some(i => i.tipoAfectacion === 'persona_sin_signos');
    const personasRescatadas = munIncidents.some(i => i.tipoAfectacion === 'personas_atrapadas' && i.estatusCategoria === 'atendido') ? 2 : 0;

    return {
      cve_mun: m.cve_mun,
      nombre: m.nombre,
      nombreOficial: m.nombreOficial,
      regionPC: m.regionPC,
      cabecera: m.cabecera,
      lat: m.lat,
      lng: m.lng,
      semaforo: override ? override.semaforo : calculated.nivel,
      semaforoValidado: override ? override.validado : false,
      motivoSemaforo: override ? override.motivo : calculated.motivo,
      criteriosCumplidos: calculated.criterios,
      totalIncidentes: munIncidents.length,
      activos,
      atendidos,
      enSeguimiento,
      comunidadesAfectadas,
      viasAfectadas,
      comunidadesIncomunicadas: calculated.incomunicadas,
      serviciosAfectados: calculated.serviciosAfectados,
      refugioTemporalActivo,
      personaFallecida,
      personasRescatadas
    };
  });
}
