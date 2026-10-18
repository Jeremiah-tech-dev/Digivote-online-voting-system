// Safe resize and dispose for ECharts instances.
//
// When a page is left, its charts are removed. A chart whose element has
// shrunk to 0×0 throws while it repaints (especially with animated trail
// effects), and an error thrown during React's cleanup blanks the whole page.

export const resizeChart = (chart, element) => {
  if (!chart || chart.isDisposed() || !element) return;
  if (element.clientWidth === 0 || element.clientHeight === 0) return; // hidden or being removed
  try {
    chart.resize();
  } catch (error) {
    // A failed repaint mid-resize isn't worth breaking the page over
  }
};

export const disposeChart = (chart) => {
  if (!chart || chart.isDisposed()) return;
  try {
    chart.dispose();
  } catch (error) {
    // The chart is being thrown away anyway
  }
};
