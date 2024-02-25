import fetch from 'node-fetch'
import config from 'config'
import {classes, roles, dungeons_info, battlegrounds_info, globalization} from './data.js'

const lang_default = 'ru'
function changeLang(req) {
    let clientAcceptLang = req.headers['accept-language']?.split(',')[0].split('-')[0]
    let cookieLang = req.headers.cookie?.split(';').find(c => c.startsWith('lang='))?.split('=')[1]
    let lang = cookieLang ?? clientAcceptLang

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

    res.render('dungeons', {
        data: await response.json(),
        dungeons_info: dungeons_info[lang],
        strings: globalization[lang],
        classes: classes[lang],
        roles,
        lang
    })
}

export async function battlegrounds(req, res) {
    const lang = changeLang(req)

    const response = await fetch(config.get('battlegrounds'));
    if (!response)
        return res.type('txt').send('error')

    res.render('battlegrounds', {
        data: await response.json(),
        battlegrounds_info: battlegrounds_info[lang],
        strings: globalization[lang],
        classes: classes[lang],
        roles,
        lang
    })
}