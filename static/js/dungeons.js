(function() {

    let disableToggle = true;
    function isToggleEnabled() {
        return !disableToggle;
    }

    // to not handle 'toggle' on default open attribute
    window.addEventListener('load', () => disableToggle = false);

    const searchNameInput = document.getElementById('searchDungeonName');
    const searchMinLevelInput = document.getElementById('searchDungeonLevel');
    const searchMinItemLevelInput = document.getElementById('searchDungeonItemLevel');
    const sortSelect = document.getElementById('selectDungeonSort');
    const rankSelect = document.getElementById('selectDungeonRank');
    const toggleDetailsButton = document.getElementById('toggleDetails');
    const clearNavigationButton = document.getElementById('clearNavigation');
    const autoupdateCheckbox = document.getElementById('autoupdateCheck');
    const saveCollapsedCheckbox = document.getElementById('saveCollapsed');
    const mergeSupportCheckbox = document.getElementById('mergeSupportMatching');
    const hideLevelCheckbox = document.getElementById('hideLevel');
    const hideItemLevelCheckbox = document.getElementById('hideItemLevel');
    const body = document.body;
    const content = document.getElementById('content');
    const searchInputs = [searchNameInput, searchMinLevelInput, searchMinItemLevelInput];
    const checkboxes = [autoupdateCheckbox, saveCollapsedCheckbox, mergeSupportCheckbox, hideLevelCheckbox, hideItemLevelCheckbox];
    const selects = [sortSelect, rankSelect];

    const defaultSelectIndex = 2;
    const defaultRankSelectIndex = 0;
    const saveCollapsedId = 'dungeonDetailsCollapsed';
    const suppDungeon = supportDungeonProps; // From html body
    const pinchFontSizes = [ '13px', '14px', '16px' ];
    const pinchDelta = 30;
    const pinchSaveId = 'pinchDungeonList';
    const openedParties = [];

    let dungeonList, emptyContainer, dungeons, dungeonsOld, parties;
    initVariables();

    let collapsedElements = null;
    let pinchInitDist = 0;
    let pinchCurrentIndex = pinchFontSizes.indexOf(window.getComputedStyle(dungeonList).fontSize);

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

    function saveDetailsCollapsed(_, save = true) {
        save && saveData(saveCollapsedCheckbox, saveCollapsedCheckbox.checked);

        if (saveCollapsedCheckbox.checked) {
            if (dungeons.every(d => !d.open)) {
                collapsedElements = 'all';
            }
            else if (dungeons.every(d => d.open)) {
                collapsedElements = null;
            }
            else {
                let ids = dungeons.filter(d => !d.open).map(d => d.getAttribute('id')).join(',');
                collapsedElements = ids;
            }
            saveData(saveCollapsedId, collapsedElements);
            saveData(toggleDetailsButton, toggleDetailsButton.value);
        }
        else {
            collapsedElements = null;
            saveData(saveCollapsedId, null);
            saveData(toggleDetailsButton, null);
        }
    }

    function mergeSupportMatching(_, save = true) {
        save && saveData(mergeSupportCheckbox, mergeSupportCheckbox.checked);

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

                parties.filter(p => p.querySelector('.party-player-detailed-content.level65') == null).forEach(p => { newElem.removeChild(p) });
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

    function updateCollapseIcon() {
        let value = toggleDetailsButton.value === 'true';
        toggleDetailsButton.firstElementChild.src = `/static/img/icons/${value ? 'collapse' : 'expand'}.svg`;
    }

    function hideLevel(_, save = true) {
        save && saveData(hideLevelCheckbox, hideLevelCheckbox.checked);

        hideLevelLabels(hideLevelCheckbox.checked);
    }

    function hideItemLevel(_, save = true) {
        save && saveData(hideItemLevelCheckbox, hideItemLevelCheckbox.checked);

        hideLevelLabels(hideItemLevelCheckbox.checked, true);
    }

    function hideLevelLabels(flag, isItemLevel = false) {
        const className = isItemLevel ? 'dungeon-ilvl' : 'dungeon-lvl';
        const labels = dungeonList.getElementsByClassName(className);
        for (const lbl of labels) {
            lbl.hidden = flag;
        }
    }

    function refresh() {
        initVariables();
        loadState();

        disableToggle = true;
        dungeons.forEach(d => d.addEventListener('toggle', dungeonDetailsToggleHandler));
        setTimeout(() => { disableToggle = false }, 0);

        parties.forEach(p => p.addEventListener('toggle', partyDetailsToggleHandler));
    }

    function loadState() {
        if (!mergeSupportMatching(null, false)) {
            sortDungeons(null, false);
            filterDungeons(null, false);
        }

        dungeonList.style.fontSize = pinchFontSizes[pinchCurrentIndex];

        if (collapsedElements === 'all') {
            dungeons.forEach(d => d.open = false);
        }
        else if (collapsedElements != null) {
            collapsedElements.split(',').forEach(id => {
                const d = document.getElementById(id);
                if (d != null)
                    d.open = false;
            });
            saveDetailsCollapsed(null, false);
        }

        hideLevel(null, false);
        hideItemLevel(null, false);
        parties.forEach(p => p.open = openedParties.indexOf(p.dataset.partyId) !== -1);
    }

    // register event handlers
    sortSelect.addEventListener('change', sortDungeons);
    searchNameInput.addEventListener('input', filterDungeons);
    searchMinLevelInput.addEventListener('input', filterDungeons);
    searchMinItemLevelInput.addEventListener('input', filterDungeons);
    rankSelect.addEventListener('change', filterDungeons);
    dungeons.forEach(d => d.addEventListener('toggle', dungeonDetailsToggleHandler));
    parties.forEach(p => p.addEventListener('toggle', partyDetailsToggleHandler));
    autoupdateCheckbox.addEventListener('change', setAutoupdate);
    saveCollapsedCheckbox.addEventListener('change', saveDetailsCollapsed);
    mergeSupportCheckbox.addEventListener('change', mergeSupportMatching);
    hideLevelCheckbox.addEventListener('change', hideLevel);
    hideItemLevelCheckbox.addEventListener('change', hideItemLevel);
    content.addEventListener('contentUpdated', refresh);

    clearNavigationButton.addEventListener('click', function() {
        searchInputs.forEach(e => e.value = '');
        sortSelect.selectedIndex = defaultSelectIndex;
        rankSelect.selectedIndex = defaultRankSelectIndex;
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
        updateCollapseIcon();
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

    // restore session data
    searchInputs.forEach(e => e.value = loadData(e) ?? e.value);
    checkboxes.forEach(e => {
        let checked = loadData(e);
        if (checked != null)
            e.checked = checked === 'true';
    });
    selects.forEach(e => e.selectedIndex = loadData(e) ?? e.selectedIndex);
    toggleDetailsButton.value = loadData(toggleDetailsButton) ?? toggleDetailsButton.value;

    collapsedElements = loadData(saveCollapsedId);
    pinchCurrentIndex = loadData(pinchSaveId, false) ?? pinchCurrentIndex;

    loadState();
    updateCollapseIcon();
    setAutoupdate(null, false, autoupdateCheckbox);

})();