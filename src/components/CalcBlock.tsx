import { config } from "../config";
import { formatMoney, fromDisplay, group } from "../lib/money";
import type { Calc, ClientState } from "../lib/types";
import Section from "./Section";

interface Props {
  state: ClientState;
  update: (patch: Partial<ClientState>) => void;
}

const labelCls = "mb-1 block text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500";

/** Числовое поле с суффиксом справа */
function Pill({ label, value, onChange, suffix, hint }: { label: string; value: number; onChange: (v: number) => void; suffix: string; hint?: string }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <span className="flex items-center rounded-full border border-[#d9d3ca] bg-white/70 px-3.5 py-1.5 transition focus-within:border-[#a88a66] focus-within:bg-white">
        <input
          type="number"
          min={0}
          value={value === 0 ? "" : value}
          placeholder="0"
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-full bg-transparent font-mono text-sm font-semibold outline-none placeholder:text-slate-400"
        />
        <span className="ml-2 text-xs text-slate-400">{suffix}</span>
      </span>
      {hint && <span className="mt-1 block text-[11px] leading-snug text-slate-400">{hint}</span>}
    </label>
  );
}

/** Считаемое значение (только чтение) */
function Out({ label, value, tone, hint }: { label: string; value: string; tone?: "mint"; hint?: string }) {
  return (
    <div className="rounded-2xl border border-[#d9d3ca] bg-white/70 px-3.5 py-2">
      <span className={labelCls}>{label}</span>
      <div className={`font-mono text-lg font-semibold ${tone === "mint" ? "text-mint" : ""}`}>{value}</div>
      {hint && <div className="text-[11px] text-slate-400">{hint}</div>}
    </div>
  );
}

function PctSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className={`${labelCls} mb-0`}>{label}</span>
        <span className="font-mono text-sm font-bold text-rose">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider slider-bar"
        aria-label={label}
        style={{ "--c": "#e11d48", "--halo": "rgba(225,29,72,.18)", "--track": "#e7e3dd", "--p": `${value}%` } as React.CSSProperties}
      />
    </div>
  );
}

export default function CalcBlock({ state, update }: Props) {
  const { title, goal } = config.calc;
  const c = state.calc;
  const cur = state.currency;
  const sym = config.symbols[cur];
  const set = (patch: Partial<Calc>) => update({ calc: { ...c, ...patch } });
  const money = (key: "salary" | "check" | "budget" | "cpo") => ({
    value: Math.round(c[key] * config.rates[cur] * 100) / 100,
    onChange: (v: number) => set({ [key]: fromDisplay(v, cur) } as Partial<Calc>),
    suffix: sym,
  });

  // Воронка: бюджет → замовлення → підтверджені → викуплені → оборот → прибуток
  const orders = c.cpo > 0 ? c.budget / c.cpo : 0;
  const confirmed = (orders * c.confirm) / 100;
  const bought = (confirmed * c.buyout) / 100;
  const revenue = bought * c.check;
  const cogs = (revenue * c.cogs) / 100;
  const staff = c.employees * c.salary;
  const spend = c.budget + staff;
  const profit = revenue - c.budget - cogs - staff;
  const roi = spend > 0 ? profit / spend : 0; // скільки чистого дає кожен вкладений $1
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const unit = c.check * (1 - c.cogs / 100);
  const needBought = unit > 0 ? spend / unit : 0;
  const n = (v: number) => group(Math.round(v));
  const neg = profit < 0;
  const started = c.budget > 0;

  return (
    <Section title={title} goal={goal}>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,1fr)]">
        <div className="space-y-3.5 rounded-3xl border border-[#d9d3ca] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Pill label="Середній чек (клієнт платить за товар)" {...money("check")} />
            <Pill label="Рекламний бюджет" {...money("budget")} />
            <Pill label="Реальна ціна ліда" {...money("cpo")} />
            <Pill label="Собівартість товару" value={c.cogs} onChange={(v) => set({ cogs: Math.min(100, v) })} suffix="%" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Out label="Всього замовлень з реклами" value={n(orders)} />
            <Out label="Підтверджено замовлень" value={n(confirmed)} />
          </div>

          <PctSlider label="Підтверджено" value={c.confirm} onChange={(v) => set({ confirm: v })} />
          <PctSlider label="Відсоток викупу" value={c.buyout} onChange={(v) => set({ buyout: v })} />

          <div className="grid gap-3 sm:grid-cols-2">
            <Out label="Продажів (викуплено)" value={n(bought)} />
            <Out label="Оборот" value={formatMoney(revenue, cur)} tone="mint" />
          </div>

          <div className="grid gap-3 border-t border-line pt-3.5 sm:grid-cols-2">
            <Pill label="Кількість працівників" value={c.employees} onChange={(v) => set({ employees: Math.round(v) })} suffix="осіб" />
            <Pill label="Зарплата одного / міс." {...money("salary")} />
          </div>
        </div>

        <div className="space-y-3">
          <div className={`rounded-2xl border p-4 ${started && neg ? "border-rose/40 bg-rose-soft" : "border-mint/40 bg-mint-soft"}`}>
            <span className={labelCls}>Чистий заробіток</span>
            <div className={`font-mono text-3xl font-semibold ${started && neg ? "text-rose" : "text-mint"}`}>
              {neg ? "−" : ""}
              {formatMoney(Math.abs(profit), cur)}
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Оборот {formatMoney(revenue, cur)} − бюджет {formatMoney(c.budget, cur)}
              {cogs > 0 ? ` − товар ${formatMoney(cogs, cur)}` : ""}
              {staff > 0 ? ` − команда ${formatMoney(staff, cur)}` : ""}
            </p>
          </div>

          <div className={`rounded-2xl border p-4 ${started && roi < 0 ? "border-rose/40 bg-rose-soft" : started && roi > 0 ? "border-mint/40 bg-mint-soft" : "border-line bg-canvas"}`}>
            <span className={labelCls}>Окупність вкладень</span>
            <div className={`font-mono text-3xl font-semibold ${started && roi < 0 ? "text-rose" : started && roi > 0 ? "text-mint" : "text-slate-400"}`}>
              ×{roi.toFixed(1)}
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Кожен вкладений {sym}1 приносить {sym}
              {roi.toFixed(1)} чистого прибутку
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-canvas px-4 py-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Рентабельність (прибуток з обороту)</span>
              <b className={revenue ? (margin >= 0 ? "text-mint" : "text-rose") : ""}>{margin.toFixed(0)}%</b>
            </div>
            <div className="mt-1.5 flex justify-between">
              <span>Щоб вийти в нуль, треба продати</span>
              <b>{unit > 0 && spend > 0 ? `${n(Math.ceil(needBought))} шт.` : "—"}</b>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
