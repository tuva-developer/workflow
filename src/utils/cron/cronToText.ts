import cronstrue from "cronstrue/i18n";
import vi, { CronLocaleFns } from "./locales/vi";

type CronLocalesHost = { locales?: Record<string, CronLocaleFns> };
const host = cronstrue as unknown as CronLocalesHost;
host.locales = host.locales ?? {};
host.locales.vi = host.locales.vi ?? vi;

type CronToTextLang = "vi" | "en" | "both";

type CronToTextOptions = {
  lang?: CronToTextLang;
  separator?: string;
  use24HourTimeFormat?: boolean;
  fallback?: { vi: string; en: string };
};

function isInvalidText(s: string) {
  return /không hợp lệ|invalid|error/i.test(s);
}

export function cronToText(
  cron: string,
  {
    lang = "both",
    separator = " — ",
    use24HourTimeFormat = false,
    fallback = { vi: "Biểu thức cron không hợp lệ", en: "Invalid cron expression" },
  }: CronToTextOptions = {}
): string {
  if (!cron?.trim()) {
    return lang === "both"
      ? `${fallback.en}${separator}${fallback.vi}`
      : lang === "en"
      ? fallback.en
      : fallback.vi;
  }

  const opts = {
    use24HourTimeFormat,
    throwExceptionOnParseError: false,
  } as const;

  try {
    const viText = cronstrue.toString(cron, {
      ...opts,
      locale: "vi",
    });

    const enText = cronstrue.toString(cron, {
      ...opts,
      locale: "en",
    });

    const viOk = !isInvalidText(viText);
    const enOk = !isInvalidText(enText);

    if (lang === "vi") return viOk ? viText : fallback.vi;
    if (lang === "en") return enOk ? enText : fallback.en;

    const left = enOk ? enText : fallback.en;
    const right = viOk ? viText : fallback.vi;
    return `${left}${separator}${right}`;
  } catch {
    return lang === "both"
      ? `${fallback.en}${separator}${fallback.vi}`
      : lang === "en"
      ? fallback.en
      : fallback.vi;
  }
}