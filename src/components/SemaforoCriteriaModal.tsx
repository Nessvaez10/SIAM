import React, { useState } from 'react';
import { SemaforoRule, SemaforoLevel } from '../types';
import { OFFICIAL_SEMAFORO_RULES } from '../utils/semaforoLogic';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  SlidersHorizontal, 
  Scale, 
  FileText,
  Check
} from 'lucide-react';

interface SemaforoCriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCriteriaValidation?: (validated: boolean) => void;
}

export const SemaforoCriteriaModal: React.FC<SemaforoCriteriaModalProps> = ({
  isOpen,
  onClose,
  onSaveCriteriaValidation,
}) => {
  const [selectedRule, setSelectedRule] = useState<SemaforoLevel>('rojo');
  const [isCriteriaValidated, setIsCriteriaValidated] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentRule = OFFICIAL_SEMAFORO_RULES.find(r => r.nivel === selectedRule) || OFFICIAL_SEMAFORO_RULES[0];

  const ruleBadgeColors: Record<SemaforoLevel, { bg: string; text: string; border: string }> = {
    rojo: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' },
    naranja: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
    amarillo: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
    verde: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
    gris: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-300' },
  };

  const handleValidate = () => {
    if (onSaveCriteriaValidation) {
      onSaveCriteriaValidation(isCriteriaValidated);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1300] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#531325] via-[#691C32] to-[#791c38] px-5 py-4 text-white flex items-center justify-between border-b-4 border-[#BC955B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-amber-300/30">
              <Scale className="w-5 h-5 text-[#BC955B]" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider bg-rose-950/70 px-2 py-0.5 rounded text-amber-200">
                METODOLOGÍA DE EVALUACIÓN DE RIESGOS
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-serif leading-tight">
                Criterios Objetivos de Semaforización Municipal
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

        {/* Notice of Proposal & Subject to Validation */}
        <div className="bg-amber-50 p-4 border-b border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Estatuto de Transparencia y Validación:</strong>
            <p className="mt-0.5 text-amber-900 leading-relaxed">
              De acuerdo con las directrices de Protección Civil, este semáforo no sustituye declaratorias federales ni inventa clasificaciones no avaladas. Propone una matriz objetiva y medible basada en evidencias físicas de campo (incomunicación, afectación a vidas, puentes, escuelas y servicios), sujeta a revisión continua del usuario analista.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Level Switcher Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {OFFICIAL_SEMAFORO_RULES.map(rule => {
              const isSelected = selectedRule === rule.nivel;
              const badge = ruleBadgeColors[rule.nivel];

              return (
                <button
                  key={rule.id}
                  onClick={() => setSelectedRule(rule.nivel)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-[#691C32] ring-2 ring-[#691C32]/30 shadow-sm bg-white' 
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      rule.nivel === 'rojo' ? 'bg-red-600' :
                      rule.nivel === 'naranja' ? 'bg-orange-500' :
                      rule.nivel === 'amarillo' ? 'bg-yellow-500' :
                      rule.nivel === 'verde' ? 'bg-emerald-600' : 'bg-slate-400'
                    }`} />
                    <span className="font-bold text-xs text-slate-800 capitalize">
                      {rule.nivel}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 line-clamp-1 block">
                    {rule.nombre.split(' - ')[1]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Rule Detail Card */}
          <div className={`p-4 rounded-xl border ${ruleBadgeColors[currentRule.nivel].border} ${ruleBadgeColors[currentRule.nivel].bg} space-y-3`}>
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {currentRule.nombre}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {currentRule.descripcion}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-black uppercase ${ruleBadgeColors[currentRule.nivel].text} bg-white border ${ruleBadgeColors[currentRule.nivel].border}`}>
                Nivel {currentRule.nivel}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-800 block mb-1.5">
                Criterios Objetivos Desencadenantes:
              </span>
              <ul className="space-y-1.5">
                {currentRule.criterios.map((c, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-white/70 p-2 rounded border border-slate-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 p-2 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Marco de Referencia</span>
                <p className="text-slate-700 text-[11px] mt-0.5">{currentRule.baseLegal}</p>
              </div>
              <div className="bg-white/80 p-2 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Instancia de Validación Sugerida</span>
                <p className="text-slate-700 text-[11px] mt-0.5 font-semibold">{currentRule.validadorSugerido}</p>
              </div>
            </div>
          </div>

          {/* Validation Checkbox for User Agreement */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="validate-criteria"
              checked={isCriteriaValidated}
              onChange={(e) => setIsCriteriaValidated(e.target.checked)}
              className="mt-0.5 rounded text-[#691C32] focus:ring-[#691C32]"
            />
            <label htmlFor="validate-criteria" className="text-xs text-slate-700 cursor-pointer">
              <strong className="block text-slate-800 font-semibold">Validación Operativa por la Mesa de Situación:</strong>
              Doy fe de que los criterios arriba descritos reflejan de manera objetiva la criticidad operativa y autorizo su aplicación algorítmica para la semaforización de los 84 municipios de Hidalgo.
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">Subsecretaría de Protección Civil y Gestión de Riesgos</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={handleValidate}
              className="px-4 py-1.5 bg-[#691C32] hover:bg-[#501526] text-white font-bold rounded cursor-pointer transition-colors"
            >
              Confirmar y Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
