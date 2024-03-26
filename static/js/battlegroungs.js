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
    const sortSelect = document.getElementById('sort');
    const toggleLangButton = document.getElementById('toggleLang');
    const toggleDetailsButton = document.getElementById('toggleDetails');
    const clearNavigationButton = document.getElementById('clearNavigation');
    const autoupdateCheckbox = document.getElementById('autoupdateCheck');
    const saveCollapsedCheckbox = document.getElementById('saveCollapsed');
    const searchInputs = [searchNameInput, searchMinLevelInput];
    const checkboxes = [autoupdateCheckbox, saveCollapsedCheckbox];

    const defaultSelectIndex = 4;
    const saveCollapsedId = 'detailsCollapsed';

    let dungeons = Array.from(dungeonList.getElementsByClassName('dungeon-details'));

    // functions
    function filterDungeons(_, save = true) {
        save && searchInputs.forEach(e => saveData(e, e.value));

        let searchNameVal = searchNameInput.value.toLowerCase();
        let searchMinLevelVal = searchMinLevelInput.value;

        dungeons.forEach(d => {
            let name = d.getElementsByClassName('dungeon-name')[0].textContent;
            let minLevel = parseInt(d.getElementsByClassName('dungeon-lvl')[0].textContent);

            let show = name.toLowerCase().includes(searchNameVal) &&
                checkLevel(minLevel, searchMinLevelVal);

            d.style.display = show ? '' : 'none';
        });
    }

    function sortDungeons(_, save = true) {
        save && saveData(sortSelect, sortSelect.selectedIndex);

        let sortVal = sortSelect.value;
        dungeons.sort((a, b) => {
            let minLevelA = parseInt(a.getElementsByClassName('dungeon-lvl')[0].textContent);
            let minLevelB = parseInt(b.getElementsByClassName('dungeon-lvl')[0].textContent);
            let nameA = a.getElementsByClassName('dungeon-name')[0].textContent;
            let nameB = b.getElementsByClassName('dungeon-name')[0].textContent;
            let playersA = a.getElementsByClassName('party-detailed-content').length;
            let playersB = b.getElementsByClassName('party-detailed-content').length;

            switch(sortVal) {
                case 'minLevelDesc':
                    return minLevelB - minLevelA;
                case 'minLevelAsc':
                    return minLevelA - minLevelB;
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

    function dungeonDetailsToggleHandler() {
        if (isToggleEnabled())
            saveDetailsCollapsed(null, false);
    }

    // register event handlers
    sortSelect.addEventListener('change', sortDungeons);
    searchNameInput.addEventListener('input', filterDungeons);
    searchMinLevelInput.addEventListener('input', filterDungeons);
    dungeons.forEach(d => d.addEventListener('toggle', dungeonDetailsToggleHandler));
    autoupdateCheckbox.addEventListener('change', setAutoupdate);
    saveCollapsedCheckbox.addEventListener('change', saveDetailsCollapsed);

    clearNavigationButton.addEventListener('click', function() {
        searchInputs.forEach(e => e.value = '');
        sortSelect.selectedIndex = defaultSelectIndex;
        // autoupdateCheckbox.checked = false;
        // saveCollapsedCheckbox.checked = false;
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

    sortDungeons(null, false);
    filterDungeons(null, false);
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