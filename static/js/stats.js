(function() {

    const canvas = document.getElementById('chart');
	const ctx = canvas.getContext('2d');
    const autoupdateCheckbox = document.getElementById('autoupdateCheck');
    const checkboxes = [autoupdateCheckbox];

	// TODO: move to CSS?
	const fontSize = 16;
	const fontFamily = "'Montserrat', sans-serif";
	const fontColor = 'rgba(255, 255, 255, 0.8)';
	const axisColor = 'rgba(255, 255, 255, 0.2)';
	const gridColor = 'rgba(255, 255, 255, 0.1)';
	const barBgColor = 'rgba(86, 136, 92, 0.5)';
	const barBorderColor = 'rgba(255, 255, 255, 0.3)';
	const title = canvas.dataset.title;
	const labels = canvas.dataset.labels.split(',');
	const values = canvas.dataset.values.split(',');

	Chart.defaults.color = fontColor;
	Chart.defaults.font.size = fontSize;
	Chart.defaults.font.family = fontFamily;

	document.fonts.ready.then(function() {
		new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [{
					label: title,
					backgroundColor: barBgColor,
					borderColor: barBorderColor,
					borderWidth: 1,
					data: values
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
						}
					},
					y: {
						grid: {
							color: gridColor
						},
						border: {
							color: axisColor
						}
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