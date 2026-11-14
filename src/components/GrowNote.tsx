import { useLayoutEffect, useRef } from "react";

/** Textarea, растущая вместе с текстом. */
export default function GrowNote({
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const y = window.scrollY;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    if (window.scrollY !== y) window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full resize-none overflow-hidden rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm leading-relaxed outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-ink focus:bg-white"
    />
  );
}
