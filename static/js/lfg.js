(function() {

    const autoupdateCheckbox = document.getElementById('autoupdateCheck');
    const content = document.getElementById('content');
    const checkboxes = [autoupdateCheckbox];

    function initVariables() {
    }

    function refresh() {
        initVariables();
        loadState();
    }

    function loadState() {
    }

    // register event handlers
    autoupdateCheckbox.addEventListener('change', setAutoupdate);
    content.addEventListener('contentUpdated', refresh);

    // restore session data
    checkboxes.forEach(e => {
        const checked = loadData(e);
        if (checked != null)
            e.checked = checked === 'true';
    });

    loadState();
    setAutoupdate(null, false, autoupdateCheckbox);

})();