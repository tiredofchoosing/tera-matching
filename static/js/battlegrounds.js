(function() {

    const searchNameInput = document.getElementById('searchBattlegroundName');
    const searchMinLevelInput = document.getElementById('searchBattlegroundLevel');
    const sortSelect = document.getElementById('selectBattlegroundSort');
    const toggleDetailsButton = document.getElementById('toggleDetails');
    const clearNavigationButton = document.getElementById('clearNavigation');
    const clearEmptyButton = document.getElementById('clearEmptyButton');
    const saveCollapsedCheckbox = document.getElementById('saveCollapsed');
    const hideLevelCheckbox = document.getElementById('hideLevel');
    const content = document.getElementById('content');
    const searchInputs = [searchNameInput, searchMinLevelInput];
    const checkboxes = [saveCollapsedCheckbox, hideLevelCheckbox];

    const defaultSelectIndex = 4;
    const saveCollapsedId = 'battlegroundDetailsCollapsed';

    let dungeonList, emptyContainer, dungeons, parties;
    initVariables();

    let collapsedElements = [];
    let collapseAll = false;
    let openedParties = [];

    // functions
    function initVariables() {
        dungeonList = document.getElementById('dungeonList');
        emptyContainer = document.getElementById('empty');
        dungeons = Array.from(dungeonList.getElementsByClassName('dungeon-details'));
        parties = Array.from(dungeonList.getElementsByClassName('party-details'));
    }

    function filterDungeons(_, save = true) {
        save && searchInputs.forEach(e => saveData(e, e.value));

        const searchNameVal = searchNameInput.value.customSplitFilter(',');
        const searchMinLevelVal = searchMinLevelInput.value.customSplitFilter(',');

        let any = false;
        dungeons.forEach(d => {
            const name = d.getElementsByClassName('dungeon-name')[0].textContent.toLowerCase();
            const minLevel = parseInt(d.getElementsByClassName('dungeon-lvl')[0].textContent);

            const show = searchNameVal.customSomeFilter(s => name.includes(s)) &&
                searchMinLevelVal.customSomeFilter(s => checkLevel(minLevel, s));

            d.style.display = show ? '' : 'none';
            any ||= show;
        });
        checkIfEmpty(!any);
    }

    function sortDungeons(_, save = true) {
        save && saveData(sortSelect, sortSelect.selectedIndex);

        const sortVal = sortSelect.value;
        dungeons.sort((a, b) => {
            const minLevelA = parseInt(a.getElementsByClassName('dungeon-lvl')[0].textContent);
            const minLevelB = parseInt(b.getElementsByClassName('dungeon-lvl')[0].textContent);
            const nameA = a.getElementsByClassName('dungeon-name')[0].textContent;
            const nameB = b.getElementsByClassName('dungeon-name')[0].textContent;
            const playersA = a.getElementsByClassName('party-player-detailed-content').length;
            const playersB = b.getElementsByClassName('party-player-detailed-content').length;

            switch (sortVal) {
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

    function dungeonDetailsClickHandler() {
        const detail = this.parentElement;
        const dungeonId = detail.id;
        const index = collapsedElements.indexOf(dungeonId);
        const opened = !detail.open; // click before toggle
        if (!opened && index === -1) {
            collapsedElements.push(dungeonId);
        }
        else if (opened && index !== -1) {
            collapsedElements.splice(index, 1);
        }
        collapseAll = false;
        saveDetailsCollapsed();
    }

    function saveDetailsCollapsed(_, save = true) {
        save && saveData(saveCollapsedCheckbox, saveCollapsedCheckbox.checked, false);

        if (saveCollapsedCheckbox.checked) {
            const value = collapseAll && 'all' || collapsedElements.join(',');
            saveData(saveCollapsedId, value);
            saveData(toggleDetailsButton, toggleDetailsButton.dataset.value);
        }
        else {
            saveData(saveCollapsedId, null);
            saveData(toggleDetailsButton, null);
        }
    }

    function toggleAllDungeons() {
        const isOpen = this.dataset.value === 'true';
        this.dataset.value = !isOpen;
        collapseAll = isOpen;

        collapsedElements = [];
        dungeons.forEach(d => {
            d.open = !collapseAll;
            if (collapseAll) {
                collapsedElements.push(d.id);
            }
        });

        if (saveCollapsedCheckbox.checked) {
            saveDetailsCollapsed(null, false);
        }
    }

    function partyDetailsToggleHandler() {
        const partyId = this.dataset.partyId;
        const index = openedParties.indexOf(partyId);
        if (this.open && index === -1) {
            openedParties.push(partyId);
        }
        else if (!this.open && index !== -1) {
            openedParties.splice(index, 1);
        }
    }

    function checkIfEmpty(isEmpty) {
        if (dungeonList.children.length === 0)
            return;

        emptyContainer.hidden = !isEmpty;
        emptyContainer.querySelector('#initialEmpty').hidden = isEmpty;
        emptyContainer.querySelector('#filteredEmpty').hidden = !isEmpty;
    }

    function hideLevel(_, save = true) {
        save && saveData(hideLevelCheckbox, hideLevelCheckbox.checked, false);

        hideLevelLabels(hideLevelCheckbox.checked);
    }

    function hideLevelLabels(flag, isItemLevel = false) {
        const className = isItemLevel ? 'dungeon-ilvl' : 'dungeon-lvl';
        const labels = dungeonList.getElementsByClassName(className);
        for (const lbl of labels) {
            lbl.hidden = flag;
        }
    }

    function clearFilters() {
        searchInputs.forEach(e => e.value = '');
        sortDungeons(null, true);
        filterDungeons(null, true);
    }

    function refresh() {
        initVariables();
        loadState();

        dungeons.forEach(d => d.querySelector('.dungeon-summary').addEventListener('click', dungeonDetailsClickHandler));
        parties.forEach(p => p.addEventListener('toggle', partyDetailsToggleHandler));
    }

    function loadState() {
        sortDungeons(null, false);
        filterDungeons(null, false);

        if (collapseAll) {
            collapsedElements = dungeons.map(d => d.id);
        }
        else {
            collapsedElements = collapsedElements.filter(e => dungeons.some(d => d.id === e));
        }
        dungeons.forEach(d => d.open = collapsedElements.indexOf(d.id) === -1);
        saveDetailsCollapsed(null, false);

        hideLevel(null, false);
        parties.forEach(p => p.open = openedParties.indexOf(p.dataset.partyId) !== -1);
        openedParties = openedParties.filter(o => parties.some(p => p.dataset.partyId === o));
    }

    // register event handlers
    sortSelect.addEventListener('change', sortDungeons);
    searchNameInput.addEventListener('input', filterDungeons);
    searchMinLevelInput.addEventListener('input', filterDungeons);
    dungeons.forEach(d => d.querySelector('.dungeon-summary').addEventListener('click', dungeonDetailsClickHandler));
    parties.forEach(p => p.addEventListener('toggle', partyDetailsToggleHandler));
    saveCollapsedCheckbox.addEventListener('change', saveDetailsCollapsed);
    hideLevelCheckbox.addEventListener('change', hideLevel);
    content.addEventListener('contentUpdated', refresh);
    toggleDetailsButton.addEventListener('click', toggleAllDungeons);

    clearEmptyButton.addEventListener('click', clearFilters);
    clearNavigationButton.addEventListener('click', function() {
        sortSelect.selectedIndex = defaultSelectIndex;
        clearFilters();
    });

    // restore session data
    searchInputs.forEach(e => e.value = loadData(e) ?? e.value);
    checkboxes.forEach(e => {
        const checked = loadData(e, false);
        if (checked != null)
            e.checked = checked === 'true';
    });
    sortSelect.selectedIndex = loadData(sortSelect) ?? sortSelect.selectedIndex;
    toggleDetailsButton.dataset.value = loadData(toggleDetailsButton) ?? toggleDetailsButton.dataset.value;

    const collapsed = loadData(saveCollapsedId);
    if (collapsed === 'all') {
        collapseAll = true;
    }
    else {
        collapsedElements = collapsed?.split(',') ?? [];
    }

    loadState();

})();