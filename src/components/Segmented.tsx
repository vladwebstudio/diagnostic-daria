interface Props<T extends string | number> {
  options: { label: string; value: T }[];
  value: T | "";
  onChange: (v: T) => void;
}

/** Сегментированный переключатель (0–1 год / 1–3 года / 3+ лет и т.п.). */
export default function Segmented<T extends string | number>({ options, value, onChange }: Props<T>) {
  return (
    <div className="grid grid-flow-col auto-cols-fr gap-1 rounded-xl border border-line bg-canvas p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-2 py-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-[#d9c9b3] ${
            value === o.value ? "bg-white font-semibold text-[#5a4632] shadow-[0_1px_3px_rgba(90,70,50,.14)] ring-1 ring-[#d9c9b3]" : "text-slate-600 hover:bg-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
