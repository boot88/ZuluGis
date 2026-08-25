import { DEMO_DATA, filterFeatureCollection, getStatistics } from './demoData';

test('demo contains points, lines and polygons', () => {
  const geometries = new Set(DEMO_DATA.features.map((feature) => feature.geometry.type));
  expect(geometries).toEqual(new Set(['Point', 'LineString', 'Polygon']));
});

test('filters features by category and search text', () => {
  const result = filterFeatureCollection(DEMO_DATA, {
    search: 'лицей', category: 'education', status: 'all', geometry: 'all',
  });
  expect(result.features).toHaveLength(1);
  expect(result.features[0].id).toBe('school-01');
});

test('builds dataset statistics', () => {
  const statistics = getStatistics(DEMO_DATA);
  expect(statistics.total).toBe(DEMO_DATA.features.length);
  expect(statistics.byGeometry.Point).toBeGreaterThan(0);
  expect(statistics.byStatus.active).toBeGreaterThan(0);
});
