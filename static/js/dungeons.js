(function() {

    const searchNameInput = document.getElementById('searchDungeonName');
    const searchMinLevelInput = document.getElementById('searchDungeonLevel');
    const searchMinItemLevelInput = document.getElementById('searchDungeonItemLevel');
    const sortSelect = document.getElementById('selectDungeonSort');
    const rankSelect = document.getElementById('selectDungeonRank');
    const toggleDetailsButton = document.getElementById('toggleDetails');
    const clearNavigationButton = document.getElementById('clearNavigation');
    const clearEmptyButton = document.getElementById('clearEmptyButton');
    const saveCollapsedCheckbox = document.getElementById('saveCollapsed');
    const mergeSupportCheckbox = document.getElementById('mergeSupportMatching');
    const hideLevelCheckbox = document.getElementById('hideLevel');
    const hideItemLevelCheckbox = document.getElementById('hideItemLevel');
    const hideRankCheckbox = document.getElementById('hideRank');
    const replaceRoleIconsCheckbox = document.getElementById('replaceRoleIcons');
    const showShortNamesCheckbox = document.getElementById('showShortNames');
    const content = document.getElementById('content');
    const suppDungeon = document.getElementById('supportDungeon');
    const searchInputs = [searchNameInput, searchMinLevelInput, searchMinItemLevelInput];
    const checkboxes = [saveCollapsedCheckbox, mergeSupportCheckbox, hideLevelCheckbox, hideItemLevelCheckbox, hideRankCheckbox, replaceRoleIconsCheckbox, showShortNamesCheckbox];
    const selects = [sortSelect, rankSelect];

    const defaultSelectIndex = 2;
    const defaultRankSelectIndex = 0;
    const saveCollapsedId = 'dungeonDetailsCollapsed';

    let dungeonList, emptyContainer, dungeons, dungeonsOld, parties;
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
        dungeonsOld = null;
    }

    function filterDungeons(_, save = true) {
        save && searchInputs.forEach(e => saveData(e, e.value));
        save && saveData(rankSelect, rankSelect.selectedIndex);

        const searchNameVal = searchNameInput.value.customSplitFilter(',');
        const searchMinLevelVal = searchMinLevelInput.value.customSplitFilter(',');
        const searchMinItemLevelVal = searchMinItemLevelInput.value.customSplitFilter(',');
        const rankSelectVal = rankSelect.value;

        let any = false;
        dungeons.forEach(d => {
            const name = d.getElementsByClassName('dungeon-name')[0].dataset.name.toLowerCase();
            const shortName = d.getElementsByClassName('dungeon-name')[0].dataset.shortName.toLowerCase();
            const minLevel = parseInt(d.getElementsByClassName('dungeon-lvl')[0].textContent);
            const minItemLevel = parseInt(d.getElementsByClassName('dungeon-ilvl')[0].textContent);
            const dungeonRank = d.getElementsByClassName('dungeon-rank')[0].dataset.dungeonRank;

            const show = searchNameVal.customSomeFilter(s => name.includes(s) || shortName.includes(s)) &&
                searchMinLevelVal.customSomeFilter(s => checkLevel(minLevel, s)) &&
                searchMinItemLevelVal.customSomeFilter(s => checkLevel(minItemLevel, s)) &&
                (rankSelectVal === 'default' || rankSelectVal == dungeonRank);

            d.style.display = show ? '' : 'none';
            any ||= show;
        });
        checkIfEmpty(!any);
    }

    function sortDungeons(_, save = true) {
        save && saveData(sortSelect, sortSelect.selectedIndex);

        function sortFunc(a, b, mode) {
            const minLevelA = parseInt(a.getElementsByClassName('dungeon-lvl')[0].textContent);
            const minLevelB = parseInt(b.getElementsByClassName('dungeon-lvl')[0].textContent);
            const minItemLevelA = parseInt(a.getElementsByClassName('dungeon-ilvl')[0].textContent);
            const minItemLevelB = parseInt(b.getElementsByClassName('dungeon-ilvl')[0].textContent);
            const nameA = a.getElementsByClassName('dungeon-name')[0].textContent;
            const nameB = b.getElementsByClassName('dungeon-name')[0].textContent;
            const playersA = a.getElementsByClassName('party-player-detailed-content').length;
            const playersB = b.getElementsByClassName('party-player-detailed-content').length;
            const rankA = parseInt(a.getElementsByClassName('dungeon-rank')[0].dataset.dungeonRank);
            const rankB = parseInt(b.getElementsByClassName('dungeon-rank')[0].dataset.dungeonRank);

            switch (mode) {
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
                case 'rankDesc':
                    return rankB - rankA;
                case 'rankAsc':
                    return rankA - rankB;
            }
        }

        const sortVal = sortSelect.value;
        const sortValDefaut = sortSelect.options[defaultSelectIndex].value;
        if (sortVal !== sortValDefaut) {
            // secondary sorting by default value
            dungeons.sort((a, b) => sortFunc(a, b, sortValDefaut));
        }
        dungeons.sort((a, b) => sortFunc(a, b, sortVal));
        dungeons.forEach(d => dungeonList.appendChild(d));
    }

    function mergeSupportMatching(_, save = true) {
        save && saveData(mergeSupportCheckbox, mergeSupportCheckbox.checked, false);

        if (dungeonsOld != null) {
            let tempArr = dungeons;
            dungeons = dungeonsOld;
            dungeonsOld = tempArr;

            dungeonsOld.forEach(d => dungeonList.removeChild(d));
            dungeons.forEach(d => dungeonList.appendChild(d));
        }
        else if (mergeSupportCheckbox.checked) {
            let lowDungeon = dungeons.find(d => d.querySelector('.dungeon-lvl').innerText == suppDungeon.dataset.lowestDungeonLevel);
            if (lowDungeon == null)
                return false;

            let partyDetails = Array.from(lowDungeon.getElementsByClassName('party-details'));
            let supporters = partyDetails.filter(pd => pd.querySelector('.party-player-detailed-content.level65'));
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

            let supportDungeons = dungeons.filter(d => d.querySelector('.dungeon-lvl').innerText < parseInt(suppDungeon.dataset.minLevel) &&
                d.querySelector('.party-player-detailed-content.level65') != null);

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

                parties.filter(p => p.querySelector('.party-player-detailed-content.level65') != null).forEach(p => newNode.removeChild(p));
                newNode.addEventListener('toggle', dungeonDetailsClickHandler);
                dungeonList.appendChild(newNode);
            });

            let newElem = lowDungeon.cloneNode(true);
            newElem.setAttribute('id', suppDungeon.dataset.id);
            newElem.querySelector('.dungeon-lvl').innerText = suppDungeon.dataset.minLevel;
            newElem.querySelector('.dungeon-ilvl').innerText = suppDungeon.dataset.minItemLevel;
            newElem.querySelector('.dungeon-name').innerText = suppDungeon.dataset.name;

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

                parties.filter(p => p.querySelector('.party-player-detailed-content.level65') == null).forEach(p => { newElem.removeChild(p) });
            }
            newElem.addEventListener('toggle', dungeonDetailsClickHandler);
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

    function hideItemLevel(_, save = true) {
        save && saveData(hideItemLevelCheckbox, hideItemLevelCheckbox.checked, false);

        hideLevelLabels(hideItemLevelCheckbox.checked, true);
    }

    function hideLevelLabels(flag, isItemLevel = false) {
        const className = isItemLevel ? 'dungeon-ilvl' : 'dungeon-lvl';
        const labels = dungeonList.getElementsByClassName(className);
        for (const lbl of labels) {
            lbl.hidden = flag;
        }
    }

    function hideRank(_, save = true) {
        save && saveData(hideRankCheckbox, hideRankCheckbox.checked, false);

        const ranks = dungeonList.getElementsByClassName('dungeon-rank');
        for (const rank of ranks) {
            rank.hidden = hideRankCheckbox.checked;
        }
    }

    function replaceRoleIcons(_, save = true) {
        save && saveData(replaceRoleIconsCheckbox, replaceRoleIconsCheckbox.checked, false);

        const replace = replaceRoleIconsCheckbox.checked;
        const roleIcons = dungeonList.getElementsByClassName('party-player-role-icon');
        const classIcons = dungeonList.getElementsByClassName('party-player-class-icon');
        const roleText = dungeonList.getElementsByClassName('party-player-role-text');

        for (const e of roleIcons) {
            e.hidden = replace;
        }
        for (const e of classIcons) {
            e.hidden = !replace;
        }
        for (const e of roleText) {
            e.hidden = !replace;
        }
    }

    function toggleShortNames(_, save = true) {
        save && saveData(showShortNamesCheckbox, showShortNamesCheckbox.checked, false);

        const dungeonNames = dungeonList.getElementsByClassName('dungeon-name');
        for (const name of dungeonNames) {
            name.textContent = showShortNamesCheckbox.checked ? name.dataset.shortName : name.dataset.name;
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
        if (!mergeSupportMatching(null, false)) {
            sortDungeons(null, false);
            filterDungeons(null, false);
        }

        if (collapseAll) {
            collapsedElements = dungeons.map(d => d.id);
        }
        else {
            collapsedElements = collapsedElements.filter(e => dungeons.some(d => d.id === e));
        }
        dungeons.forEach(d => d.open = collapsedElements.indexOf(d.id) === -1);
        saveDetailsCollapsed(null, false);

        hideLevel(null, false);
        hideItemLevel(null, false);
        hideRank(null, false);
        replaceRoleIcons(null, false);
        toggleShortNames(null, false);
        parties.forEach(p => p.open = openedParties.indexOf(p.dataset.partyId) !== -1);
        openedParties = openedParties.filter(e => parties.some(p => p.dataset.partyId === e));
    }

    // register event handlers
    sortSelect.addEventListener('change', sortDungeons);
    searchNameInput.addEventListener('input', filterDungeons);
    searchMinLevelInput.addEventListener('input', filterDungeons);
    searchMinItemLevelInput.addEventListener('input', filterDungeons);
    rankSelect.addEventListener('change', filterDungeons);
    dungeons.forEach(d => d.querySelector('.dungeon-summary').addEventListener('click', dungeonDetailsClickHandler));
    parties.forEach(p => p.addEventListener('toggle', partyDetailsToggleHandler));
    saveCollapsedCheckbox.addEventListener('change', saveDetailsCollapsed);
    mergeSupportCheckbox.addEventListener('change', mergeSupportMatching);
    hideLevelCheckbox.addEventListener('change', hideLevel);
    hideItemLevelCheckbox.addEventListener('change', hideItemLevel);
    hideRankCheckbox.addEventListener('change', hideRank);
    replaceRoleIconsCheckbox.addEventListener('change', replaceRoleIcons);
    showShortNamesCheckbox.addEventListener('change', toggleShortNames);
    content.addEventListener('contentUpdated', refresh);
    toggleDetailsButton.addEventListener('click', toggleAllDungeons);

    clearEmptyButton.addEventListener('click', clearFilters);
    clearNavigationButton.addEventListener('click', function() {
        sortSelect.selectedIndex = defaultSelectIndex;
        rankSelect.selectedIndex = defaultRankSelectIndex;
        clearFilters();
    });

    // restore saved data
    searchInputs.forEach(e => e.value = loadData(e) ?? e.value);
    checkboxes.forEach(e => {
        const checked = loadData(e, false);
        if (checked != null)
            e.checked = checked === 'true';
    });
    selects.forEach(e => e.selectedIndex = loadData(e) ?? e.selectedIndex);
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