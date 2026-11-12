import { useLayoutEffect, useRef } from "react";
import { config } from "../config";
import type { ClientState } from "../lib/types";

interface Props {
  state: ClientState;
  update: (patch: Partial<ClientState>) => void;
}

const tones = {
  plain: { bar: "border-l-slate-300", title: "text-ink" },
  rose: { bar: "border-l-rose", title: "text-rose" },
  ink: { bar: "border-l-ink", title: "text-ink" },
  mint: { bar: "border-l-mint", title: "text-mint" },
} as const;

/** Поле, которое растёт вместе с текстом: без внутреннего скролла. */
function Note({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Пересчёт высоты не должен сдвигать прокрутку страницы
    const y = window.scrollY;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    if (window.scrollY !== y) window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={3}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="mt-3 block w-full resize-none overflow-hidden rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm leading-relaxed outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-ink focus:bg-white"
    />
  );
}

export default function LiveAnalysis({ state, update }: Props) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-line sm:p-6">
      <div className="space-y-3">
        {config.cards.map((c) => {
          const t = tones[c.tone];
          return (
            <article key={c.key} className={`rounded-2xl border border-l-[3px] border-line bg-white p-4 ${t.bar}`}>
              <h3 className={`text-sm font-semibold ${t.title}`}>{c.title}</h3>
              <p className="mt-0.5 text-[13px] leading-snug text-slate-500">{c.question}</p>
              <Note
                placeholder={c.placeholder}
                value={state.notes[c.key] ?? ""}
                onChange={(v) => update({ notes: { ...state.notes, [c.key]: v } })}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
