// One year control updates two independent Vega-Lite maps.
Promise.all([
  vegaEmbed('#map1', 'ghg_emissions_concentration_total.vg.json', {renderer: 'svg', actions: false}),
  vegaEmbed('#map-per-capita', 'ghg_emissions_concentration_per_person.vg.json', {renderer: 'svg', actions: false})
]).then(results => {
  const slider = document.getElementById('map-year');
  slider.addEventListener('input', () => {
    const year = Number(slider.value);
    document.getElementById('map-year-value').textContent = year;
    document.getElementById('selected-year').textContent = year;
    document.querySelectorAll('.map-title-year').forEach(label => { label.textContent = year; });
    results.forEach(({view}) => view.signal('Year_selection', year).runAsync().catch(console.error));
    updateChartInsight('map', year);
  });
}).catch(console.error);
