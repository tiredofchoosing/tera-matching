(function() {

    const searchNameInput = document.getElementById('searchDungeonName');
    const searchMinLevelInput = document.getElementById('searchDungeonLevel');
    const searchMinItemLevelInput = document.getElementById('searchDungeonItemLevel');
    const sortSelect = document.getElementById('selectDungeonSort');
    const rankSelect = document.getElementById('selectDungeonRank');
    const toggleDetailsButton = document.getElementById('toggleDetails');
    const clearNavigationButton = document.getElementById('clearNavigation');
    const saveCollapsedCheckbox = document.getElementById('saveCollapsed');
    const mergeSupportCheckbox = document.getElementById('mergeSupportMatching');
    const hideLevelCheckbox = document.getElementById('hideLevel');
    const hideItemLevelCheckbox = document.getElementById('hideItemLevel');
    const hideRankCheckbox = document.getElementById('hideRank');
    const body = document.body;
    const content = document.getElementById('content');
    const searchInputs = [searchNameInput, searchMinLevelInput, searchMinItemLevelInput];
    const checkboxes = [saveCollapsedCheckbox, mergeSupportCheckbox, hideLevelCheckbox, hideItemLevelCheckbox, hideRankCheckbox];
    const selects = [sortSelect, rankSelect];

    const defaultSelectIndex = 2;
    const defaultRankSelectIndex = 0;
    const saveCollapsedId = 'dungeonDetailsCollapsed';
    const suppDungeon = supportDungeonProps; // From html body
    const pinchFontSizes = [ '13px', '14px', '16px' ];
    const pinchDelta = 30;
    const pinchSaveId = 'pinchDungeonList';

    let dungeonList, emptyContainer, dungeons, dungeonsOld, parties;
    initVariables();

    let collapsedElements = [];
    let collapseAll = false;
    let pinchInitDist = 0;
    let pinchCurrentIndex = pinchFontSizes.indexOf(window.getComputedStyle(dungeonList).fontSize);
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
            const name = d.getElementsByClassName('dungeon-name')[0].textContent.toLowerCase();
            const minLevel = parseInt(d.getElementsByClassName('dungeon-lvl')[0].textContent);
            const minItemLevel = parseInt(d.getElementsByClassName('dungeon-ilvl')[0].textContent);
            const dungeonRank = d.getElementsByClassName('dungeon-rank')[0].dataset.dungeonRank;

            const show = searchNameVal.customSomeFilter(s => name.includes(s)) &&
                searchMinLevelVal.customSomeFilter(s => checkLevel(minLevel, s)) &&
                searchMinItemLevelVal.customSomeFilter(s => checkLevel(minItemLevel, s)) &&
                (rankSelectVal === 'default' || rankSelectVal == dungeonRank);

            d.style.display = show ? '' : 'none';
            any ||= show;
        });
        checkIfEmpty(any);
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
            let lowDungeon = dungeons.find(d => d.querySelector('.dungeon-lvl').innerText == suppDungeon.lowestDungeonLevel);
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

            let supportDungeons = dungeons.filter(d => d.querySelector('.dungeon-lvl').innerText < suppDungeon.minLevel &&
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

    function checkIfEmpty(any) {
        emptyContainer.hidden = any;
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

        dungeonList.style.fontSize = pinchFontSizes[pinchCurrentIndex];

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
    content.addEventListener('contentUpdated', refresh);
    toggleDetailsButton.addEventListener('click', toggleAllDungeons);

    clearNavigationButton.addEventListener('click', function() {
        searchInputs.forEach(e => e.value = '');
        sortSelect.selectedIndex = defaultSelectIndex;
        rankSelect.selectedIndex = defaultRankSelectIndex;

        sortDungeons(null, true);
        filterDungeons(null, true);
    });

    // change font size of dungeon list on touch pinch
    body.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            pinchInitDist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
        }
    });

    body.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
            let distance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            if (distance - pinchInitDist > pinchDelta) {
                pinchCurrentIndex = Math.min(pinchCurrentIndex + 1, pinchFontSizes.length - 1);
            }
            else if (pinchInitDist - distance > pinchDelta) {
                pinchCurrentIndex = Math.max(pinchCurrentIndex - 1, 0);
            }
            else
                return;

            dungeonList.style.fontSize = pinchFontSizes[pinchCurrentIndex];
            pinchInitDist = distance;
            saveData(pinchSaveId, pinchCurrentIndex, false);
        }
    });

    body.addEventListener('touchend', function(e) {
        if (e.touches.length < 2) {
            pinchInitDist = 0;
        }
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

    pinchCurrentIndex = loadData(pinchSaveId, false) ?? pinchCurrentIndex;

    loadState();

})();