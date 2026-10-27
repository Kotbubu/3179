// One year control updates two independent Vega-Lite maps.
Promise.all([
  vegaEmbed('#map1', 'ghg_emissions_concentration_total.vg.json?v=manrope-20261025', {renderer: 'svg', actions: false}),
  fetch('data/continent_map_annotations.json').then(response => { if (!response.ok) throw new Error('Regional notes could not load'); return response.json(); }),
  vegaEmbed('#map-per-capita', 'ghg_emissions_concentration_per_person.vg.json?v=manrope-20261025', {renderer: 'svg', actions: false})
]).then(loaded => {
  const results = [loaded[0], loaded[2]];
  const regionalRows = loaded[1];
  function updateRegionalFindings(year) {
    const rows = regionalRows.filter(row => row.year === year);
    const totals = rows.slice().sort((a,b) => b.share-a.share);
    const averages = rows.filter(row => row.per_person !== null).sort((a,b) => b.per_person-a.per_person);
    const totalNote = document.getElementById('map-region-finding-0');
    const personNote = document.getElementById('map-region-finding-1');
    // Values and region names come only from the locally generated dataset.
    const lines = [
      `${totals[0].region} and ${totals[1].region} together account for`,
      `${((totals[0].share+totals[1].share)*100).toFixed(1)}% of mapped emissions in ${year}.`
    ];
    const highest=averages[0], lowest=averages[averages.length-1];
    const personLines = [
      `${highest.region} has the highest regional emissions per person.`,
      `It is ${(highest.per_person/lowest.per_person).toFixed(1)} times ${lowest.region}’s average.`
    ];
    [[totalNote,lines],[personNote,personLines]].forEach(([element,values]) => {
      element.replaceChildren();
      values.forEach((value,index) => {
        if(index) element.appendChild(document.createElement('br'));
        element.appendChild(document.createTextNode(value));
      });
    });
  }
  updateRegionalFindings(Number(document.querySelector('.map-year-slider').value));
  function fitWorldMaps() {
    ['map1', 'map-per-capita'].forEach((id, index) => {
      const width = document.getElementById(id).clientWidth;
      results[index].view.height(Math.max(180, Math.min(390, width * 0.49))).resize().runAsync().catch(console.error);
    });
  }
  fitWorldMaps();
  window.addEventListener('resize', fitWorldMaps);
  const sliders = document.querySelectorAll('.map-year-slider');
  sliders.forEach(slider => slider.addEventListener('input', () => {
    const year = Number(slider.value);
    sliders.forEach(control => { control.value = year; });
    document.querySelectorAll('.map-year-stat').forEach(label => { label.textContent = year; });
    document.getElementById('selected-year').textContent = year;
    results.forEach(({view}) => view.signal('Year_selection', year).runAsync().catch(console.error));
    updateChartInsight('map', year);
    updateRegionalFindings(year);
  }));
}).catch(console.error);
vegaEmbed('#map-key-0','map_total_key.vg.json?v=manrope-20261025',{renderer:'svg',actions:false}).catch(console.error);
vegaEmbed('#map-key-1','map_person_key.vg.json?v=manrope-20261025',{renderer:'svg',actions:false}).catch(console.error);
