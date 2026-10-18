import { disposeChart, resizeChart } from './echartsLifecycle';

const fakeChart = (overrides = {}) => ({
  isDisposed: () => false,
  resize: jest.fn(),
  dispose: jest.fn(),
  ...overrides
});

test('does not resize a chart whose element has no size (e.g. while leaving the page)', () => {
  const chart = fakeChart();
  resizeChart(chart, { clientWidth: 0, clientHeight: 0 });
  expect(chart.resize).not.toHaveBeenCalled();

  resizeChart(chart, { clientWidth: 800, clientHeight: 400 });
  expect(chart.resize).toHaveBeenCalledTimes(1);
});

test('a chart that throws while being disposed does not crash the page', () => {
  const chart = fakeChart({ dispose: jest.fn(() => { throw new Error("Failed to execute 'drawImage'"); }) });
  expect(() => disposeChart(chart)).not.toThrow();
  expect(() => resizeChart(fakeChart({ resize: () => { throw new Error('x'); } }), { clientWidth: 1, clientHeight: 1 })).not.toThrow();
});
