(function() {

    const autoupdateCheckbox = document.getElementById('autoupdateCheck');
    const content = document.getElementById('content');
    const checkboxes = [autoupdateCheckbox];

    let lfgList, lfgs;
    let openedLfgs = [];

    initVariables();

    function initVariables() {
        lfgList = document.getElementById('lfgList');
        lfgs = Array.from(lfgList.getElementsByClassName('lfg-details'));
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
        lfgs.forEach(l => l.open = openedLfgs.indexOf(l.dataset.lfgId) !== -1);
        openedLfgs = openedLfgs.filter(o => lfgs.some(l => l.dataset.lfgId === o));
    }

    // register event handlers
    autoupdateCheckbox.addEventListener('change', setAutoupdate);
    content.addEventListener('contentUpdated', refresh);
    lfgs.forEach(l => l.addEventListener('toggle', lfgDetailsToggleHandler));

    // restore session data
    checkboxes.forEach(e => {
        const checked = loadData(e);
        if (checked != null)
            e.checked = checked === 'true';
    });

    loadState();
    setAutoupdate(null, false, autoupdateCheckbox);

})();