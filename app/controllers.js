import fetch from 'node-fetch'
import config from 'config'
import {classes, roles, dungeons_info, battlegrounds_info, globalization, teralogs_provider} from './data.js'

const lang_default = 'ru'
function changeLang(req) {
    let clientAcceptLang = req.headers['accept-language']?.split(',')[0].split('-')[0]
    let lang = req.cookies.lang ?? clientAcceptLang

    if (lang === 'en') {
        return 'en'
    } else if (lang === 'ru') {
        return 'ru'
    } else {
        return lang_default
    }
}

export async function dungeons(req, res) {
    const lang = changeLang(req)

    const response = await fetch(config.get('dungeons'));
    if (!response)
        return res.type('txt').send('error')

    const responseOnline = await fetch(config.get('online'));
    let onlineCount = responseOnline && (await responseOnline.json())?.length || null;

    res.render('dungeons', {
        data: await response.json(),
        dungeons_info: dungeons_info[lang],
        strings: globalization[lang],
        classes: classes[lang],
        roles,
        lang,
        online: onlineCount
    })
}

export async function battlegrounds(req, res) {
    const lang = changeLang(req)

    const response = await fetch(config.get('battlegrounds'));
    if (!response)
        return res.type('txt').send('error')

    const responseOnline = await fetch(config.get('online'));
    let onlineCount = responseOnline && (await responseOnline.json())?.length || null;

    res.render('battlegrounds', {
        data: await response.json(),
        battlegrounds_info: battlegrounds_info[lang],
        strings: globalization[lang],
        classes: classes[lang],
        roles,
        lang,
        online: onlineCount
    })
}

export async function online(req, res) {
    const lang = changeLang(req)

    const response = await fetch(config.get('online'));
    if (!response)
        return res.type('txt').send('error')

    let respJson = await response.json();
    res.render('online', {
        data: respJson,
        strings: globalization[lang],
        classes: classes[lang],
        roles,
        lang,
        online: respJson?.length || null,
        teralogs_url: teralogs_provider
    })
}

export async function stats(req, res) {
    const lang = changeLang(req)

    const response = await fetch(config.get('online'));
    if (!response)
        return res.type('txt').send('error')

    let respJson = await response.json();
    res.render('stats', {
        data: respJson,
        strings: globalization[lang],
        classes: classes[lang],
        roles,
        lang,
        online: respJson?.length || null
    })
}