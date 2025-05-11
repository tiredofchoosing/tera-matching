(function() {

    const canvas1 = document.getElementById('chart_class');
    const canvas2 = document.getElementById('chart_guild');
	const ctx1 = canvas1.getContext('2d');
	const ctx2 = canvas2.getContext('2d');
    const autoupdateCheckbox = document.getElementById('autoupdateCheck');
    const checkboxes = [autoupdateCheckbox];
	const charts = [[ctx1, canvas1], [ctx2, canvas2]];

	// TODO: move to CSS?
	const fontSize = 16;
	const fontFamily = "'Montserrat', sans-serif";
	const fontColor = 'rgba(255, 255, 255, 0.8)';
	const axisColor = 'rgba(255, 255, 255, 0.2)';
	const gridColor = 'rgba(255, 255, 255, 0.1)';
	const barBgColor = 'rgba(86, 136, 92, 0.5)';
	const barBorderColor = 'rgba(255, 255, 255, 0.3)';

	Chart.defaults.color = fontColor;
	Chart.defaults.font.size = fontSize;
	Chart.defaults.font.family = fontFamily;

	document.fonts.ready.then(function() {
		charts.forEach(c => {
			const [ctx, canvas] = c;
			new Chart(ctx, {
				type: 'bar',
				data: {
					labels: canvas.dataset.labels.split(','),
					datasets: [{
						label: canvas.dataset.title,
						backgroundColor: barBgColor,
						borderColor: barBorderColor,
						borderWidth: 1,
						data: canvas.dataset.values.split(',')
					}]
				},
				options: {
					indexAxis: 'y',
					maintainAspectRatio: false,
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
									if (typeof lbl === 'string' && lbl.length > 14) {
										return `${lbl.substring(0, 14)}...`;
									}
									return lbl;
								},
							},
						}
					},
					animation: {
						duration: 0
					},
					plugins: {
						legend: {
							display: false
						},
					},
				}
			});
		});
	});

    // register event handlers
    autoupdateCheckbox.addEventListener('change', setAutoupdate);

    // restore session data
    checkboxes.forEach(e => {
        let checked = loadData(e);
        if (checked != null)
            e.checked = checked === 'true';
    });
    setAutoupdate(null, false, autoupdateCheckbox);

})();