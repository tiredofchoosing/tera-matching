import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dynamicData = {
    dungeons_info: { ru: {}, en: {} },
    battlegrounds_info: { ru: {}, en: {} }
};

function getSeparateLangInstInfo(source, lang) {
    const target = {};

    Object.entries(source).forEach(([id, inst]) => {
        target[id] = {
            ...inst,
            name: inst.name[lang],
            shortName: inst.shortName?.[lang]
        }
    });

    return target;
}

function getRawData(filePath) {
    let content = fs.readFileSync(path.join(__dirname, filePath)).toString('utf8');
    // remove BOM if exists
    return content.replace(/^\uFEFF/, '');
}

function updateInstanceData(isUpdate = true) {
    try {
        const dgInfoData = JSON.parse(getRawData('data/DungeonsInfo.json'));
        const bgInfoData = JSON.parse(getRawData('data/BattlegroundsInfo.json'));
        const dgShortData = JSON.parse(getRawData('data/DungeonsInfoShort.json'));

        for (var dg in dgInfoData) {
            if (dgShortData.hasOwnProperty(dg)) {
                dgInfoData[dg] = Object.assign(dgInfoData[dg], dgShortData[dg]);
            }
        }

        dynamicData.dungeons_info = {
            ru: getSeparateLangInstInfo(dgInfoData, 'ru'),
            en: getSeparateLangInstInfo(dgInfoData, 'en')
        };

        dynamicData.battlegrounds_info = {
            ru: getSeparateLangInstInfo(bgInfoData, 'ru'),
            en: getSeparateLangInstInfo(bgInfoData, 'en')
        };

        if (isUpdate) {
            console.log('Instance data updated at:', new Date().toISOString());
        }
    }
    catch (error) {
        console.error('Error updating instance data:', error);
    }
}

updateInstanceData(false);

let updateTimeout;
const watchPaths = [
    path.join(__dirname, 'data/DungeonsInfo.json'),
    path.join(__dirname, 'data/BattlegroundsInfo.json'),
    path.join(__dirname, 'data/DungeonsInfoShort.json')
];

watchPaths.forEach(filepath => {
    fs.watch(filepath, (eventType) => {
        if (eventType === 'change') {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(updateInstanceData, 2000);
        }
    });
});


export const getDungeonsInfo = () => dynamicData.dungeons_info;
export const getBattlegroundsInfo = () => dynamicData.battlegrounds_info;
