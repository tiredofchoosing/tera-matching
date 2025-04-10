import dg_ru from './data/DungeonsInfo_ru.json' with { type: 'json' }
import dg_en from './data/DungeonsInfo_en.json' with { type: 'json' }
import bg_ru from './data/BattlegroundsInfo_ru.json' with { type: 'json' }
import bg_en from './data/BattlegroundsInfo_en.json' with { type: 'json' }
import str_ru from './data/strings_ru.json' with { type: 'json' }
import str_en from './data/strings_en.json' with { type: 'json' }

export const dungeons_info = { ru: dg_ru, en: dg_en }
export const battlegrounds_info = { ru: bg_ru, en: bg_en }
export const globalization = { ru: str_ru, en: str_en }

export const classes = {
    ru: ['Воин', 'Рыцарь', 'Убийца', 'Берсерк', 'Маг', 'Лучник', 'Жрец', 'Мистик', 'Жнец', 'Инженер', 'Крушитель', 'Шиноби', 'Валькирия'],
    en: ['Warrior', 'Lancer', 'Slayer', 'Berserk', 'Sorcerer', 'Archer', 'Priest', 'Mystic', 'Reaper', 'Gunner', 'Brawler', 'Ninja', 'Valkyrie']
}
export const roles = ['tank', 'dmg', 'heal']
export const teralogs_provider = 'https://teralogs.com/asura/search/'