import { useState } from "react";
import { config, type Currency } from "../config";
import { STEP, fromDisplay, group, snap, toDisplay } from "../lib/money";

interface Props {
  label: string;
  tone: "rose" | "mint";
  usd: number;
  maxUsd: number;
  currency: Currency;
  onChange: (usd: number) => void;
}

const tones = {
  rose: { c: "#e11d48", halo: "rgba(225,29,72,.18)", track: "#fecdd3", box: "border-rose-200 bg-rose-50 text-rose-600" },
  mint: { c: "#16a34a", halo: "rgba(22,163,74,.18)", track: "#bbf7d0", box: "border-emerald-200 bg-emerald-50 text-emerald-600" },
};

export default function MoneySlider({ label, tone, usd, maxUsd, currency, onChange }: Props) {
  const t = tones[tone];
  const max = toDisplay(maxUsd, currency);
  const value = toDisplay(usd, currency);
  const pct = Math.min(100, (value / max) * 100);
  const sym = config.symbols[currency];
  const [focused, setFocused] = useState(false);

  const set = (display: number) => {
    const v = Math.max(0, Math.min(max, Math.round(display) || 0));
    onChange(fromDisplay(v, currency));
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-[11px] font-semibold tracking-[0.14em] text-slate-600">{label}</label>
        <div className={`flex w-[126px] items-center rounded-xl border px-3 py-1 font-mono text-sm font-bold ${t.box}`}>
          <span>{sym}</span>
          <input
            inputMode="numeric"
            value={group(value)}
            onFocus={(e) => {
              setFocused(true);
              e.currentTarget.select();
            }}
            onChange={(e) => set(Number(e.target.value.replace(/\D/g, "")))}
            onBlur={() => {
              setFocused(false);
              set(snap(value)); // при вводе вручную округляем до шага
            }}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className={`w-full bg-transparent text-right outline-none ${focused ? "" : "cursor-pointer"}`}
            aria-label={label}
          />
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={STEP}
        value={snap(value)}
        onChange={(e) => set(Number(e.target.value))}
        className="slider"
        aria-label={`${label}, ползунок`}
        style={{ "--c": t.c, "--halo": t.halo, "--track": t.track, "--p": `${pct}%` } as React.CSSProperties}
      />
      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-slate-500">
        <span>{sym}0</span>
        <span>
          {sym}
          {group(max)}
        </span>
      </div>
    </div>
  );
}
