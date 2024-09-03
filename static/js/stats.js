(function() {

    const canvas = document.getElementById('chart');
	const ctx = canvas.getContext('2d');
    const autoupdateCheckbox = document.getElementById('autoupdateCheck');
    const checkboxes = [autoupdateCheckbox];

	const fontSize = 14;
	const fontColor = 'rgba(255, 255, 255, 0.7)';
	const axisColor = 'rgba(255, 255, 255, 0.2)';
	const gridColor = 'rgba(255, 255, 255, 0.1)';

	const myChart = new Chart(ctx, {
		type: 'horizontalBar',
		data: {
			labels: canvas.dataset.labels.split(','),
			datasets: [{
				label: 'Players',
				backgroundColor: 'rgba(64, 106, 76, 0.7)',
				borderColor: 'rgba(255, 255, 255, 0.5)',
				data: canvas.dataset.values.split(',')
			}]
		},
		options: {
			legend: {
				labels: {
					fontColor: fontColor,
					fontSize: fontSize
				}
			},
			scales: {
				xAxes: [{
					ticks: {
						beginAtZero: true,
						fontColor: fontColor,
						fontSize: fontSize
                	},
					gridLines:{
						color: gridColor,
						zeroLineColor: axisColor
					}
				}],
				yAxes: [{
					ticks: {
						fontColor: fontColor,
						fontSize: fontSize
                	},
					gridLines:{
						color: gridColor,
						zeroLineColor: axisColor
					}
				}]
			},
			maintainAspectRatio: false,
			animation: {
				duration: 0
			}
		}
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