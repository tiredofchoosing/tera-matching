(function() {

    const cssVer = 'min.css?v=0.3.2';
    const styleLink = document.getElementById('styleLink');
    const themeColor = document.getElementById('themeColor');
    const navbarBgColors = {
        'dark-green': 'rgb(21, 22, 30)',
        'violet': 'rgb(38, 33, 48)',
        'burgundy': 'rgb(54, 26, 32)',
        'dark': '#1A1A1A',
        'light': '#ffffff',
        'classic-light': 'rgb(169, 180, 214)'
    };
    const styleChangedEvent = new CustomEvent('styleChanged');
    const pinchDelta = 30;
    const pinchSaveId = 'pinchContent';
    const pinchFontSizes = [ 13, 14, 16 ];

    let pinchInitDist = 0;
    let pinchCurrentIndex = -1;

    function saveData(element, value = null, forSession = true) {
        const storage = forSession ? window.sessionStorage : window.localStorage;
        if (storage) {
            const id = typeof(element) === 'string' ? element : element.id;
            if (value != null)
                storage.setItem(id, value);
            else
                storage.removeItem(id);
        }
    }

    function loadData(element, forSession = true) {
        const storage = forSession ? window.sessionStorage : window.localStorage;
        if (storage) {
            const id = typeof(element) === 'string' ? element : element.id;
            return storage.getItem(id);
        }
        return null;
    }

    function checkLevel(level, searchVal) {
        if (searchVal === '') {
            return true;
        } else if (searchVal.match(/^[\d]+[\s]*[\+]$/g)) {
            return level >= parseInt(searchVal);
        } else if (searchVal.match(/^[\d]+[\s]*[\-]$/g)) {
            return level <= parseInt(searchVal);
        } else if (searchVal.match(/^[\d]+[\s]*[\-][\s]*[\d]+$/g)) {
            const [min, max] = searchVal.split('-').map(Number);
            return level >= min && level <= max;
        } else {
            return level === parseInt(searchVal);
        }
    }

    function updateTheme(save = true) {
        const theme = styleLink.dataset.value;
        save && saveData(styleLink, theme, false);

        styleLink.href = `/static/css/${theme}.${cssVer}`;
        themeColor.content = navbarBgColors[theme];
        document.dispatchEvent(styleChangedEvent);
    }

    function updateContentFontSize() {
        if (pinchCurrentIndex !== -1) {
            const content = document.getElementById('content');
            const newFontClass = `font-size-${pinchFontSizes[pinchCurrentIndex]}`;
            const classes = Array.from(content.classList).filter(c => c.startsWith('font-size-'));
            content.classList.remove(classes);
            content.classList.add(newFontClass);
        }
    }

    function customSplitFilter(splitChar) {
        return this.toLowerCase().split(splitChar).map(s => s.trim()).filter(Boolean);
    }

    function customSomeFilter(filterFunc) {
        return this.length === 0 || this.some(filterFunc);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const themeSelectForm = document.getElementById('themeSelect');
        themeSelectForm.elements['themeOption'].value = styleLink.dataset.value;

        themeSelectForm.addEventListener('change', function () {
            const theme = this.elements['themeOption'].value;
            styleLink.dataset.value = theme;
            updateTheme();
        });

        updateContentFontSize();

        const body = document.body;

        // change font size on touch pinch
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

                if (Math.abs(distance - pinchInitDist) < pinchDelta)
                    return;

                let index = pinchCurrentIndex;
                if (index === -1) {
                    const content = document.getElementById('content');
                    const currentSize = parseInt(window.getComputedStyle(content).fontSize);
                    index = pinchFontSizes.indexOf(currentSize);
                }

                let newIndex;
                if (distance - pinchInitDist >= pinchDelta) {
                    newIndex = Math.min(index + 1, pinchFontSizes.length - 1);
                }
                else if (pinchInitDist - distance >= pinchDelta) {
                    newIndex = Math.max(index - 1, 0);
                }

                pinchInitDist = distance;
                if (newIndex === index)
                    return;

                pinchCurrentIndex = newIndex;
                saveData(pinchSaveId, pinchCurrentIndex, false);
                updateContentFontSize();
            }
        });

        body.addEventListener('touchend', function(e) {
            if (e.touches.length < 2) {
                pinchInitDist = 0;
            }
        });
    });

    pinchCurrentIndex = loadData(pinchSaveId, false) ?? pinchCurrentIndex;
    styleLink.dataset.value = loadData(styleLink, false) ?? styleLink.dataset.value;
    updateTheme(false);

    window.saveData = saveData;
    window.loadData = loadData;
    window.checkLevel = checkLevel;

    window.String.prototype.customSplitFilter = customSplitFilter;
    window.Array.prototype.customSomeFilter = customSomeFilter;

})();