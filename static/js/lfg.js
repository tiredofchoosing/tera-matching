(function() {

    const searchMessageInput = document.getElementById('searchLfgMessage');
    const sortSelect = document.getElementById('selectLfgSort');
    const clearNavigationButton = document.getElementById('clearNavigation');
    const content = document.getElementById('content');
    const searchInputs = [searchMessageInput];

    const defaultSelectIndex = 0;

    let lfgList, lfgs, emptyContainer;
    let openedLfgs = [];

    initVariables();

    function initVariables() {
        lfgList = document.getElementById('lfgList');
        emptyContainer = document.getElementById('empty');
        lfgs = Array.from(lfgList.getElementsByClassName('lfg-details'));
    }

    function filterLfgs(_, save = true) {
        save && searchInputs.forEach(e => saveData(e, e.value));

        const searchMessageVal = searchMessageInput.value.customSplitFilter(',');

        let any = false;
        lfgs.forEach(l => {
            const message = l.getElementsByClassName('lfg-message')[0].textContent.toLowerCase();

            const show = searchMessageVal.customSomeFilter(s => message.includes(s));

            l.style.display = show ? '' : 'none';
            any ||= show;
        });
        checkIfEmpty(any);
    }

    function checkIfEmpty(any) {
        emptyContainer.hidden = any;
    }

    function sortLfgs(_, save = true) {
        save && saveData(sortSelect, sortSelect.selectedIndex);

        const sortVal = sortSelect.value;
        lfgs.sort((a, b) => {
            const nameA = a.getElementsByClassName('lfg-leader-name')[0].textContent;
            const nameB = b.getElementsByClassName('lfg-leader-name')[0].textContent;
            const playersA = parseInt(a.getElementsByClassName('lfg-player-count')[0].textContent.split('/')[0]);
            const playersB = parseInt(b.getElementsByClassName('lfg-player-count')[0].textContent.split('/')[0]);

            switch (sortVal) {
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
        lfgs.forEach(d => lfgList.appendChild(d));
    }

    function lfgDetailsToggleHandler() {
        const lfgId = this.dataset.lfgId;
        const index = openedLfgs.indexOf(lfgId);
        if (this.open && index === -1) {
            openedLfgs.push(lfgId);
        }
        else if (!this.open && index !== -1) {
            openedLfgs.splice(index, 1);
        }
    }

    function refresh() {
        initVariables();
        loadState();
        
        lfgs.forEach(l => l.addEventListener('toggle', lfgDetailsToggleHandler));
    }

    function loadState() {
        sortLfgs(null, false);
        filterLfgs(null, false);

        lfgs.forEach(l => l.open = openedLfgs.indexOf(l.dataset.lfgId) !== -1);
        openedLfgs = openedLfgs.filter(o => lfgs.some(l => l.dataset.lfgId === o));
    }

    // register event handlers
    sortSelect.addEventListener('change', sortLfgs);
    searchMessageInput.addEventListener('input', filterLfgs);
    lfgs.forEach(l => l.addEventListener('toggle', lfgDetailsToggleHandler));
    content.addEventListener('contentUpdated', refresh);

    clearNavigationButton.addEventListener('click', function() {
        searchInputs.forEach(e => e.value = '');
        sortSelect.selectedIndex = defaultSelectIndex;

        sortLfgs(null, true);
        filterLfgs(null, true);
    });

    // restore session data
    searchInputs.forEach(e => e.value = loadData(e) ?? e.value);
    sortSelect.selectedIndex = loadData(sortSelect) ?? sortSelect.selectedIndex;

    loadState();

})();