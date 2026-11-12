import { config } from "../config";
import type { ClientState } from "../lib/types";
import { formatMoney } from "../lib/money";
import MoneySlider from "./MoneySlider";
import Segmented from "./Segmented";
import Select from "./Select";

interface Props {
  state: ClientState;
  update: (patch: Partial<ClientState>) => void;
}

const label = "mb-2 block text-[11px] font-semibold tracking-[0.14em] text-slate-500";
const input =
  "w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-ink focus:bg-white";

export default function ProfileForm({ state, update }: Props) {
  const { intro } = config;
  const diff = Math.max(0, state.incomeB - state.incomeA);
  const perMonth = diff / Math.max(1, state.termMonths);
  const multiplier = state.incomeA > 0 ? state.incomeB / state.incomeA : null;

  return (
    <section className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-line sm:p-6">
      <div className="space-y-5">
        <div>
          <label className={label} htmlFor="client-name">{intro.nameLabel}</label>
          <input
            id="client-name"
            className={input}
            placeholder={intro.namePlaceholder}
            value={state.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </div>

        <div>
          <label className={label} htmlFor="profession">{intro.professionLabel}</label>
          <Select
            id="profession"
            value={state.profession}
            options={config.professions}
            placeholder={intro.professionPlaceholder}
            onChange={(profession) => update({ profession })}
          />
        </div>

        <hr className="border-line" />

        <MoneySlider
          label={intro.incomeALabel}
          tone="rose"
          usd={state.incomeA}
          maxUsd={config.limits.incomeA}
          currency={state.currency}
          onChange={(incomeA) => update({ incomeA })}
        />
        <MoneySlider
          label={intro.incomeBLabel}
          tone="mint"
          usd={state.incomeB}
          maxUsd={config.limits.incomeB}
          currency={state.currency}
          onChange={(incomeB) => update({ incomeB })}
        />

        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold tracking-[0.14em] text-slate-500">{intro.growthLabel}</div>
            <div className="mt-0.5 font-mono">
              <span className="text-xl font-bold text-emerald-600">
                {formatMoney(perMonth, state.currency, { sign: true })}
              </span>
              <span className="ml-1.5 text-xs text-slate-500">{state.termMonths ? "/міс" : "всього"}</span>
            </div>
          </div>
          <span className="rounded-lg border border-emerald-300 bg-emerald-100 px-2.5 py-1 font-mono text-xs font-bold text-emerald-700">
            {multiplier ? `x${multiplier.toFixed(1)}` : "x—"}
          </span>
        </div>

        <div>
          <span className={label}>{intro.timeLabel}</span>
          <Segmented
            options={intro.terms.map((t) => ({ label: t.label, value: t.months }))}
            value={state.termMonths || ""}
            onChange={(termMonths) => update({ termMonths })}
          />
        </div>

        <hr className="border-line" />

        <div>
          <span className={label}>{config.employmentLabel}</span>
          <div className="space-y-1.5">
            {config.employment.map((e) => {
              const active = state.employment === e;
              return (
                <button
                  key={e}
                  type="button"
                  onClick={() => update({ employment: e })}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition ${
                    active ? "border-ink bg-ink text-white" : "border-line bg-canvas text-slate-700 hover:bg-white"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${active ? "bg-emerald-400" : "bg-slate-300"}`} />
                  {e}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
