document.addEventListener('DOMContentLoaded', function() {
    const playerList = document.getElementById('player-table');
    const searchNameInput = document.getElementById('searchName');
    const searchLevelInput = document.getElementById('searchLevel');
    const sortSelect = document.getElementById('sort');
    const toggleLangButton = document.getElementById('toggleLang');
    const clearNavigationButton = document.getElementById('clearNavigation');
    const autoupdateCheckbox = document.getElementById('autoupdateCheck');
    const searchInputs = [searchNameInput, searchLevelInput];
    const checkboxes = [autoupdateCheckbox];
    const defaultSelectIndex = 0;

    let players = Array.from(playerList.getElementsByClassName('player-details'));

    // functions
    function filterPlayers(_, save = true) {
        save && searchInputs.forEach(e => saveData(e, e.value));

        let searchNameVal = searchNameInput.value.toLowerCase();
        let searchLevelVal = searchLevelInput.value;

        players.forEach(p => {
            let name = p.getElementsByClassName('player-name')[0].textContent;
            let level = parseInt(p.getElementsByClassName('player-lvl')[0].textContent);

            let show = name.toLowerCase().includes(searchNameVal) &&
                checkLevel(level, searchLevelVal);

            p.style.display = show ? '' : 'none';
        });
    }

    function sortPlayers(_, save = true) {
        save && saveData(sortSelect, sortSelect.selectedIndex);

        let sortVal = sortSelect.value;
        players.sort((a, b) => {
            let levelA = parseInt(a.getElementsByClassName('player-lvl')[0].textContent);
            let levelB = parseInt(b.getElementsByClassName('player-lvl')[0].textContent);
            let nameA = a.getElementsByClassName('player-name')[0].textContent;
            let nameB = b.getElementsByClassName('player-name')[0].textContent;
            let classA = a.getElementsByClassName('player-class')[0].textContent;
            let classB = b.getElementsByClassName('player-class')[0].textContent;
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
                    return classB.localeCompare(classA);
                case 'classAsc':
                    return classA.localeCompare(classB);
                // case 'classDesc':
                // 	return classB - classA;
                // case 'classAsc':
                // 	return classA - classB;
                case 'default':
                    return idA - idB;
            }
        });
        let i = 1;
        players.forEach(d => {
            d.getElementsByClassName('player-id')[0].textContent = i++;
            playerList.appendChild(d);
        });
    }

    // register event handlers
    sortSelect.addEventListener('change', sortPlayers);
    searchNameInput.addEventListener('input', filterPlayers);
    searchLevelInput.addEventListener('input', filterPlayers);
    autoupdateCheckbox.addEventListener('change', setAutoupdate);

    clearNavigationButton.addEventListener('click', function() {
        searchInputs.forEach(e => e.value = '');
        sortSelect.selectedIndex = defaultSelectIndex;
        // autoupdateCheckbox.checked = false;

        sortPlayers(null, true);
        filterPlayers(null, true);
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

    sortPlayers(null, true);
    filterPlayers(null, true);
    setAutoupdate(null, false, autoupdateCheckbox);
});