import type { Currency } from "../config";

export interface ClientState {
  name: string;
  profession: string;
  incomeA: number; // в USD
  incomeB: number; // в USD
  termMonths: number;
  employment: string;
  currency: Currency;
  notes: Record<string, string>;
}

/** Пустое состояние: так выглядит карта при первом заходе и после «Очистить». */
export const initialState: ClientState = {
  name: "",
  profession: "",
  incomeA: 0,
  incomeB: 0,
  termMonths: 0,
  employment: "",
  currency: "USD",
  notes: {},
};
