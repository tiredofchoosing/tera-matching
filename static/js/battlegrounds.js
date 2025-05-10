(function() {

    let disableToggle = true;
    function isToggleEnabled() {
        return !disableToggle;
    }

    // to not handle 'toggle' on default open attribute
    window.addEventListener('load', () => disableToggle = false);

    const searchNameInput = document.getElementById('searchBattlegroundName');
    const searchMinLevelInput = document.getElementById('searchBattlegroundLevel');
    const sortSelect = document.getElementById('selectBattlegroundSort');
    const toggleDetailsButton = document.getElementById('toggleDetails');
    const clearNavigationButton = document.getElementById('clearNavigation');
    const saveCollapsedCheckbox = document.getElementById('saveCollapsed');
    const hideLevelCheckbox = document.getElementById('hideLevel');
    const body = document.body;
    const content = document.getElementById('content');
    const searchInputs = [searchNameInput, searchMinLevelInput];
    const checkboxes = [saveCollapsedCheckbox, hideLevelCheckbox];

    const defaultSelectIndex = 4;
    const saveCollapsedId = 'battlegroundDetailsCollapsed';
    const pinchFontSizes = [ '13px', '14px', '16px' ];
    const pinchDelta = 30;
    const pinchSaveId = 'pinchDungeonList';
    const openedParties = [];

    let dungeonList, emptyContainer, dungeons, parties;
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
        checkIfEmpty(any);
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

    function saveDetailsCollapsed(_, save = true) {
        save && saveData(saveCollapsedCheckbox, saveCollapsedCheckbox.checked, false);

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
        const value = toggleDetailsButton.value === 'true';
        toggleDetailsButton.firstElementChild.src = `/static/img/icons/${value ? 'collapse' : 'expand'}.svg`;
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

    function refresh() {
        initVariables();
        loadState();

        disableToggle = true;
        dungeons.forEach(d => d.addEventListener('toggle', dungeonDetailsToggleHandler));
        setTimeout(() => { disableToggle = false }, 0);

        parties.forEach(p => p.addEventListener('toggle', partyDetailsToggleHandler));
    }

    function loadState() {
        sortDungeons(null, false);
        filterDungeons(null, false);

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
        parties.forEach(p => p.open = openedParties.indexOf(p.dataset.partyId) !== -1);
    }

    // register event handlers
    sortSelect.addEventListener('change', sortDungeons);
    searchNameInput.addEventListener('input', filterDungeons);
    searchMinLevelInput.addEventListener('input', filterDungeons);
    dungeons.forEach(d => d.addEventListener('toggle', dungeonDetailsToggleHandler));
    parties.forEach(p => p.addEventListener('toggle', partyDetailsToggleHandler));
    saveCollapsedCheckbox.addEventListener('change', saveDetailsCollapsed);
    hideLevelCheckbox.addEventListener('change', hideLevel);
    content.addEventListener('contentUpdated', refresh);

    clearNavigationButton.addEventListener('click', function() {
        searchInputs.forEach(e => e.value = '');
        sortSelect.selectedIndex = defaultSelectIndex;

        sortDungeons(null, true);
        filterDungeons(null, true);
    });

    toggleDetailsButton.addEventListener('click', function() {
        const isOpen = this.value === 'true';
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
            const distance = Math.hypot(
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
        const checked = loadData(e, false);
        if (checked != null)
            e.checked = checked === 'true';
    });
    sortSelect.selectedIndex = loadData(sortSelect) ?? sortSelect.selectedIndex;
    toggleDetailsButton.value = loadData(toggleDetailsButton) ?? toggleDetailsButton.value;

    collapsedElements = loadData(saveCollapsedId);
    pinchCurrentIndex = loadData(pinchSaveId, false) ?? pinchCurrentIndex;

    loadState();
    updateCollapseIcon();

})();