import fetch from 'node-fetch'
import config from 'config'
import {classes, roles} from './data.js'
import dungeonsInfo from './../static/json/DungeonsInfo.json' assert { type: 'json' }
import battlegroundsInfo from './../static/json/BattlegroundsInfo.json' assert { type: 'json' }

const lang = 'ru'
export async function dungeons(req, res) {
    const response = await fetch(config.get('dungeons'));
    if (!response)
        return res.type('txt').send('error')

    res.render('dungeons', {
        data: await response.json(),
        dungeonsInfo,
        classes,
        roles,
        lang
    })
}

export async function battlegrounds(req, res) {
    const response = await fetch(config.get('battlegrounds'));
    if (!response)
        return res.type('txt').send('error')

    res.render('battlegrounds', {
        data: await response.json(),
        battlegroundsInfo,
        classes,
        roles,
        lang
    })
}