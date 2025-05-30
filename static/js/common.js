(function() {

    const styleLink = document.getElementById('styleLink');
    const themeColor = document.getElementById('themeColor');
    const navbarBgColors = {
        'dark-green': 'rgb(21, 22, 30)',
        'violet': 'rgb(38, 33, 48)',
        'dark': '#1A1A1A',
        'light': '#ffffff',
        'classic-light': 'rgb(169, 180, 214)'
    };

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

        styleLink.href = `/static/css/${theme}.css`;
        themeColor.content = navbarBgColors[theme];
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
    });

    styleLink.dataset.value = loadData(styleLink, false) ?? styleLink.dataset.value;
    updateTheme(false);

    window.saveData = saveData;
    window.loadData = loadData;
    window.checkLevel = checkLevel;

    window.String.prototype.customSplitFilter = customSplitFilter;
    window.Array.prototype.customSomeFilter = customSomeFilter;

})();