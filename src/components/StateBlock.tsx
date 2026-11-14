import { useState } from "react";
import { config } from "../config";
import type { ClientState } from "../lib/types";
import Section from "./Section";
import GrowNote from "./GrowNote";

interface Props {
  state: ClientState;
  update: (patch: Partial<ClientState>) => void;
}

const W = 480;
const H = 410;
const CX = W / 2;
const CY = H / 2;
const R = 150;

const pt = (i: number, n: number, r: number) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const;
};


/** Нежное свечение по уровню: красное (1–2), оранжевое (3), зелёное (4–5) */
const glowOf = (v: number) =>
  v <= 2
    ? { bg: "rgba(244,63,94,.22)", shadow: "0 12px 32px -14px rgba(225,29,72,.45)" }
    : v === 3
      ? { bg: "rgba(249,115,22,.22)", shadow: "0 12px 32px -14px rgba(249,115,22,.45)" }
      : { bg: "rgba(34,197,94,.20)", shadow: "0 12px 32px -14px rgba(22,163,74,.40)" };

function Radar({ values }: { values: number[] }) {
  const dims = config.state.dims;
  const n = dims.length;
  const ring = (l: number) => dims.map((_, i) => pt(i, n, (R * l) / 5).join(",")).join(" ");
  const poly = values.map((v, i) => pt(i, n, (R * v) / 5).join(",")).join(" ");
  const any = values.some((v) => v > 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full overflow-visible" role="img" aria-label="Радар стану">
      <defs>
        <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity=".38" />
          <stop offset="100%" stopColor="#0d9488" stopOpacity=".14" />
        </linearGradient>
        <linearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f3efe9" />
        </radialGradient>
        {[
          ["glowRed", "#f43f5e"],
          ["glowAmber", "#f59e0b"],
          ["glowGreen", "#22c55e"],
        ].map(([id, c]) => (
          <radialGradient key={id} id={id}>
            <stop offset="0%" stopColor={c} stopOpacity=".22" />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </radialGradient>
        ))}
        <filter id="cloudBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
        <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#16a34a" floodOpacity=".28" />
        </filter>
      </defs>

      <polygon points={ring(5)} fill="url(#radarBg)" />
      {/* Лучи-треугольники от края карточки к центру: цвет по уровню, очень нежно */}
      {values.map((v, i) => {
        if (!v) return null;
        const color = v <= 2 ? "#f43f5e" : v === 3 ? "#f59e0b" : "#22c55e";
        const [ax, ay] = pt(i, n, R + 235); // вершина у края
        const [mx, my] = pt(i, n, R + 70); // середина основания
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n + Math.PI / 2;
        const hw = 120; // полуширина основания
        const [bx1, by1] = [mx + hw * Math.cos(a), my + hw * Math.sin(a)];
        const [bx2, by2] = [mx - hw * Math.cos(a), my - hw * Math.sin(a)];
        return (
          <g key={`g${i}`} style={{ transition: "all .3s ease" }}>
            <linearGradient id={`beam${i}`} gradientUnits="userSpaceOnUse" x1={ax} y1={ay} x2={mx} y2={my}>
              <stop offset="0%" stopColor={color} stopOpacity=".26" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
            <polygon points={`${ax},${ay} ${bx1},${by1} ${bx2},${by2}`} fill={`url(#beam${i})`} filter="url(#cloudBlur)" />
          </g>
        );
      })}
      {[1, 2, 3, 4].map((l) => (
        <polygon key={l} points={ring(l)} fill="none" stroke="#e2dcd2" strokeWidth={1} strokeDasharray="2 4" />
      ))}
      <polygon points={ring(5)} fill="none" stroke="#d6cfc4" strokeWidth={1.5} />
      {dims.map((_, i) => {
        const [x, y] = pt(i, n, R);
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="#e2dcd2" strokeDasharray="2 4" />;
      })}
      {[1, 2, 3, 4, 5].map((l) => (
        <text key={l} x={CX + 5} y={CY - (R * l) / 5 + 3} fontSize="8.5" className="fill-slate-400" fontWeight={600}>
          {l}
        </text>
      ))}

      {any && (
        <polygon
          points={poly}
          fill="url(#radarFill)"
          stroke="url(#radarStroke)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          filter="url(#radarGlow)"
          style={{ transition: "all .3s ease" }}
        />
      )}
      {values.map((v, i) => {
        if (!v) return null;
        const [x, y] = pt(i, n, (R * v) / 5);
        return (
          <circle key={i} cx={x} cy={y} r={4.5} fill={v <= 2 ? "#e11d48" : v === 3 ? "#f59e0b" : "#16a34a"} stroke="#fff" strokeWidth={2} />
        );
      })}
      {dims.map((d, i) => {
        const [x, y] = pt(i, n, R + 28);
        const words = d.short.split(" ");
        const mid = Math.ceil(words.length / 2);
        const lines = words.length > 1 ? [words.slice(0, mid).join(" "), words.slice(mid).join(" ")] : [d.short];
        const anchor = Math.abs(x - CX) < 8 ? "middle" : x > CX ? "start" : "end";
        return (
          <text key={d.key} x={x} y={y - (lines.length - 1) * 6} textAnchor={anchor} className="fill-slate-700" fontSize="12.5" fontWeight={600}>
            {lines.map((l, k) => (
              <tspan key={k} x={x} dy={k ? 13 : 0}>
                {l}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

export default function StateBlock({ state, update }: Props) {
  const { dims, title, goal, commentLabel, hints, weakTitle, weakNote, strongTitle } = config.state;
  const [open, setOpen] = useState<string | null>(config.state.dims[0].key);
  const values = dims.map((d) => state.levels[d.key] ?? 0);
  const filled = values.filter(Boolean);
  const avg = filled.length ? filled.reduce((a, b) => a + b, 0) / filled.length : 0;
  const weak = dims.filter((d) => (state.levels[d.key] ?? 0) > 0 && (state.levels[d.key] ?? 0) <= 2);
  const strong = dims.filter((d) => (state.levels[d.key] ?? 0) >= 4);

  // Выбор уровня: сохраняем, закрываем карточку и открываем следующий неотвеченный напрямок
  const pick = (key: string, level: number) => {
    const levels = { ...state.levels, [key]: state.levels[key] === level ? 0 : level };
    update({ levels });
    const next = dims.find((d) => d.key !== key && !(levels[d.key] > 0));
    if (levels[key] && next) setOpen(next.key); // последний пункт: остаёмся на месте, ничего не сворачиваем
  };

  return (
    <Section title={title} goal={goal}>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="space-y-3">
          {dims.map((d) => {
            const cur = state.levels[d.key] ?? 0;
            const isOpen = open === d.key;
            return (
              <article
                key={d.key}
                className={`rounded-2xl border bg-white transition-all duration-300 ${isOpen ? "border-ink/30" : "border-line"}`}
                style={cur ? { boxShadow: glowOf(cur).shadow } : undefined}
              >
                <button type="button" onClick={() => setOpen(isOpen ? null : d.key)} className="flex w-full items-start gap-3 p-4 text-left">
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      cur === 0 ? "bg-canvas text-slate-400 ring-1 ring-line" : cur <= 2 ? "bg-rose text-white" : cur === 3 ? "bg-amber-500 text-white" : "bg-mint text-white"
                    }`}
                  >
                    {cur || "–"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{d.label}</span>
                    {!isOpen && (
                      <span className="mt-1 block text-[13px] leading-relaxed text-slate-500">
                        {cur ? d.levels[cur - 1] : "Натисніть, щоб обрати свій рівень"}
                      </span>
                    )}
                  </span>
                  <span className={`mt-1 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`}>▾</span>
                </button>
                {isOpen && (
                  <div className="space-y-2 px-4 pb-4">
                    {d.levels.map((text, i) => {
                      const l = i + 1;
                      const on = cur === l;
                      return (
                        <button
                          key={l}
                          type="button"
                          onClick={() => pick(d.key, l)}
                          className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-[13px] leading-relaxed transition ${
                            on
                              ? l <= 2
                                ? "border-rose bg-rose-soft text-ink"
                                : l === 3
                                  ? "border-amber-400 bg-amber-50 text-ink"
                                  : "border-mint bg-mint-soft text-ink"
                              : "border-line bg-canvas text-slate-600 hover:border-slate-300 hover:bg-white"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              on ? (l <= 2 ? "bg-rose text-white" : l === 3 ? "bg-amber-500 text-white" : "bg-mint text-white") : "bg-white text-slate-500 ring-1 ring-line"
                            }`}
                          >
                            {l}
                          </span>
                          <span>{text}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-16">
          <div className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-card ring-1 ring-line">
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Карта стану</div>
                <div className="mt-0.5 font-display text-xl font-semibold leading-tight">Ваш профіль зараз</div>
              </div>
              <div className="rounded-2xl bg-canvas px-3.5 py-1.5 text-right ring-1 ring-line">
                <div
                  className={`font-mono text-2xl font-bold leading-none ${!filled.length ? "text-slate-300" : avg <= 2.4 ? "text-rose" : avg < 3.6 ? "text-amber-500" : "text-mint"}`}
                >
                  {filled.length ? avg.toFixed(1) : "–"}
                  <span className="text-xs font-semibold text-slate-400"> /5</span>
                </div>
                <div className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-slate-400">середній рівень</div>
              </div>
            </div>

            <div className="relative -mx-2 mt-1">
              <Radar values={values} />
            </div>

            <div className="relative mt-1 space-y-2.5">
              <div className="h-1.5 overflow-hidden rounded-full bg-canvas">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300" style={{ width: `${(filled.length / dims.length) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Заповнено {filled.length} із {dims.length}
                </span>
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-rose" />1–2</span>
                  <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-amber-500" />3</span>
                  <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-mint" />4–5</span>
                </span>
              </div>
            </div>
          </div>

          {weak.length > 0 && (
            <div className="rounded-2xl bg-gradient-to-b from-amber-50 to-white p-4 ring-1 ring-amber-200/80">
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="font-display text-xl font-semibold text-amber-900">{weakTitle}</h4>
                <span className="text-[11px] text-slate-500">{weakNote}</span>
              </div>
              <ul className="mt-3 space-y-2">
                {weak.map((d) => (
                  <li key={d.key} className="rounded-xl border-l-[3px] border-amber-400 bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,.04)]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold">{d.short}</span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">{state.levels[d.key]}/5</span>
                    </div>
                    <div className="mt-1 text-[12.5px] leading-snug text-slate-500">{hints[d.key].low}</div>
                    <div className="mt-0.5 text-[12.5px] leading-snug text-slate-700">
                      <b className="text-mint">Робимо:</b> {hints[d.key].step}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {strong.length > 0 && (
            <div className="rounded-2xl bg-gradient-to-b from-mint-soft to-white p-4 ring-1 ring-mint/25">
              <h4 className="font-display text-xl font-semibold text-mint">{strongTitle}</h4>
              <ul className="mt-3 space-y-2">
                {strong.map((d) => (
                  <li key={d.key} className="rounded-xl border-l-[3px] border-mint bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,.04)]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold">{d.short}</span>
                      <span className="rounded-full bg-mint-soft px-2 py-0.5 text-[11px] font-bold text-mint">{state.levels[d.key]}/5</span>
                    </div>
                    <div className="mt-1 text-[12.5px] leading-snug text-slate-500">{hints[d.key].high}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <div className="mt-5">
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{commentLabel}</div>
        <GrowNote value={state.texts.state ?? ""} onChange={(v) => update({ texts: { ...state.texts, state: v } })} />
      </div>
    </Section>
  );
}
