const lang_default = 'ru';

export function getLang(req) {
    const clientAcceptLang = req.headers['accept-language']?.split(',')[0].split('-')[0];
    const lang = req.cookies.lang ?? clientAcceptLang;

    if (lang === 'en' || lang === 'ru') {
        return lang;
    } else {
        return lang_default;
    }
}