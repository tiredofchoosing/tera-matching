import str_ru from './data/strings_ru.json' with { type: 'json' }
import str_en from './data/strings_en.json' with { type: 'json' }
import onlineTestData from './data/test_data/online.json' with { type: 'json' }
import dungeonsTestData from './data/test_data/dungeons.json' with { type: 'json' }
import battlegroundsTestData from './data/test_data/battlegrounds.json' with { type: 'json' }
import lfgTestData from './data/test_data/lfg.json' with { type: 'json' }

export const globalization = { ru: str_ru, en: str_en }

export const classes = {
    ru: ['Воин', 'Рыцарь', 'Убийца', 'Берсерк', 'Маг', 'Лучник', 'Жрец', 'Мистик', 'Жнец', 'Инженер', 'Крушитель', 'Шиноби', 'Валькирия'],
    en: ['Warrior', 'Lancer', 'Slayer', 'Berserk', 'Sorcerer', 'Archer', 'Priest', 'Mystic', 'Reaper', 'Gunner', 'Brawler', 'Ninja', 'Valkyrie']
}
export const roles = ['tank', 'dmg', 'heal']
export const teralogs_provider = 'https://teralogs.com/asura/search/'
export const testData = {
    online: onlineTestData,
    dungeons: dungeonsTestData,
    battlegrounds: battlegroundsTestData,
    lfg: lfgTestData
}
