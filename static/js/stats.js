let MyCharts;
(function() {

    const content = document.getElementById('content');
    const chartNames = ['classChart', 'guildChart'];
    const charts = [];
    MyCharts = charts;

    class MyChart {
        labels = [];
        values = [];
        styles = {};
        chart = null;
        maxChartLabelWidth = 150;
        chartOptions = {
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0,
                        stepSize: 1
                    }
                },
            },
            plugins: {
                title: {
                    display: true,
                    padding: {
                        top: 0,
                        bottom: 8
                    },
                },
                tooltip: {
                    displayColors: false
                }
            }
        };

        constructor(name) {
            this.name = name;
            this.canvas = document.getElementById(name);
            this.context = this.canvas.getContext('2d');
            this.rootStyles = window.getComputedStyle(document.documentElement);

            this.#setDefaults();
            this.#updateDatasets();
            this.#updateVisibility();
            this.#loadStyles();
            this.initChart();
        }

        initChart() {
            this.chart = new Chart(this.context, {
                type: 'bar',
                data: {
                    labels: this.labels,
                    datasets: [{
                        label: this.canvas.dataset.barLabel,
                        borderWidth: 1,
                        data: this.values
                    }]
                },
                options: this.chartOptions
            });
            this.chart.options.plugins.title.text = this.canvas.dataset.title;
            const truncLabel = this.#truncLabel();
            this.chart.options.scales.y.ticks.callback = function (value) {
                const lbl = this.getLabelForValue(value);
                return truncLabel(lbl);
            };
            this.#updateStyles();
            this.#updateHeight();
        }

        updateChartData() {
            this.#updateDatasets();
            this.#updateVisibility();
            this.chart.data.datasets[0].data = this.values;
            this.chart.data.labels = this.labels;
            this.#updateHeight();
        }

        updateStyles() {
            this.#loadStyles();
            this.#updateStyles();
        }

        #updateVisibility() {
            if (this.labels.length > 0 && this.values.length > 0) {
                this.canvas.parentNode.hidden = false;
            }
            else {
                this.canvas.parentNode.hidden = true;
            }
        }

        #updateDatasets() {
            const dataset = document.getElementById(this.name + 'DataContainer').dataset;
            this.labels = dataset.labels?.split(',') ?? [];
            this.values = dataset.values?.split(',') ?? [];
        }

        #updateHeight() {
            this.canvas.parentNode.style.height = `${30 * (this.labels.length) + 65 +50}px`;
            this.chart?.update();
        }

        #setDefaults() {
            Chart.defaults.maintainAspectRatio = false;
            Chart.defaults.plugins.legend.display = false;
            // Chart.defaults.animation.duration = 0;
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
            }
        }

        #updateStyles() {
            if (this.chart == null)
                return;

            this.chart.options.scales.x.grid = {
                color: this.styles.gridColor,
                border: this.styles.axisColor
            }
            this.chart.options.scales.y.grid = {
                color: this.styles.gridColor,
                border: this.styles.axisColor
            }
            this.chart.options.scales.x.ticks.color = this.styles.fontColor;
            this.chart.options.scales.x.ticks.font = {
                size: this.styles.fontSize,
                family: this.styles.fontFamily
            };
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

            this.chart.update();
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
    }


    document.fonts.ready.then(() => {
        chartNames.forEach(name => charts.push(new MyChart(name)));
        //charts.forEach(chart => chart.initChart());
    });

    function refreshContent() {
        charts.forEach(chart => chart.updateChartData());
        // initVariables();
        // loadState();
    }

    function refreshStyle() {
        setTimeout(() => charts.forEach(chart => chart.updateStyles()), 100);
    }

    // register event handlers
    content.addEventListener('contentUpdated', refreshContent);
    document.addEventListener('styleChanged', refreshStyle);

    // restore session data

})();