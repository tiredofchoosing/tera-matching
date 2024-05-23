const storage = window.sessionStorage; // || window.localStorage;
const autoupdateTimer = 10000;
const styleLink = document.getElementById('styleLink');

let autoupdateTimerId = -1;

function saveData(element, value = null) {
    if (storage) {
        let id = typeof(element) === 'string' ? element : element.id;
        if (value != null)
            storage.setItem(id, value);
        else
            storage.removeItem(id);
    }
}

function loadData(element) {
    if (storage) {
        let id = typeof(element) === 'string' ? element : element.id;
        return storage.getItem(id);
    }
    return null;
}

function checkLevel(level, searchVal) {
    if (searchVal === '') {
        return true;
    } else if (searchVal.endsWith('+')) {
        return level >= parseInt(searchVal);
    } else if (searchVal.endsWith('-')) {
        return level <= parseInt(searchVal);
    } else if (searchVal.includes('-')) {
        let [min, max] = searchVal.split('-').map(Number);
        return level >= min && level <= max;
    } else {
        return level === parseInt(searchVal);
    }
}

function setAutoupdate(_, save = true, elem = null) {
    elem = elem ?? this;
    save && saveData(elem, elem.checked);

    if (elem.checked) {
        autoupdateTimerId = setTimeout(() => location.reload(), autoupdateTimer);
    }
    else if (autoupdateTimerId !== -1) {
        clearTimeout(autoupdateTimerId);
        autoupdateTimerId = -1;
    }
}

function toggleLang() {
    let lang = this.value === 'ru' ? 'en' : 'ru';
    let date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    document.cookie = `lang=${lang};expires=${date.toUTCString()};path=/;`;
    location.reload();
}

function toggleStyle() {
    let styles = [ 'dark-green', 'classic-light' ];
    let newStyle = styles[(styles.indexOf(styleLink.dataset.value) - 1 + styles.length) % styles.length];
    styleLink.href = `/static/css/${newStyle}.css`
    styleLink.dataset.value = newStyle;
    saveData(styleLink, newStyle);
}

document.addEventListener("readystatechange", (event) => {
    if (event.target.readyState === "interactive") {
        const checkboxes = Array.from(document.getElementsByClassName('form-check-input'));
        checkboxes.forEach(e => e.classList.add('no-transition'));
        
        document.getElementById('toggleLang').addEventListener('click', toggleLang);
        document.getElementById('toggleStyle').addEventListener('click', toggleStyle);
    }
    else if (event.target.readyState === 'complete') {
        let checkboxes = Array.from(document.getElementsByClassName('form-check-input'));
        checkboxes.forEach(e => e.classList.remove('no-transition'));
    }
});

let style = loadData(styleLink);
if (style != null) {
    styleLink.href = `/static/css/${style}.css`;
    styleLink.dataset.value = style;
}