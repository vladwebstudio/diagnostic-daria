import { config } from "../config";
import type { ClientState, ToolMark } from "../lib/types";
import Section from "./Section";
import GrowNote from "./GrowNote";

interface Props {
  state: ClientState;
  update: (patch: Partial<ClientState>) => void;
}

const marks: Record<ToolMark, { label: string; dot: string; glow: string; on: string; chip: string }> = {
  urgent: { label: "Спершу", dot: "bg-emerald-500", glow: "0 12px 30px -14px rgba(22,163,74,.40)", on: "border-emerald-300 bg-emerald-50 text-emerald-900", chip: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  important: { label: "Важливо", dot: "bg-amber-400", glow: "0 12px 30px -14px rgba(249,115,22,.38)", on: "border-amber-300 bg-amber-50 text-amber-900", chip: "border-amber-200 bg-amber-50 text-amber-900" },
  later: { label: "Потім", dot: "bg-sky-400", glow: "0 12px 30px -14px rgba(14,165,233,.35)", on: "border-sky-300 bg-sky-50 text-sky-900", chip: "border-sky-200 bg-sky-50 text-sky-900" },
};
const order = Object.keys(marks) as ToolMark[];

export default function ToolsBlock({ state, update }: Props) {
  const { title, goal, groups, commentLabel, maxFirst } = config.tools;

  // Приоритет хранится по направлению (ключ = номер группы)
  const markOf = (gi: number) => state.tools[String(gi)];
  const countOf = (m: ToolMark) => groups.filter((_, gi) => markOf(gi) === m).length;
  const firstFull = countOf("urgent") >= maxFirst;

  const setMark = (gi: number, m: ToolMark) => {
    const tools = { ...state.tools };
    if (tools[String(gi)] === m) delete tools[String(gi)];
    else tools[String(gi)] = m;
    update({ tools });
  };

  return (
    <Section title={title} goal={goal}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {groups.map((g, gi) => {
          const cur = markOf(gi);
          return (
            <article
              key={g.title}
              className="flex flex-col rounded-2xl border border-line bg-white p-4 transition-all duration-300"
              style={cur ? { boxShadow: marks[cur].glow } : undefined}
            >
              <h3 className="font-display text-xl font-semibold leading-tight tracking-tight">{g.title}</h3>
              <ul className="mt-3 divide-y divide-line/70 text-[13px] leading-snug text-slate-600">
                {g.items.map((it) => (
                  <li key={it} className="py-1.5">
                    {it}
                  </li>
                ))}
              </ul>

              <div className="mt-auto grid grid-cols-3 gap-1.5 pt-4">
                {order.map((m) => {
                  const active = cur === m;
                  const blocked = m === "urgent" && firstFull && !active;
                  return (
                    <button
                      key={m}
                      type="button"
                      disabled={blocked}
                      onClick={() => setMark(gi, m)}
                      title={blocked ? `Першочергових може бути не більше ${maxFirst}` : undefined}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border px-1 py-1.5 text-[11.5px] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-[#d9c9b3] ${
                        active ? marks[m].on : "border-transparent bg-canvas text-slate-500 hover:border-line hover:bg-white"
                      } ${blocked ? "cursor-not-allowed opacity-40" : ""}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${marks[m].dot}`} />
                      {marks[m].label}
                    </button>
                  );
                })}
              </div>

            </article>
          );
        })}
      </div>

      <div className="mt-5 divide-y divide-line rounded-2xl bg-canvas px-4 ring-1 ring-line">
        {order.map((m) => (
          <div key={m} className="grid items-center gap-x-4 gap-y-1.5 py-3 sm:grid-cols-[11rem_1fr]">
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
              <span className={`h-2.5 w-2.5 rounded-full ${marks[m].dot}`} />
              {marks[m].label}
              {m === "urgent" && (
                <span className="font-mono normal-case tracking-normal text-slate-400">
                  (до {maxFirst})
                </span>
              )}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {groups.map((g, gi) =>
                markOf(gi) === m ? (
                  <span key={g.title} className={`rounded-full border px-3 py-1 text-[13px] font-medium ${marks[m].chip}`}>
                    {g.title}
                  </span>
                ) : null,
              )}
              {countOf(m) === 0 && <span className="text-[13px] text-slate-300">—</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{commentLabel}</div>
        <GrowNote value={state.texts.tools ?? ""} onChange={(v) => update({ texts: { ...state.texts, tools: v } })} />
      </div>
    </Section>
  );
}
