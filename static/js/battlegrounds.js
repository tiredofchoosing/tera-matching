(function() {

    let disableToggle = true;
    function isToggleEnabled() {
        return !disableToggle;
    }

    // to not handle 'toggle' on default open attribute
    window.addEventListener('load', () => disableToggle = false);

    const dungeonList = document.getElementById('dungeonList');
    const searchNameInput = document.getElementById('searchBattlegroundName');
    const searchMinLevelInput = document.getElementById('searchBattlegroundLevel');
    const sortSelect = document.getElementById('selectBattlegroundSort');
    const toggleDetailsButton = document.getElementById('toggleDetails');
    const clearNavigationButton = document.getElementById('clearNavigation');
    const autoupdateCheckbox = document.getElementById('autoupdateCheck');
    const saveCollapsedCheckbox = document.getElementById('saveCollapsed');
    const emptyContainer = document.getElementById('empty');
    const body = document.body;
    const searchInputs = [searchNameInput, searchMinLevelInput];
    const checkboxes = [autoupdateCheckbox, saveCollapsedCheckbox];

    const defaultSelectIndex = 4;
    const saveCollapsedId = 'battlegroundDetailsCollapsed';
    const pinchFontSizes = [ '13px', '14px', '16px' ];
    const pinchDelta = 30;
    const pinchSaveId = 'pinchDungeonList';

    let dungeons = Array.from(dungeonList.getElementsByClassName('dungeon-details'));
    let pinchInitDist = 0;
    let pinchCurrentIndex = pinchFontSizes.indexOf(window.getComputedStyle(dungeonList).fontSize);

    // functions
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
        save && saveData(saveCollapsedCheckbox, saveCollapsedCheckbox.checked);

        if (saveCollapsedCheckbox.checked) {
            if (dungeons.every(d => !d.open)) {
                saveData(saveCollapsedId, 'all');
            }
            else if (dungeons.every(d => d.open)) {
                saveData(saveCollapsedId, null);
            }
            else {
                const ids = dungeons.filter(d => !d.open).map(d => d.getAttribute('id')).join(',');
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

    function checkIfEmpty(any) {
        emptyContainer.hidden = any;
    }

    function updateCollapseIcon() {
        const value = toggleDetailsButton.value === 'true';
        toggleDetailsButton.firstElementChild.src = `/static/img/icons/${value ? 'collapse' : 'expand'}.svg`;
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
        const checked = loadData(e);
        if (checked != null)
            e.checked = checked === 'true';
    });
    sortSelect.selectedIndex = loadData(sortSelect) ?? sortSelect.selectedIndex;
    toggleDetailsButton.value = loadData(toggleDetailsButton) ?? toggleDetailsButton.value;
    updateCollapseIcon();
    sortDungeons(null, false);
    filterDungeons(null, false);
    setAutoupdate(null, false, autoupdateCheckbox);

    const saveCollapsedVal = loadData(saveCollapsedId);
    if (saveCollapsedVal === 'all') {
        dungeons.forEach(d => d.open = false);
    }
    else if (saveCollapsedVal != null) {
        saveCollapsedVal.split(',').forEach(id => {
            const d = document.getElementById(id);
            if (d != null)
                d.open = false;
        });
        saveDetailsCollapsed(null, false);
    }

    const savedPinchIndex = loadData(pinchSaveId, false);
    if (savedPinchIndex != null) {
        pinchCurrentIndex =  savedPinchIndex;
        dungeonList.style.fontSize = pinchFontSizes[pinchCurrentIndex];
    }

})();