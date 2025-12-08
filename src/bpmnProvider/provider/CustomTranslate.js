import Translations from "@/bpmnProvider/translations/translations.js";

let currentLanguage = 'en';

export default function CustomTranslateProvider(template, replacements) {
    if (currentLanguage === 'en') {
        return template;
    }

    const languagePack = Translations[currentLanguage] || Translations.en;
    const translation = languagePack[template] || template;

    return replacements
        ? translation.replace(/{([^}]+)}/g, (_, key) => replacements[key] || `{${key}}`)
        : translation;
}

export function setLanguage(language) {
    currentLanguage = language;
}