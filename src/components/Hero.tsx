import { config } from "../config";
import Photo from "./Photo";

export default function Hero() {
  const { hero, expert } = config;
  return (
    <section className="relative flex items-center overflow-hidden rounded-3xl bg-white p-6 shadow-card ring-1 ring-line md:px-20 md:py-6 md:min-h-[28rem]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-amber-100 via-rose-50 to-transparent blur-2xl"
      />
      <div className="relative grid w-full items-center gap-8 md:grid-cols-[1fr_auto] lg:gap-14">
        <div>
          <span className="inline-block rounded-full border border-ink/80 px-4 py-1.5 text-xs font-semibold tracking-[0.22em]">
            {hero.badge}
          </span>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl xl:text-[3.6rem]">
            {hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-500 xl:text-lg">{hero.text}</p>
        </div>

        <div className="aspect-[4/5] h-80 justify-self-center overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-line md:h-[26rem]">
          <Photo
            src={expert.photo}
            alt={expert.name}
            initials={expert.initials}
            className="h-full w-full object-cover object-top font-display text-6xl"
          />
        </div>
      </div>
    </section>
  );
}
