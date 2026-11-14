import { useEffect, useRef } from "react";
import { config } from "../config";

export default function CasesModal({ onClose }: { onClose: () => void }) {
  const { title, empty, items } = config.cases;
  // Закриваємо лише коли і натискання, і відпускання були на фоні (виділення тексту, що вийшло за межі вікна, не закриває його)
  const downOnBackdrop = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    // Смуга прокрутки зникає при блокуванні скролу: компенсуємо її ширину, щоб фон не смикався
    const bar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (bar > 0) document.body.style.paddingRight = `${bar}px`;
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPad;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        downOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (downOnBackdrop.current && e.target === e.currentTarget) onClose();
        downOnBackdrop.current = false;
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-line bg-canvas p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,.45)] sm:p-8"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-3xl font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-slate-500 transition hover:text-ink"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cdb89c] px-5 py-14 text-center text-sm text-[#5a4632]">{empty}</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((c, i) => (
              <article key={i} className="rounded-2xl border border-line bg-white p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{c.niche}</div>
                <h3 className="mt-1 font-display text-xl font-semibold">{c.title}</h3>
                <div className="mt-2 inline-block rounded-full bg-[#f3ece2] px-3 py-1 text-xs font-semibold text-[#5a4632]">{c.result}</div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{c.text}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
