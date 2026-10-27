(function () {
  const names = {Russia: 'Russian Federation', Iran: 'Iran, Islamic Republic of'};
  window.connectChartLegend = function (chartId, view, signal, categoryMode) {
    const section = document.getElementById(chartId).closest('.chart-block');
    const legend = section.querySelector('.country-legend');
    if (!legend) return;
    const buttons = Array.from(legend.querySelectorAll('li')).map(function (item) {
      const button = document.createElement('button');
      button.type = 'button';
      while (item.firstChild) button.appendChild(item.firstChild);
      item.appendChild(button);
      const label = button.textContent.trim();
      button.dataset.value = names[label] || label;
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', function () {
        const value = view.signal(signal) === button.dataset.value ? (categoryMode ? 'All sectors' : '') : button.dataset.value;
        view.signal(signal, value).runAsync().catch(console.error);
      });
      return button;
    });
    function sync(value) {
      buttons.forEach(function (button) {
        const active = button.dataset.value === value;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('legend-muted', !!value && value !== 'All sectors' && !active);
      });
    }
    view.addSignalListener(signal, function (_, value) { sync(value); });
    sync(view.signal(signal));
  };
}());
