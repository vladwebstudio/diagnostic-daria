import type { ReactNode } from "react";

interface Props {
  title: string;
  goal: string;
  children: ReactNode;
}

/** Общая оболочка блока диагностики: номер, заголовок, цель. */
export default function Section({ title, goal, children }: Props) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-line sm:p-7">
      <header className="mb-5">
        <div>
          <h2 className="[font-variant-numeric:lining-nums] font-display text-2xl font-semibold leading-tight tracking-tight sm:text-[28px]">{title}</h2>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-500">{goal}</p>
        </div>
      </header>
      {children}
    </section>
  );
}
