import Header from "./components/Header";
import Hero from "./components/Hero";
import ProfileForm from "./components/ProfileForm";
import LiveAnalysis from "./components/LiveAnalysis";
import { useLocalStorage } from "./lib/useLocalStorage";
import { fromDisplay, snap, toDisplay } from "./lib/money";
import { initialState, type ClientState } from "./lib/types";
import type { Currency } from "./config";

export default function App() {
  const [state, setState, clear] = useLocalStorage<ClientState>("diagnostic-card:daria:v1", initialState);
  const update = (patch: Partial<ClientState>) => setState((s) => ({ ...s, ...patch }));

  // При смене валюты суммы подгоняем под шаг 50 в новой валюте
  const changeCurrency = (cur: Currency) => {
    const fit = (usd: number) => fromDisplay(snap(toDisplay(usd, cur)), cur);
    update({ currency: cur, incomeA: fit(state.incomeA), incomeB: fit(state.incomeB) });
  };

  // «Очистити»: стираем данные и остаёмся на месте (без прыжка наверх)
  const onClear = () => {
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <Header currency={state.currency} onCurrency={changeCurrency} />

      <main className="mx-auto max-w-[1440px] space-y-4 px-4 py-4 sm:px-6">
        <Hero />

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(340px,0.8fr)_minmax(0,1.2fr)]">
          <ProfileForm state={state} update={update} />
          <LiveAnalysis state={state} update={update} />
        </div>

        <div className="flex justify-center py-6">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClear}
            className="rounded-full border border-line bg-white px-6 py-2 text-sm font-medium text-slate-500 transition hover:border-rose-300 hover:text-rose-600"
          >
            Очистити
          </button>
        </div>
      </main>
    </div>
  );
}
