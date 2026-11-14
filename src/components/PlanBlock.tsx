import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { config } from "../config";
import type { ClientState, PlanStep } from "../lib/types";
import Section from "./Section";
import GrowNote from "./GrowNote";

interface Props {
  state: ClientState;
  update: (patch: Partial<ClientState>) => void;
}

/** Колір етапів: спокійний сіро-синій. */
const BLUE = "#a88a66"; // один колір для всіх етапів: тепле коричневе з палітри сайту
const BLUE_SOFT = "#cdb89c";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const monthName = new Intl.DateTimeFormat("uk-UA", { month: "long" });
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const genitive = new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long" });

/** «11 – 17 січня» або «28 січня – 3 лютого» */
function rangeLabel(from: string, to: string) {
  const a = parse(from);
  const b = parse(to);
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()} – ${genitive.format(b)}`;
  }
  return `${genitive.format(a)} – ${genitive.format(b)}`;
}

/** Поле етапу: переноситься на нові рядки й росте вниз. */
function StepText({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block min-w-0 flex-1 resize-none overflow-hidden rounded-2xl border border-line bg-canvas px-4 py-1.5 text-sm leading-6 outline-none transition focus:border-[#cdb89c] focus:bg-white"
    />
  );
}

const weekdays = ["пн", "вт", "ср", "чт", "пт", "сб", "нд"];

export default function PlanBlock({ state, update }: Props) {
  const { title, goal, commentLabel } = config.plan;
  const steps: PlanStep[] = state.steps ?? [];

  const today = new Date();
  const todayIso = iso(today.getFullYear(), today.getMonth(), today.getDate());
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [start, setStart] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setStart(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sorted = useMemo(() => [...steps].sort((a, b) => a.from.localeCompare(b.from)), [steps]);
  const setSteps = (next: PlanStep[]) => update({ steps: next });

  const stepAt = (d: string) => [...steps].reverse().find((s) => s.from <= d && d <= s.to);

  const pick = (d: string) => {
    if (!start) {
      const hit = stepAt(d);
      if (hit) {
        setActive(hit.id);
        return;
      }
      setStart(d);
      return;
    }
    if (d === start) {
      setStart(null); // одна дата — нічого не створюємо
      return;
    }
    const [from, to] = d < start ? [d, start] : [start, d];
    const id = Math.random().toString(36).slice(2, 9);
    setSteps([...steps, { id, from, to, text: "", c: 0 }]);
    setActive(id);
    setStart(null);
    setHover(null);
    setTimeout(() => document.querySelector<HTMLTextAreaElement>(`[data-step="${id}"] textarea`)?.focus(), 60);
  };

  const shift = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  const days = new Date(view.y, view.m + 1, 0).getDate();
  const lead = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  const preview = start && hover && hover !== start ? (hover < start ? [hover, start] : [start, hover]) : null;

  return (
    <Section title={title} goal={goal}>
      <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        {/* Календар */}
        <div className="rounded-3xl border border-line bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shift(-1)}
              aria-label="Попередній місяць"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-slate-600 transition hover:bg-canvas"
            >
              ‹
            </button>
            <div className="font-display text-xl font-semibold text-ink [font-variant-numeric:lining-nums]">
              {cap(monthName.format(new Date(view.y, view.m, 1)))} {view.y}
            </div>
            <button
              type="button"
              onClick={() => shift(1)}
              aria-label="Наступний місяць"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-slate-600 transition hover:bg-canvas"
            >
              ›
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {weekdays.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1" onMouseLeave={() => setHover(null)}>
            {cells.map((d, i) => {
              if (d === null) return <span key={`e${i}`} />;
              const id = iso(view.y, view.m, d);
              const st = stepAt(id);
              const isActive = !!st && st.id === active;
              const isStart = id === start;
              const inPreview = !!preview && preview[0] <= id && id <= preview[1];
              const col = i % 7;
              const isFrom = !!st && st.from === id;
              const isTo = !!st && st.to === id;
              const edge = isFrom || isTo;
              // смуга діапазону: суцільна, з округленням на краях етапу, тижня та місяця
              const band = st ? (isActive ? `${BLUE}2e` : `${BLUE}1a`) : inPreview ? "#f3ece2" : "transparent";
              const pFrom = !!preview && preview[0] === id;
              const pTo = !!preview && preview[1] === id;
              const rl = ((st ? isFrom : pFrom) || col === 0 || d === 1) && (st || inPreview) ? "rounded-l-full" : "";
              const rr = ((st ? isTo : pTo) || col === 6 || d === days) && (st || inPreview) ? "rounded-r-full" : "";
              const dot: React.CSSProperties = isStart
                ? { background: BLUE, color: "#fff" }
                : edge
                  ? { background: isActive ? BLUE : BLUE_SOFT, color: "#fff" }
                  : {};
              return (
                <div key={id} style={{ background: band }} className={`${rl} ${rr}`}>
                  <button
                    type="button"
                    onClick={() => pick(id)}
                    onMouseEnter={() => setHover(id)}
                    style={dot}
                    className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm outline-none transition ${
                      edge || isStart ? "font-semibold" : st || inPreview ? "font-medium text-slate-800" : id < todayIso ? "text-slate-300 hover:bg-canvas" : "text-slate-700 hover:bg-canvas"
                    } ${id === todayIso && !edge && !isStart ? "ring-1 ring-slate-300" : ""}`}
                  >
                    {d}
                  </button>
                </div>
              );
            })}
          </div>

          {start && (
            <button
              type="button"
              onClick={() => setStart(null)}
              className="mt-3 w-full rounded-full border border-[#cdb89c] bg-white px-4 py-1.5 text-xs font-semibold text-[#5a4632] transition hover:bg-[#f3ece2]"
            >
              Скасувати вибір
            </button>
          )}
        </div>

        {/* Етапи */}
        <div className="space-y-2.5">
          {sorted.length === 0 && (
            <div className="flex min-h-[8rem] items-center justify-center rounded-3xl border border-dashed border-[#cdb89c] bg-white/60 px-5 py-10 text-center text-sm text-[#5a4632]">
              {start ? "Оберіть дату завершення" : "Оберіть дату"}
            </div>
          )}
          {sorted.map((s) => {
            const col = BLUE;
            const on = s.id === active;
            return (
              <article
                key={s.id}
                data-step={s.id}
                onClick={() => {
                  setActive(s.id);
                  const d = parse(s.from);
                  setView({ y: d.getFullYear(), m: d.getMonth() });
                }}
                style={on ? { borderColor: col, boxShadow: `0 8px 24px -16px ${col}` } : undefined}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-white px-4 py-2.5 transition"
              >
                <span className="flex h-9 w-52 shrink-0 items-center gap-2 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: col }} />
                  {rangeLabel(s.from, s.to)}
                </span>
                <StepText
                  value={s.text}
                  onChange={(v) => setSteps(steps.map((x) => (x.id === s.id ? { ...x, text: v } : x)))}
                />
                <button
                  type="button"
                  aria-label="Видалити етап"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSteps(steps.filter((x) => x.id !== s.id));
                    if (active === s.id) setActive(null);
                  }}
                  className="mt-1.5 text-lg leading-none text-slate-300 transition hover:text-rose"
                >
                  ×
                </button>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{commentLabel}</div>
        <GrowNote value={state.texts.plan ?? ""} onChange={(v) => update({ texts: { ...state.texts, plan: v } })} />
      </div>
    </Section>
  );
}
