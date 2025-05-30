(function() {

    const autoupdateCheckbox = document.getElementById('autoupdateCheck');
    const blurBackgroundCheckbox = document.getElementById('blurBackground');
    const background = document.getElementById('background');
    const switchLangButton = document.getElementById('switchLang');
    const offcanvasElement = document.getElementById('offcanvasRight');
    const offcanvasInstance = bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);
    const filter = document.getElementById('filterContent');
    const filterContainer = document.getElementById('filterContainer');
    const offcanvasFilterContainer = offcanvasElement.querySelector('#offcanvasFilterContainer');

    const checkboxes = [autoupdateCheckbox, blurBackgroundCheckbox];
    const autoupdateTimer = 5000;
    const updateEvent = new CustomEvent('contentUpdated');

    let autoupdateTimerId = -1;
    let eTag = '';

    // functions
    async function updatePageContent() {
        try {
            const path = window.location.pathname;
            const partialPath = '/partial' + path;
            const response = await fetch(partialPath, {
                headers: {
                    'If-None-Match': eTag
                }
            });

            if (!(response && (response.ok || response.status === 304)))
                throw `Request failed for '${partialPath}' with status: ${response?.status}`;

            eTag = response.headers.get('ETag');
            if (response.status === 304)
                return;

            const html = await response.text();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            const updated = [];
            tempDiv.childNodes.forEach(e => {
                if (e.firstChild) {
                    const mainContent = document.getElementById(e.id);
                    mainContent.innerHTML = e.innerHTML;
                    updated.push(mainContent);
                }
            });
            
            if (updated.length > 0)
                return updated;

            console.warn('Partial update failed: no items have been updated.');
            return null;
        }
        catch (err) {
            console.warn('Partial update failed:', err);
            return null;
        }
    }

    function setAutoupdate(_, save = true) {
        const elem = autoupdateCheckbox;
        save && saveData(elem, elem.checked, false);

        if (elem.checked) {
            autoupdateTimerId = setTimeout(async () => {
                const updated = await updatePageContent();
                if (updated && updated.length > 0) {
                    updated.forEach(e => e.dispatchEvent(updateEvent));
                }
                setAutoupdate(null, false);
            }, autoupdateTimer);
        }
        else if (autoupdateTimerId !== -1) {
            clearTimeout(autoupdateTimerId);
            autoupdateTimerId = -1;
        }
    }

    function blurBackground(_, save = true) {
        const elem = blurBackgroundCheckbox;
        save && saveData(elem, elem.checked, false);

        const className = 'blurred';
        if (elem.checked && !background.classList.contains(className)) {
            background.classList.add(className);
        }
        else if (!elem.checked && background.classList.contains(className)) {
            background.classList.remove(className);
        }
    }

    function switchLang() {
        const lang = this.value === 'ru' ? 'en' : 'ru';
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        document.cookie = `lang=${lang};expires=${date.toUTCString()};path=/;`;
        location.reload();
    }

    function checkCloseOffcanvas() {
        if (window.innerWidth >= 992 && offcanvasElement.classList.contains('show')) {
            // disable closing animation on resize
            offcanvasElement.classList.add('no-transition');
            offcanvasInstance.hide();
            setTimeout(() => offcanvasElement.classList.remove('no-transition'), 0);
        }
    }

    function checkMoveFilter() {
        const isMobile = window.innerWidth < 992;

        if (isMobile && filter.parentNode !== offcanvasFilterContainer) {
            offcanvasFilterContainer.appendChild(filter);
        }
        else if (!isMobile && filter.parentNode === offcanvasFilterContainer) {
            filterContainer.appendChild(filter);
        }
    }

    function resizeHandler() {
        checkCloseOffcanvas();
        checkMoveFilter();
    }

    // register event handlers
    autoupdateCheckbox.addEventListener('change', setAutoupdate);
    blurBackgroundCheckbox.addEventListener('change', blurBackground);
    switchLangButton.addEventListener('click', switchLang);
    window.addEventListener('resize', resizeHandler);

    // restore session data
    checkboxes.forEach(e => {
        const checked = loadData(e, false);
        if (checked != null)
            e.checked = checked === 'true';
    });

    blurBackground(null, false);
    checkMoveFilter();
    setAutoupdate(null, false);

})();