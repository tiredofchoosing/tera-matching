import dg_ru from './../static/json/DungeonsInfo_ru.json' assert { type: 'json' }
import dg_en from './../static/json/DungeonsInfo_en.json' assert { type: 'json' }
import bg_ru from './../static/json/BattlegroundsInfo_ru.json' assert { type: 'json' }
import bg_en from './../static/json/BattlegroundsInfo_en.json' assert { type: 'json' }
import str_ru from './../static/json/strings_ru.json' assert { type: 'json' }
import str_en from './../static/json/strings_en.json' assert { type: 'json' }

export const dungeons_info = { ru: dg_ru, en: dg_en }
export const battlegrounds_info = { ru: bg_ru, en: bg_en }
export const globalization = { ru: str_ru, en: str_en }

export const classes = {
    ru: ['Воин', 'Рыцарь', 'Убийца', 'Берсерк', 'Маг', 'Лучник', 'Жрец', 'Мистик', 'Жнец', 'Инженер', 'Крушитель', 'Шиноби', 'Валькирия'],
    en: ['Warrior', 'Lancer', 'Slayer', 'Berserk', 'Sorcerer', 'Archer', 'Priest', 'Mystic', 'Reaper', 'Gunner', 'Brawler', 'Ninja', 'Valkyrie']
}
export const roles = ['tank', 'dmg', 'heal']