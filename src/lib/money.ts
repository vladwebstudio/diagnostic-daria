import { config, type Currency } from "../config";

/** Шаг слайдеров дохода (в выбранной валюте) */
export const STEP = 50;

export const toDisplay = (usd: number, cur: Currency) => Math.round(usd * config.rates[cur]);

export const fromDisplay = (value: number, cur: Currency) => value / config.rates[cur];

/** Округление до ближайшего шага (50, 100, 150...) */
export const snap = (value: number) => Math.round(value / STEP) * STEP;

/** 1500 -> "1,500" */
export const group = (n: number) => n.toLocaleString("en-US");

export function formatMoney(usd: number, cur: Currency, opts?: { sign?: boolean }) {
  return `${opts?.sign ? "+" : ""}${config.symbols[cur]}${group(toDisplay(usd, cur))}`;
}
