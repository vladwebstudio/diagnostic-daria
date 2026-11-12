import { config, type Currency } from "../config";
import Photo from "./Photo";

interface Props {
  currency: Currency;
  onCurrency: (c: Currency) => void;
}

export default function Header({ currency, onCurrency }: Props) {
  const { expert } = config;
  const currencies: Currency[] = ["USD", "UAH", "EUR"];

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          <Photo
            src={expert.photo}
            alt={expert.name}
            initials={expert.initials}
            className="h-9 w-9 rounded-full bg-white object-top text-xs ring-1 ring-line"
          />
          <span className="font-display text-xl font-semibold leading-none tracking-tight">{expert.name}</span>
        </div>

        <div className="flex rounded-full bg-white p-0.5 ring-1 ring-line">
          {currencies.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCurrency(c)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                currency === c ? "bg-ink text-white" : "text-slate-500 hover:text-ink"
              }`}
            >
              {config.symbols[c]} {config.currencyLabels[c]}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
