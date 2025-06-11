(function() {

    const searchNameInput = document.getElementById('searchPlayerName');
    const searchLevelInput = document.getElementById('searchPlayerLevel');
    const searchItemLevelInput = document.getElementById('searchPlayerItemLevel');
    const searchGuildInput = document.getElementById('searchPlayerGuild');
    const sortSelect = document.getElementById('selectPlayerSort');
    const classSelect = document.getElementById('selectPlayerClass');
    const clearNavigationButton = document.getElementById('clearNavigation');
    const clearEmptyButton = document.getElementById('clearEmptyButton');
    const content = document.getElementById('content');
    const searchInputs = [searchNameInput, searchLevelInput, searchItemLevelInput, searchGuildInput];
    const selects = [sortSelect, classSelect];

    const defaultSelectIndex = 1;
    const defaultClassSelectIndex = 0;

    let playersTableRoot, playersList, emptyContainer, players;
    initVariables();

    // functions
    function initVariables() {
        playersTableRoot = document.getElementById('playersTableRoot');
        playersList = document.getElementById('playersTableBody');
        emptyContainer = document.getElementById('empty');
        players = playersList != null ? Array.from(playersList.getElementsByClassName('player-details')) : [];
    }

    function filterPlayers(_, save = true) {
        save && searchInputs.forEach(e => saveData(e, e.value));
        save && saveData(classSelect, classSelect.selectedIndex);

        const searchNameVal = searchNameInput.value.customSplitFilter(',');
        const searchLevelVal = searchLevelInput.value.customSplitFilter(',');
        const searchItemLevelVal = searchItemLevelInput.value.customSplitFilter(',');
        const searchGuildVal = searchGuildInput.value.customSplitFilter(',');
        const classSelectVal = classSelect.value;

        players.forEach(p => {
            const name = p.getElementsByClassName('player-name')[0].textContent.toLowerCase();
            const level = parseInt(p.getElementsByClassName('player-lvl')[0].textContent);
            const itemLevel = parseInt(p.getElementsByClassName('player-ilvl')[0].textContent);
            const guild = p.getElementsByClassName('player-guild')[0].textContent.trim().toLowerCase();
            const playerClass = p.getElementsByClassName('player-class')[0].dataset.playerClass;

            const show = searchNameVal.customSomeFilter(s => name.includes(s)) &&
                searchLevelVal.customSomeFilter(s => checkLevel(level, s)) &&
                searchItemLevelVal.customSomeFilter(s => checkLevel(itemLevel, s)) &&
                searchGuildVal.customSomeFilter(s => guild.includes(s)) &&
                (classSelectVal === 'default' || classSelectVal == playerClass);

            p.style.display = show ? '' : 'none';
        });
        sortPlayers(null, save);
        checkIfEmpty();
    }

    function sortPlayers(_, save = true) {
        save && saveData(sortSelect, sortSelect.selectedIndex);

        const sortVal = sortSelect.value;
        players.sort((a, b) => {
            const levelA = parseInt(a.getElementsByClassName('player-lvl')[0].textContent);
            const levelB = parseInt(b.getElementsByClassName('player-lvl')[0].textContent);
            const itemLevelA = parseInt(a.getElementsByClassName('player-ilvl')[0].dataset.itemLevel);
            const itemLevelB = parseInt(b.getElementsByClassName('player-ilvl')[0].dataset.itemLevel);
            const nameA = a.getElementsByClassName('player-name')[0].textContent;
            const nameB = b.getElementsByClassName('player-name')[0].textContent;
            const classA = parseInt(a.getElementsByClassName('player-class')[0].dataset.playerClass);
            const classB = parseInt(b.getElementsByClassName('player-class')[0].dataset.playerClass);
            const idA = parseInt(a.id);
            const idB = parseInt(b.id);
            const guildA = a.getElementsByClassName('player-guild')[0].textContent.trim();
            const guildB = b.getElementsByClassName('player-guild')[0].textContent.trim();

            switch (sortVal) {
                case 'levelDesc':
                    return levelB - levelA;
                case 'levelAsc':
                    return levelA - levelB;
                case 'itemLevelDesc':
                    return itemLevelB - itemLevelA;
                case 'itemLevelAsc':
                    return itemLevelA - itemLevelB;
                case 'nameDesc':
                    return nameB.localeCompare(nameA);
                case 'nameAsc':
                    return nameA.localeCompare(nameB);
                case 'classDesc':
                    return classB - classA;
                case 'classAsc':
                    return classA - classB;
                case 'timeDesc':
                    return idB - idA;
                case 'timeAsc':
                    return idA - idB;
                case 'guildDesc':
                    return guildB.localeCompare(guildA);
                case 'guildAsc':
                    return guildA.localeCompare(guildB);
            }
        });
        let i = 1;
        players.forEach(p => {
            if (p.style.display !== 'none') {
                p.getElementsByClassName('player-id')[0].textContent = i++;
                playersList.appendChild(p);
            }
            else if (p.parentElement == playersList) {
                playersList.removeChild(p);
            }
        });
    }

    function checkIfEmpty() {
        if (playersTableRoot.children.length === 0)
            return;

        const isEmpty = playersList.children.length === 0;
        playersTableRoot.hidden = isEmpty;
        emptyContainer.hidden = !isEmpty;
        emptyContainer.querySelector('#initialEmpty').hidden = isEmpty;
        emptyContainer.querySelector('#filteredEmpty').hidden = !isEmpty;
    }

    function clearFilters() {
        searchInputs.forEach(e => e.value = '');
        filterPlayers(null, true);
    }

    function refresh() {
        initVariables();
        loadState();
    }

    function loadState() {
        filterPlayers(null, true);
    }

    // register event handlers
    sortSelect.addEventListener('change', sortPlayers);
    classSelect.addEventListener('change', filterPlayers);
    searchNameInput.addEventListener('input', filterPlayers);
    searchLevelInput.addEventListener('input', filterPlayers);
    searchItemLevelInput.addEventListener('input', filterPlayers);
    searchGuildInput.addEventListener('input', filterPlayers);
    content.addEventListener('contentUpdated', refresh);

    clearEmptyButton.addEventListener('click', clearFilters);
    clearNavigationButton.addEventListener('click', function() {
        sortSelect.selectedIndex = defaultSelectIndex;
        classSelect.selectedIndex = defaultClassSelectIndex;
        clearFilters();
    });

    // restore session data
    searchInputs.forEach(e => e.value = loadData(e) ?? e.value);
    selects.forEach(e => e.selectedIndex = loadData(e) ?? e.selectedIndex);

    loadState();

})();