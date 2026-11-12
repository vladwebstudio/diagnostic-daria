import { useEffect, useRef, useState } from "react";

interface Props {
  id?: string;
  value: string;
  options: readonly string[];
  placeholder: string;
  onChange: (v: string) => void;
}

/** Выпадающий список в стиле карточки (вместо системного select). */
export default function Select({ id, value, options, placeholder, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-xl border bg-canvas px-3.5 py-2.5 text-left text-sm outline-none transition ${
          open ? "border-ink bg-white" : "border-line hover:border-slate-300"
        }`}
      >
        <span className={value ? "text-ink" : "text-slate-400"}>{value || placeholder}</span>
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="animate-pop absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-[0_16px_40px_rgba(15,23,42,.14)]"
        >
          {options.map((o) => {
            const active = o === value;
            return (
              <li key={o} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                    active ? "bg-ink text-white" : "text-slate-700 hover:bg-canvas"
                  }`}
                >
                  {o}
                  {active && (
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.5 10.5l3.5 3.5 7.5-8" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
