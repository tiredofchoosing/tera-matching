document.addEventListener('DOMContentLoaded', function() {
    const playerList = document.getElementById('playersTableBody');
    const searchNameInput = document.getElementById('searchPlayerName');
    const searchLevelInput = document.getElementById('searchPlayerLevel');
    const sortSelect = document.getElementById('selectPlayerSort');
    const classSelect = document.getElementById('selectPlayerClass');
    const toggleLangButton = document.getElementById('toggleLang');
    const clearNavigationButton = document.getElementById('clearNavigation');
    const autoupdateCheckbox = document.getElementById('autoupdateCheck');
    const searchInputs = [searchNameInput, searchLevelInput];
    const checkboxes = [autoupdateCheckbox];
    const defaultSelectIndex = 1;
    const defaultClassSelectIndex = 0;

    let players = Array.from(playerList.getElementsByClassName('player-details'));

    // functions
    function filterPlayers(_, save = true) {
        save && searchInputs.forEach(e => saveData(e, e.value));
        save && saveData(classSelect, classSelect.selectedIndex);

        let searchNameVal = searchNameInput.value.toLowerCase();
        let searchLevelVal = searchLevelInput.value;
        let classSelectVal = classSelect.value;

        players.forEach(p => {
            let name = p.getElementsByClassName('player-name')[0].textContent;
            let level = parseInt(p.getElementsByClassName('player-lvl')[0].textContent);
            let playerClass = p.getElementsByClassName('player-class')[0].dataset.playerClass;

            let show = name.toLowerCase().includes(searchNameVal) &&
                checkLevel(level, searchLevelVal) &&
                (classSelectVal === 'default' || classSelectVal == playerClass);

            p.style.display = show ? '' : 'none';
        });
        sortPlayers(null, save);
    }

    function sortPlayers(_, save = true) {
        save && saveData(sortSelect, sortSelect.selectedIndex);

        let sortVal = sortSelect.value;
        players.sort((a, b) => {
            let levelA = parseInt(a.getElementsByClassName('player-lvl')[0].textContent);
            let levelB = parseInt(b.getElementsByClassName('player-lvl')[0].textContent);
            let nameA = a.getElementsByClassName('player-name')[0].textContent;
            let nameB = b.getElementsByClassName('player-name')[0].textContent;
            let classA = parseInt(a.getElementsByClassName('player-class')[0].dataset.playerClass);
            let classB = parseInt(b.getElementsByClassName('player-class')[0].dataset.playerClass);
            let idA = parseInt(a.id);
            let idB = parseInt(b.id);

            switch(sortVal) {
                case 'levelDesc':
                    return levelB - levelA;
                case 'levelAsc':
                    return levelA - levelB;
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
            }
        });
        let i = 1;
        players.forEach(p => {
            if (p.style.display !== 'none') {
                p.getElementsByClassName('player-id')[0].textContent = i++;
                playerList.appendChild(p);
            }
            else if (p.parentElement == playerList) {
                playerList.removeChild(p);
            }
        });
    }

    // register event handlers
    sortSelect.addEventListener('change', sortPlayers);
    classSelect.addEventListener('change', filterPlayers);
    searchNameInput.addEventListener('input', filterPlayers);
    searchLevelInput.addEventListener('input', filterPlayers);
    autoupdateCheckbox.addEventListener('change', setAutoupdate);
    toggleLangButton.addEventListener('click', toggleLang);

    clearNavigationButton.addEventListener('click', function() {
        searchInputs.forEach(e => e.value = '');
        sortSelect.selectedIndex = defaultSelectIndex;
        classSelect.selectedIndex = defaultClassSelectIndex;
        // autoupdateCheckbox.checked = false;

        filterPlayers(null, true);
        // sortPlayers(null, true); // called in filter
    });

    // restore session data
    searchInputs.forEach(e => e.value = loadData(e) ?? e.value);
    checkboxes.forEach(e => {
        let checked = loadData(e);
        if (checked != null)
            e.checked = checked === 'true';
    });
    sortSelect.selectedIndex = loadData(sortSelect) ?? sortSelect.selectedIndex;
    classSelect.selectedIndex = loadData(classSelect) ?? classSelect.selectedIndex;

    filterPlayers(null, true);
    // sortPlayers(null, true); // called in filter
    setAutoupdate(null, false, autoupdateCheckbox);

    // let regexp = /android|iphone|ipad/i;
    // if (regexp.test(navigator.userAgent)) {
    //     classSelect.setAttribute('multiple', 'multiple');
    // }
});