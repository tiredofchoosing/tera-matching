let MyCharts;
(function() {

    const content = document.getElementById('content');
    const chartNames = ['classChart', 'guildChart'];
    const charts = [];
    MyCharts = charts;

    class MyChart {
        labels = [];
        values = [];
        chart = null;
        chartOptions = {
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor
                    },
                    border: {
                        color: axisColor
                    },
                    ticks: {
                        precision: 0,
                        stepSize: 1
                    }
                },
                y: {
                    grid: {
                        color: gridColor
                    },
                    border: {
                        color: axisColor
                    },
                    ticks: {
                        callback: function (value) {
                            const lbl = this.getLabelForValue(value);
                            if (typeof lbl === 'string' && lbl.length > 13) {
                                return `${lbl.substring(0, 12)}...`;
                            }
                            return lbl;
                        },
                    },
                }
            }
        };

        constructor(name) {
            this.#setDefaults();
            this.name = name;
            this.canvas = document.getElementById(name);
            this.context = this.canvas.getContext('2d');

            this.#updateDatasets();
            this.#toggleVisibility();
        }

        initChart() {
            this.chart = new Chart(this.context, {
                type: 'bar',
                data: {
                    labels: this.labels,
                    datasets: [{
                        label: this.canvas.dataset.barLabel,
                        backgroundColor: barBgColor,
                        borderColor: barBorderColor,
                        borderWidth: 1,
                        data: this.values
                    }]
                },
                options: this.chartOptions
            });
            this.#updateHeight();
        }
        updateChartData() {
            this.#updateDatasets();
            this.#toggleVisibility();
            this.chart.data.datasets[0].data = this.values;
            this.chart.data.labels = this.labels;
            this.#updateHeight();
        }
        #toggleVisibility() {
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
            this.canvas.parentNode.style.height = `${35 * (this.labels.length + 1)}px`;
            this.chart?.update();
        }
        #setDefaults() {
            Chart.defaults.color = fontColor;
            Chart.defaults.font.size = fontSize;
            Chart.defaults.font.family = fontFamily;
            Chart.defaults.maintainAspectRatio = false;
            // Chart.defaults.animation.duration = 0;
            Chart.defaults.plugins.legend.display = false;
        }
    }

    // TODO: move to CSS?
    const fontSize = 16;
    const fontFamily = "'Montserrat', sans-serif";
    const fontColor = 'rgba(255, 255, 255, 0.8)';
    const axisColor = 'rgba(255, 255, 255, 0.2)';
    const gridColor = 'rgba(255, 255, 255, 0.1)';
    const barBgColor = 'rgba(86, 136, 92, 0.5)';
    const barBorderColor = 'rgba(255, 255, 255, 0.3)';

    chartNames.forEach(name => charts.push(new MyChart(name)));

    document.fonts.ready.then(() => {
        charts.forEach(chart => chart.initChart());
    });

    function refresh() {
        charts.forEach(chart => chart.updateChartData());
        // initVariables();
        // loadState();
    }

    // register event handlers
    content.addEventListener('contentUpdated', refresh);

    // restore session data

})();