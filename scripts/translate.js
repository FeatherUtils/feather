import config from './config.js';
import modules from './Modules/modules.js';
import translations from './translations.js';

export function translate(id, lang = modules.get('language')) {
    const langTranslations = translations[lang];
    
    if(!langTranslations[id]) {
        return translations['en'][id] ?? id
    }
    return langTranslations[id]
}