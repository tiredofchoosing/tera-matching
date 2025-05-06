import fetch from 'node-fetch'
import config from 'config'
import {classes, roles, dungeons_info, battlegrounds_info, globalization, teralogs_provider} from './data.js'

const lang_default = 'ru';
function changeLang(req) {
    let clientAcceptLang = req.headers['accept-language']?.split(',')[0].split('-')[0];
    let lang = req.cookies.lang ?? clientAcceptLang;

    if (lang === 'en') {
        return 'en';
    } else if (lang === 'ru') {
        return 'ru';
    } else {
        return lang_default;
    }
}

function render(res, data, page, partialContent) {
    if (partialContent) {
        res.render('partial_content', data);
    } else {
        res.render(page, data);
    }
}

export async function dungeons(req, res, partialContent = false) {
    const lang = changeLang(req);
    const page = 'dungeons';

    const response = await fetch(config.get(page));
    if (!response)
        return res.type('txt').send('error');

    const responseOnline = await fetch(config.get('online'));
    let onlineCount = responseOnline && (await responseOnline.json())?.length || null;

    const data = {
        data: await response.json(),
        instances_info: dungeons_info[lang],
        strings: globalization[lang],
        classes: classes[lang],
        roles,
        lang,
        online: onlineCount,
        page
    };

    render(res, data, page, partialContent);
}

export async function battlegrounds(req, res, partialContent = false) {
    const lang = changeLang(req);
    const page = 'battlegrounds';

    const response = await fetch(config.get(page));
    if (!response)
        return res.type('txt').send('error');

    const responseOnline = await fetch(config.get('online'));
    let onlineCount = responseOnline && (await responseOnline.json())?.length || null;

    const data = {
        data: await response.json(),
        instances_info: battlegrounds_info[lang],
        strings: globalization[lang],
        classes: classes[lang],
        roles,
        lang,
        online: onlineCount,
        page
    };

    render(res, data, page, partialContent);
}

export async function online(req, res, partialContent = false) {
    const lang = changeLang(req);
    const page = 'online';

    const response = await fetch(config.get(page));
    if (!response)
        return res.type('txt').send('error');

    let respJson = await response.json();
    const data = {
        data: respJson,
        strings: globalization[lang],
        classes: classes[lang],
        roles,
        lang,
        online: respJson?.length || null,
        teralogs_url: teralogs_provider,
        page
    };
    render(res, data, page, partialContent);
}

export async function lfg(req, res, partialContent = false) {
    const lang = changeLang(req);
    const page = 'lfg';

    const response = await fetch(config.get(page));
    if (!response)
        return res.type('txt').send('error');

    const responseOnline = await fetch(config.get('online'));
    let onlineCount = responseOnline && (await responseOnline.json())?.length || null;

    const data = {
        data: await response.json(),
        strings: globalization[lang],
        classes: classes[lang],
        lang,
        online: onlineCount,
        page
    };

    render(res, data, page, partialContent);
}