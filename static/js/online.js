(function() {

    const playersTableRoot = document.getElementById('playersTableRoot');
    const playersList = document.getElementById('playersTableBody');
    const searchNameInput = document.getElementById('searchPlayerName');
    const searchLevelInput = document.getElementById('searchPlayerLevel');
    const sortSelect = document.getElementById('selectPlayerSort');
    const classSelect = document.getElementById('selectPlayerClass');
    const clearNavigationButton = document.getElementById('clearNavigation');
    const autoupdateCheckbox = document.getElementById('autoupdateCheck');
    const emptyContainer = document.getElementById('empty');
    const canvas = document.getElementById('chart');
    const ctx = canvas.getContext('2d');
    const showStatButton = document.getElementById('showStat');
    const hideStatButton = document.getElementById('hideStat');
    const playersTable = document.getElementById('playersTable');
    const statContainer = document.getElementById('statContainer');
    const searchInputs = [searchNameInput, searchLevelInput];
    const checkboxes = [autoupdateCheckbox];
    const defaultSelectIndex = 1;
    const defaultClassSelectIndex = 0;
    
    // TODO: move to CSS?
    const fontSize = 16;
    const fontFamily = "'Montserrat', sans-serif";
    const fontColor = 'rgba(255, 255, 255, 0.8)';
    const axisColor = 'rgba(255, 255, 255, 0.2)';
    const gridColor = 'rgba(255, 255, 255, 0.1)';
    const barBgColor = 'rgba(86, 136, 92, 0.5)';
    const barBorderColor = 'rgba(255, 255, 255, 0.3)';
    const title = canvas.dataset.title;
    const labels = canvas.dataset.labels.split(',');
    const values = canvas.dataset.values.split(',');

    Chart.defaults.color = fontColor;
    Chart.defaults.font.size = fontSize;
    Chart.defaults.font.family = fontFamily;

    let playersChart = null;
    let players = playersList != null ? Array.from(playersList.getElementsByClassName('player-details')) : [];

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
        checkIfEmpty();
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
            let idA = parseInt(a.dataset.id);
            let idB = parseInt(b.dataset.id);

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

        emptyContainer.hidden = playersList.children.length !== 0;
        playersTableRoot.hidden = playersList.children.length === 0;
    }

    function switchStat() {
        if (playersChart !== null) {
            let stat = statContainer.hidden;
            playersTable.hidden = stat;
            statContainer.hidden = !stat;

            // let mode = stat === true ? 'show' : 'hide';
            // playersChart.update(mode);
            if (stat === true) {
                playersChart.resize(null, 500);
            }
        }
    }
    
    document.fonts.ready.then(function() {
        playersChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    backgroundColor: barBgColor,
                    borderColor: barBorderColor,
                    borderWidth: 1,
                    data: values
                }]
            },
            options: {
                indexAxis: 'y',
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: gridColor
                        },
                        border: {
                            color: axisColor
                        },
                        ticks: {
                            precision: 0,
                            stepSize: 1
                        }
                    },
                    y: {
                        grid: {
                            color: gridColor
                        },
                        border: {
                            color: axisColor
                        }
                    }
                },
                animation: {
                    duration: 0
                },
                plugins: {
                    legend: {
                        display: false
                    },
                },
            }
        });
        
    });

    // register event handlers
    sortSelect.addEventListener('change', sortPlayers);
    classSelect.addEventListener('change', filterPlayers);
    searchNameInput.addEventListener('input', filterPlayers);
    searchLevelInput.addEventListener('input', filterPlayers);
    autoupdateCheckbox.addEventListener('change', setAutoupdate);
    showStatButton.addEventListener('click', switchStat);
    hideStatButton.addEventListener('click', switchStat);

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

})();