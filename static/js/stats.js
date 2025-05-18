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
            this.updateStyles();
            this.#updateHeight();
        }

        updateChartData() {
            this.#updateDatasets();
            this.#updateVisibility();
            this.chart.data.datasets[0].data = this.values;
            this.chart.data.labels = this.labels;
            this.#updateHeight();
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

        updateStyles() {
            if (this.chart == null)
                return;

            const fontColor = this.rootStyles.getPropertyValue('--chart-font-color').trim();
            const fontFamily = this.rootStyles.getPropertyValue('--chart-font-family').trim();
            const fontSize = this.rootStyles.getPropertyValue('--chart-font-size').trim();
            const titleFontSize = this.rootStyles.getPropertyValue('--chart-title-font-size').trim();
            const axisColor = this.rootStyles.getPropertyValue('--chart-axis-color').trim();
            const gridColor = this.rootStyles.getPropertyValue('--chart-grid-color').trim();
            const barBgColor = this.rootStyles.getPropertyValue('--chart-bar-bg-color').trim();
            const barBorderColor = this.rootStyles.getPropertyValue('--chart-bar-border-color').trim();

            this.chart.options.scales.x.grid = {
                color: gridColor,
                border: axisColor
            }
            this.chart.options.scales.y.grid = {
                color: gridColor,
                border: axisColor
            }
            this.chart.options.scales.x.ticks.color = fontColor;
            this.chart.options.scales.x.ticks.font = {
                size: fontSize,
                family: fontFamily
            };
            this.chart.options.scales.y.ticks.color = fontColor;
            this.chart.options.scales.y.ticks.font = {
                size: fontSize,
                family: fontFamily
            };

            this.chart.options.plugins.title.color = fontColor;
            this.chart.options.plugins.title.font = {
                size: titleFontSize,
                family: fontFamily
            };

            this.chart.data.datasets[0].backgroundColor = barBgColor;
            this.chart.data.datasets[0].borderColor = barBorderColor;

            this.styles.fontSize = fontSize;
            this.styles.fontFamily = fontFamily;

            this.chart.update();
        }

        #truncLabel() {
            const fontSize = this.styles.fontSize;
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
        charts.forEach(chart => chart.updateStyles());
    }

    // register event handlers
    content.addEventListener('contentUpdated', refreshContent);
    document.addEventListener('styleChanged', refreshStyle);

    // restore session data

})();