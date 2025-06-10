(function() {

    const hideNoGuildCheckbox = document.getElementById('hideNoGuild');
    const sortSelect = document.getElementById('selectStatsSort');
    const clearNavigationButton = document.getElementById('clearNavigation');
    const content = document.getElementById('content');
    const checkboxes = [hideNoGuildCheckbox];
    const selects = [sortSelect];

    const chartNames = ['classChart', 'guildChart'];
    const charts = [];
    const defaultSelectIndex = 0;

    class MyChart {
        chart = null;
        initData = [];
        labels = [];
        values = [];
        styles = {};
        chartOptions = {};
        maxChartLabelWidth = 150;
        disableFirstValue = false;
        sortingCriteria = 'default';

        constructor(name) {
            this.name = name;
            this.canvas = document.getElementById(name);
            this.context = this.canvas.getContext('2d');
            this.rootStyles = window.getComputedStyle(document.documentElement);

            this.refreshDatasets();
            this.#updateVisibility();
            this.#loadStyles();
            this.#initOptions();
            this.#updateHeight();
            //this.initChart();
        }

        initChart() {
            if (this.chart != null)
                return;

            this.chart = new Chart(this.context, {
                type: 'bar',
                data: {
                    labels: this.labels,
                    datasets: [{
                        data: this.values,
                        label: this.canvas.dataset.barLabel,
                        borderWidth: 1,
                        backgroundColor: this.styles.barBgColor,
                        borderColor: this.styles.barBorderColor
                    }]
                },
                options: this.chartOptions
            });
        }

        refreshDatasets() {
            const dataset = document.getElementById(this.name + 'DataContainer').dataset;

            const labels = dataset.labels?.split(',') ?? [];
            const values = dataset.values?.split(',') ?? [];

            this.labels = labels;
            this.values = values;
            this.initData = labels.map((label, i) => ({
                label: label,
                value: values[i]
            }));
        }

        updateChartData() {
            this.#filterAndSortData();
            this.#updateVisibility();
            this.#updateHeight();

            if (this.chart == null)
                return;

            this.chart.data.datasets[0].data = this.values;
            this.chart.data.labels = this.labels;
            this.chart.update();
        }

        updateStyles() {
            if (this.chart == null)
                return;

            this.#loadStyles();
            this.#updateStyles();

            this.chart.update();
        }

        #initOptions() {
            Chart.defaults.maintainAspectRatio = false;
            Chart.defaults.plugins.legend.display = false;
            // Chart.defaults.animation.duration = 0;

            const truncLabel = this.#truncLabel();
            const callback = function (value) {
                const lbl = this.getLabelForValue(value);
                return truncLabel(lbl);
            };
            this.chartOptions = {
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: this.styles.gridColor
                        },
                        border: {
                            color: this.styles.axisColor
                        },
                        ticks: {
                            precision: 0,
                            stepSize: 1,
                            color: this.styles.fontColor,
                            font: {
                                size: this.styles.fontSize,
                                family: this.styles.fontFamily
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: this.styles.gridColor
                        },
                        border: {
                            color: this.styles.axisColor
                        },
                        ticks: {
                            color: this.styles.fontColor,
                            font: {
                                size: this.styles.fontSize,
                                family: this.styles.fontFamily
                            },
                            callback: callback
                        }
                    },
                },
                plugins: {
                    title: {
                        display: true,
                        text: this.canvas.dataset.title,
                        color: this.styles.fontColor,
                        font: {
                            size: this.styles.titleFontSize,
                            family: this.styles.fontFamily,
                            weight: 600
                        },
                        padding: {
                            top: 0,
                            bottom: 8
                        },
                    },
                    tooltip: {
                        displayColors: false,
                        backgroundColor: this.styles.tooltipBgColor,
                        titleColor: this.styles.fontColor,
                        titleFont: {
                            size: this.styles.fontSize,
                            family: this.styles.fontFamily,
                            weight: 600
                        },
                        bodyColor: this.styles.fontColor,
                        bodyFont: {
                            size: this.styles.fontSize,
                            family: this.styles.fontFamily
                        },
                        borderColor: this.styles.tooltipBorderColor,
                        borderWidth: 1
                    }
                }
            };
        }

        #updateVisibility() {
            if (this.labels.length > 0 && this.values.length > 0) {
                this.canvas.parentNode.hidden = false;
            }
            else {
                this.canvas.parentNode.hidden = true;
            }
        }

        #updateHeight() {
            this.canvas.parentNode.style.height = `${30 * (this.labels.length) + 65 +50}px`;
        }

        #loadStyles() {
            this.styles = {
                fontColor: this.rootStyles.getPropertyValue('--chart-font-color').trim(),
                fontFamily: this.rootStyles.getPropertyValue('--chart-font-family').trim(),
                fontSize: this.rootStyles.getPropertyValue('--chart-font-size').trim(),
                titleFontSize: this.rootStyles.getPropertyValue('--chart-title-font-size').trim(),
                axisColor: this.rootStyles.getPropertyValue('--chart-axis-color').trim(),
                gridColor: this.rootStyles.getPropertyValue('--chart-grid-color').trim(),
                barBgColor: this.rootStyles.getPropertyValue('--chart-bar-bg-color').trim(),
                barBorderColor: this.rootStyles.getPropertyValue('--chart-bar-border-color').trim(),
                tooltipBgColor: this.rootStyles.getPropertyValue('--chart-tooltip-bg-color').trim(),
                tooltipBorderColor: this.rootStyles.getPropertyValue('--chart-tooltip-border-color').trim(),
            }
        }

        #updateStyles() {
            if (this.chart == null)
                return;

            this.chart.options.scales.x.grid.color = this.styles.gridColor;
            this.chart.options.scales.x.border.color = this.styles.axisColor;
            this.chart.options.scales.x.ticks.color = this.styles.fontColor;
            this.chart.options.scales.x.ticks.font = {
                size: this.styles.fontSize,
                family: this.styles.fontFamily
            };
            this.chart.options.scales.y.grid.color = this.styles.gridColor;
            this.chart.options.scales.y.border.color = this.styles.axisColor;
            this.chart.options.scales.y.ticks.color = this.styles.fontColor;
            this.chart.options.scales.y.ticks.font = {
                size: this.styles.fontSize,
                family: this.styles.fontFamily
            };

            this.chart.options.plugins.title.color = this.styles.fontColor;
            this.chart.options.plugins.title.font = {
                size: this.styles.titleFontSize,
                family: this.styles.fontFamily
            };

            this.chart.options.plugins.tooltip.backgroundColor = this.styles.tooltipBgColor;
            this.chart.options.plugins.tooltip.borderColor = this.styles.tooltipBorderColor;
            this.chart.options.plugins.tooltip.titleColor = this.styles.fontColor;
            this.chart.options.plugins.tooltip.titleFont = {
                size: this.styles.fontSize,
                family: this.styles.fontFamily
            };
            this.chart.options.plugins.tooltip.bodyColor = this.styles.fontColor;
            this.chart.options.plugins.tooltip.bodyFont = {
                size: this.styles.fontSize,
                family: this.styles.fontFamily
            };

            this.chart.data.datasets[0].backgroundColor = this.styles.barBgColor;
            this.chart.data.datasets[0].borderColor = this.styles.barBorderColor;
        }

        #truncLabel() {
            const fontSize = this.styles.fontSize + 'px';
            const fontFamily = this.styles.fontFamily;
            const maxChartLabelWidth = Math.min(this.maxChartLabelWidth, Math.floor(this.canvas.offsetWidth / 3));

            return function(text) {
                const span = document.createElement('span');
                span.style.fontSize = fontSize;
                span.style.fontFamily = fontFamily;
                span.style.whiteSpace = 'nowrap';
                span.style.visibility = 'hidden';
                span.style.position = 'absolute';
                document.body.appendChild(span);

                let sub = text;
                let i = 0;
                span.textContent = text;
                while(span.offsetWidth > maxChartLabelWidth) {
                    i++;
                    sub = text.substring(0,text.length - i) + '...';
                    span.textContent = sub;
                }

                document.body.removeChild(span);
                return sub;
            }
        }

        #filterAndSortData() {
            let labels = this.initData.map(d => d.label);
            let values = this.initData.map(d => d.value);
            if (this.disableFirstValue) {
                labels.shift();
                values.shift();
            }

            if (this.sortingCriteria !== 'default') {
                const tempData = labels.map((label, i) => ({
                    label,
                    value: values[i]
                }));

                tempData.sort((a, b) => {
                    const labelA = a.label.toLowerCase();
                    const labelB = b.label.toLowerCase();
                    const valueA = a.value;
                    const valueB = b.value;

                    switch (this.sortingCriteria) {
                        case 'labelDesc':
                            return labelB.localeCompare(labelA);
                        case 'labelAsc':
                            return labelA.localeCompare(labelB);
                        case 'valueDesc':
                            return valueB - valueA;
                        case 'valueAsc':
                            return valueA - valueB;
                    }
                });

                labels = tempData.map(d => d.label);
                values = tempData.map(d => d.value);
            }

            this.labels = labels;
            this.values = values;
        }
    }

    chartNames.forEach(name => charts.push(new MyChart(name)));

    document.fonts.ready.then(() => {
        charts.forEach(chart => chart.initChart());
    });

    function sortCharts(_, save = true) {
        save && saveData(sortSelect, sortSelect.selectedIndex);

        charts.forEach(chart => {
            chart.sortingCriteria = sortSelect.value;
            chart.updateChartData();
        });
    }

    function hideNoGuild(_, save = true) {
        save && saveData(hideNoGuildCheckbox, hideNoGuildCheckbox.checked, false);

        charts[1].disableFirstValue = hideNoGuildCheckbox.checked;
        if (_ != null) {
            // to not call #filterAndSortData twice
            charts[1].updateChartData();
        }
    }

    function refreshContent() {
        charts.forEach(chart => {
            chart.refreshDatasets();
            chart.updateChartData();
        });
        //loadState();
    }

    function loadState() {
        hideNoGuild(null, false);
        sortCharts(null, false);
    }

    function refreshStyle() {
        setTimeout(() => charts.forEach(chart => chart.updateStyles()), 100);
    }

    // register event handlers
    sortSelect.addEventListener('change', sortCharts);
    hideNoGuildCheckbox.addEventListener('change', hideNoGuild);
    content.addEventListener('contentUpdated', refreshContent);
    document.addEventListener('styleChanged', refreshStyle);

    clearNavigationButton.addEventListener('click', function() {
        sortSelect.selectedIndex = defaultSelectIndex;

        sortCharts(null, true);
    });

    // restore session data
    selects.forEach(e => e.selectedIndex = loadData(e) ?? e.selectedIndex);
    checkboxes.forEach(e => {
        const checked = loadData(e, false);
        if (checked != null)
            e.checked = checked === 'true';
    });

    loadState();

})();