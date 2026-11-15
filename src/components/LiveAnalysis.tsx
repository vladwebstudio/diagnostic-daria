import { useLayoutEffect, useRef } from "react";
import { config } from "../config";
import type { ClientState } from "../lib/types";

interface Props {
  state: ClientState;
  update: (patch: Partial<ClientState>) => void;
  /** Какие карточки показать (по key) */
  keys: string[];
  /** Растянуть на высоту соседней колонки */
  fill?: boolean;
  /** Заголовок блока (как у «В якому стані ви зараз?») */
  title?: string;
  /** Карточки одна под другой на всю ширину */
  stack?: boolean;
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
      rows={4}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="mt-3 block min-h-[7.5rem] w-full resize-none overflow-hidden rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm leading-relaxed outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-ink focus:bg-white"
    />
  );
}

export default function LiveAnalysis({ state, update, keys, fill, title, stack }: Props) {
  return (
    <section className={`rounded-3xl bg-white p-5 shadow-card ring-1 ring-line ${title ? "sm:p-7" : "sm:p-6"}`}>
      {title && (
        <h2 className="mb-5 [font-variant-numeric:lining-nums] font-display text-2xl font-semibold leading-tight tracking-tight sm:text-[1.75rem]">{title}</h2>
      )}
      <div className={fill ? "flex flex-col" : stack ? "grid gap-3" : "grid gap-3 lg:grid-cols-2"}>
        {keys.map((k) => config.cards.find((x) => x.key === k)!).map((c, i) => {
          const t = tones[c.tone];
          const note = (
            <Note
              placeholder={c.placeholder}
              value={state.notes[c.key] ?? ""}
              onChange={(v) => update({ notes: { ...state.notes, [c.key]: v } })}
            />
          );
          // Одна карточка: вопросы разделены тонкой линией, без рамок в рамках
          if (fill) {
            return (
              <div key={c.key}>
                {i > 0 && <hr className="my-5 border-line" />}
                <h3 className="text-base font-semibold text-ink">{c.title}</h3>
                <p className="mt-0.5 text-[0.8125rem] leading-snug text-slate-500">{c.question}</p>
                {note}
              </div>
            );
          }
          return (
            <article key={c.key} className={`rounded-2xl border border-l-[3px] border-line bg-white p-4 ${t.bar}`}>
              <h3 className={`text-sm font-semibold ${t.title}`}>{c.title}</h3>
              <p className="mt-0.5 text-[0.8125rem] leading-snug text-slate-500">{c.question}</p>
              {note}
            </article>
          );
        })}
      </div>
    </section>
  );
}
