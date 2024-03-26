let disableToggle = true;
function isToggleEnabled() {
    return !disableToggle;
}

// to not handle 'toggle' on default open attribute
window.addEventListener('load', () => disableToggle = false);

document.addEventListener('DOMContentLoaded', function() {
    const dungeonList = document.getElementById('dungeon-list');
    const searchNameInput = document.getElementById('searchName');
    const searchMinLevelInput = document.getElementById('searchMinLevel');
    const searchMinItemLevelInput = document.getElementById('searchMinItemLevel');
    const sortSelect = document.getElementById('sort');
    const toggleLangButton = document.getElementById('toggleLang');
    const toggleDetailsButton = document.getElementById('toggleDetails');
    const clearNavigationButton = document.getElementById('clearNavigation');
    const autoupdateCheckbox = document.getElementById('autoupdateCheck');
    const saveCollapsedCheckbox = document.getElementById('saveCollapsed');
    const mergeSupportCheckbox = document.getElementById('mergeSupportMatching');
    const searchInputs = [searchNameInput, searchMinLevelInput, searchMinItemLevelInput];
    const checkboxes = [autoupdateCheckbox, saveCollapsedCheckbox, mergeSupportCheckbox];

    const defaultSelectIndex = 2;
    const saveCollapsedId = 'detailsCollapsed';
    const suppDungeon = supportDungeonProps; // From html body

    let dungeons = Array.from(dungeonList.getElementsByClassName('dungeon-details'));
    let dungeonsOld;

    // functions
    function filterDungeons(_, save = true) {
        save && searchInputs.forEach(e => saveData(e, e.value));

        let searchNameVal = searchNameInput.value.toLowerCase();
        let searchMinLevelVal = searchMinLevelInput.value;
        let searchMinItemLevelVal = searchMinItemLevelInput.value;

        dungeons.forEach(d => {
            let name = d.getElementsByClassName('dungeon-name')[0].textContent;
            let minLevel = parseInt(d.getElementsByClassName('dungeon-lvl')[0].textContent);
            let minItemLevel = parseInt(d.getElementsByClassName('dungeon-ilvl')[0].textContent);

            let show = name.toLowerCase().includes(searchNameVal) &&
                checkLevel(minLevel, searchMinLevelVal) &&
                checkLevel(minItemLevel, searchMinItemLevelVal);

            d.style.display = show ? '' : 'none';
        });
    }

    function sortDungeons(_, save = true) {
        save && saveData(sortSelect, sortSelect.selectedIndex);

        let sortVal = sortSelect.value;
        dungeons.sort((a, b) => {
            let minLevelA = parseInt(a.getElementsByClassName('dungeon-lvl')[0].textContent);
            let minLevelB = parseInt(b.getElementsByClassName('dungeon-lvl')[0].textContent);
            let minItemLevelA = parseInt(a.getElementsByClassName('dungeon-ilvl')[0].textContent);
            let minItemLevelB = parseInt(b.getElementsByClassName('dungeon-ilvl')[0].textContent);
            let nameA = a.getElementsByClassName('dungeon-name')[0].textContent;
            let nameB = b.getElementsByClassName('dungeon-name')[0].textContent;
            let playersA = a.getElementsByClassName('party-detailed-content').length;
            let playersB = b.getElementsByClassName('party-detailed-content').length;

            switch(sortVal) {
                case 'minLevelDesc':
                    return minLevelB - minLevelA;
                case 'minLevelAsc':
                    return minLevelA - minLevelB;
                case 'minItemLevelDesc':
                    return minItemLevelB - minItemLevelA;
                case 'minItemLevelAsc':
                    return minItemLevelA - minItemLevelB;
                case 'nameDesc':
                    return nameB.localeCompare(nameA);
                case 'nameAsc':
                    return nameA.localeCompare(nameB);
                case 'playersDesc':
                    return playersB - playersA;
                case 'playersAsc':
                    return playersA - playersB;
            }
        });
        dungeons.forEach(d => dungeonList.appendChild(d));
    }

    function saveDetailsCollapsed(_, save = true) {
        save && saveData(saveCollapsedCheckbox, saveCollapsedCheckbox.checked);

        if (saveCollapsedCheckbox.checked) {
            if (dungeons.every(d => !d.open)) {
                saveData(saveCollapsedId, 'all');
            }
            else if (dungeons.every(d => d.open)) {
                saveData(saveCollapsedId, null);
            }
            else {
                let ids = dungeons.filter(d => !d.open).map(d => d.getAttribute('id')).join(',')
                saveData(saveCollapsedId, ids);
            }
            saveData(toggleDetailsButton, toggleDetailsButton.value);
        }
        else {
            saveData(saveCollapsedId, null);
            saveData(toggleDetailsButton, null);
        }
    }

    function mergeSupportMatching(_, save = true) {
        save && saveData(mergeSupportCheckbox, mergeSupportCheckbox.checked);

        if (dungeonsOld != undefined) {
            let tempArr = dungeons;
            dungeons = dungeonsOld;
            dungeonsOld = tempArr;

            dungeonsOld.forEach(d => dungeonList.removeChild(d));
            dungeons.forEach(d => dungeonList.appendChild(d));
        }
        else if (mergeSupportCheckbox.checked) {
            let lowDungeon = dungeons.find(d => d.querySelector('.dungeon-lvl').innerText == suppDungeon.lowestDungeonLevel);
            if (lowDungeon == null)
                return false;

            let partyDetails = Array.from(lowDungeon.getElementsByClassName('party-details'));
            let supporters = partyDetails.filter(pd => pd.querySelector('.party-detailed-content.level65'));
            if (supporters.length === 0)
                return false;

            let supportersRoles = [];
            supporters.forEach(s => {
                let summaries = Array.from(s.getElementsByClassName('party-summary'));
                summaries.forEach(ps => ps.innerText.split('|').forEach(player => {
                    let role = player.trim().split(' ')[0];
                    supportersRoles.push(role);
                }));
            });

            let supportDungeons = dungeons.filter(d => d.querySelector('.dungeon-lvl').innerText < suppDungeon.minLevel &&
                d.querySelector('.party-detailed-content.level65') != null);

            supportDungeons.forEach(function(sup) {
                dungeonList.removeChild(sup);
                let newNode = sup.cloneNode(true);
                let parties = Array.from(newNode.getElementsByClassName('party-details'));
                if (supporters.length === parties.length)
                    return;

                let roles = Array.from(newNode.getElementsByClassName('dungeon-role'));
                supportersRoles.forEach(sr => {
                    roles.forEach(r => {
                        if (r.innerText.includes(sr)) {
                            let newCount = parseInt(r.innerText) - 1;
                            r.innerText = newCount + sr;
                        }
                    });
                });

                parties.filter(p => p.querySelector('.party-detailed-content.level65') != null).forEach(p => newNode.removeChild(p));
                newNode.addEventListener('toggle', dungeonDetailsToggleHandler);
                dungeonList.appendChild(newNode);
            });

            let newElem = lowDungeon.cloneNode(true);
            newElem.setAttribute('id', '9999');
            newElem.querySelector('.dungeon-lvl').innerText = suppDungeon.minLevel;
            newElem.querySelector('.dungeon-ilvl').innerText = suppDungeon.minItemLevel;
            newElem.querySelector('.dungeon-name').innerText = suppDungeon.name;

            let parties = Array.from(newElem.getElementsByClassName('party-details'));
            if (supporters.length !== parties.length) {
                let roles = Array.from(newElem.getElementsByClassName('dungeon-role'));
                roles.forEach(r => {
                    let index = parseInt(r.innerText).toString().length;
                    r.innerText = 0 + r.innerText.slice(index);
                });

                supportersRoles.forEach(sr => {
                    roles.forEach(r => {
                        if (r.innerText.includes(sr)) {
                            let newCount = parseInt(r.innerText) + 1;
                            r.innerText = newCount + sr;
                        }
                    });
                });

                parties.filter(p => p.querySelector('.party-detailed-content.level65') == null).forEach(p => { newElem.removeChild(p) });
            }
            newElem.addEventListener('toggle', dungeonDetailsToggleHandler);
            dungeonList.appendChild(newElem);

            dungeonsOld = dungeons;
            dungeons = Array.from(dungeonList.getElementsByClassName('dungeon-details'));
        }
        else {
            return false;
        }

        save && saveDetailsCollapsed(null, false);
        sortDungeons(null, false);
        filterDungeons(null, false);
        return true;
    }

    function dungeonDetailsToggleHandler() {
        if (isToggleEnabled())
            saveDetailsCollapsed(null, false);
    }

    // register event handlers
    sortSelect.addEventListener('change', sortDungeons);
    searchNameInput.addEventListener('input', filterDungeons);
    searchMinLevelInput.addEventListener('input', filterDungeons);
    searchMinItemLevelInput.addEventListener('input', filterDungeons);
    dungeons.forEach(d => d.addEventListener('toggle', dungeonDetailsToggleHandler));
    autoupdateCheckbox.addEventListener('change', setAutoupdate);
    saveCollapsedCheckbox.addEventListener('change', saveDetailsCollapsed);
    mergeSupportCheckbox.addEventListener('change', mergeSupportMatching);

    clearNavigationButton.addEventListener('click', function() {
        searchInputs.forEach(e => e.value = '');
        sortSelect.selectedIndex = defaultSelectIndex;
        // autoupdateCheckbox.checked = false;
        // saveCollapsedCheckbox.checked = false;
        // mergeSupportCheckbox.checked = false;
        // toggleDetailsButton.value = true;
        
        // disableToggle = true;
        // dungeons.filter(d => !d.open).forEach(d => d.open = true);
        // disableToggle = false;

        sortDungeons(null, true);
        filterDungeons(null, true);
    });

    toggleDetailsButton.addEventListener('click', function() {
        let isOpen = this.value === 'true';
        this.value = !isOpen;
        if (saveCollapsedCheckbox.checked)
            saveData(this, this.value);

        disableToggle = true;
        dungeons.forEach(d => d.open = !isOpen);
        disableToggle = false;
        saveDetailsCollapsed(null, false);
    });

    toggleLangButton.addEventListener('click', function() {
        let lang = this.value === 'ru' ? 'en' : 'ru';
        this.value = lang;

        let date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        document.cookie = `lang=${lang};expires=${date.toUTCString()};path=/;`;
        location.reload();
    });

    // restore session data
    searchInputs.forEach(e => e.value = loadData(e) ?? e.value);
    checkboxes.forEach(e => {
        let checked = loadData(e);
        if (checked != null)
            e.checked = checked === 'true';
    });
    sortSelect.selectedIndex = loadData(sortSelect) ?? sortSelect.selectedIndex;
    toggleDetailsButton.value = loadData(toggleDetailsButton) ?? toggleDetailsButton.value;

    if (!mergeSupportMatching(null, false)) {
        sortDungeons(null, false);
        filterDungeons(null, false);
    }
    setAutoupdate(null, false, autoupdateCheckbox);

    let saveCollapsedVal = loadData(saveCollapsedId);
    if (saveCollapsedVal === 'all') {
        dungeons.forEach(d => d.open = false);
    }
    else if (saveCollapsedVal != null) {
        saveCollapsedVal.split(',').forEach(id => {
            let d = document.getElementById(id);
            if (d != null)
                d.open = false;
        });
        saveDetailsCollapsed(null, false);
    }
});