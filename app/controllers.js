import fetch from 'node-fetch';
import config from 'config';
import crypto from 'crypto';
import {classes, roles, dungeons_info, battlegrounds_info, globalization, teralogs_provider} from './data.js';
import {testData} from './data.js';

const useTestData = false;
const lang_default = 'ru';

function changeLang(req) {
    const clientAcceptLang = req.headers['accept-language']?.split(',')[0].split('-')[0];
    const lang = req.cookies.lang ?? clientAcceptLang;

    if (lang === 'en') {
        return 'en';
    } else if (lang === 'ru') {
        return 'ru';
    } else {
        return lang_default;
    }
}

function generateETag(data) {
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

function isResponceModified(req, res, viewData) {
    const eTag = generateETag(viewData);
    res.setHeader('ETag', eTag);

    if (req.headers['if-none-match'] === eTag) {
        res.status(304).send();
        return false;
    }
    return true;
}

async function fetchMany(res, pages) {
    try {
        const data = {};
        if (useTestData) {
            pages.forEach(p => data[p] = testData[p]);
            return data;
        }

        await Promise.all(pages.map(async (page) => {
            const addr = config.get(page)
            const response = await fetch(addr);
            if (!response || !response.ok)
                throw `API request failed for '${addr}' with status: ${response?.status}`;

            data[page] = await response.json();
        }));

        return data;
    }
    catch (error) {
        console.error('Error while fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
        return null;
    }
}

function render(res, viewData, page, partialContent) {
    if (partialContent) {
        res.render('partial_content', viewData);
    } else {
        res.render(page, viewData);
    }
}

export async function dungeons(req, res, partialContent = false) {
    const lang = changeLang(req);
    const page = 'dungeons';

    const data = await fetchMany(res, [page, 'online']);
    if (!data) return;

    const viewData = {
        data: data[page],
        instances_info: dungeons_info[lang],
        strings: globalization[lang],
        classes: classes[lang],
        roles,
        lang,
        online: data.online?.length,
        teralogs_url: teralogs_provider,
        page
    };

    if (isResponceModified(req, res, viewData)) {
        render(res, viewData, page, partialContent);
    }
}

export async function battlegrounds(req, res, partialContent = false) {
    const lang = changeLang(req);
    const page = 'battlegrounds';

    const data = await fetchMany(res, [page, 'online']);
    if (!data) return;

    const viewData = {
        data: data[page],
        instances_info: battlegrounds_info[lang],
        strings: globalization[lang],
        classes: classes[lang],
        roles,
        lang,
        online: data.online?.length,
        teralogs_url: teralogs_provider,
        page
    };

    if (isResponceModified(req, res, viewData)) {
        render(res, viewData, page, partialContent);
    }
}

export async function online(req, res, partialContent = false) {
    const lang = changeLang(req);
    const page = 'online';

    const data = await fetchMany(res, [page]);
    if (!data) return;

    const viewData = {
        data: data[page],
        strings: globalization[lang],
        classes: classes[lang],
        lang,
        online: data.online?.length,
        teralogs_url: teralogs_provider,
        page
    };

    if (isResponceModified(req, res, viewData)) {
        render(res, viewData, page, partialContent);
    }
}

export async function lfg(req, res, partialContent = false) {
    const lang = changeLang(req);
    const page = 'lfg';

    const data = await fetchMany(res, [page, 'online']);
    if (!data) return;

    for (const key in data[page]) {
        if (data[page][key].hasOwnProperty('messages')) {
            data[page][key].messages.forEach(msg => {
                const player = data.online.find(p => p.playerId === msg.leaderId);
                msg.player = player;
            });
        }
    }

    const viewData = {
        data: data[page],
        strings: globalization[lang],
        classes: classes[lang],
        lang,
        online: data.online?.length,
        teralogs_url: teralogs_provider,
        page
    };

    if (isResponceModified(req, res, viewData)) {
        render(res, viewData, page, partialContent);
    }
}

export async function stats(req, res, partialContent = false) {
    const lang = changeLang(req);
    const page = 'stats';

    const data = await fetchMany(res, ['online']);
    if (!data) return;

    const viewData = {
        data: data.online,
        strings: globalization[lang],
        classes: classes[lang],
        lang,
        online: data.online?.length,
        page
    };

    if (isResponceModified(req, res, viewData)) {
        render(res, viewData, page, partialContent);
    }
}