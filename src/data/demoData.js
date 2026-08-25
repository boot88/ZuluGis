export const CATEGORY_META = {
  education: { label: 'Образование', color: '#4f46e5', icon: 'ОБ' },
  medicine: { label: 'Медицина', color: '#e11d48', icon: 'МД' },
  transport: { label: 'Транспорт', color: '#d97706', icon: 'ТР' },
  infrastructure: { label: 'Инфраструктура', color: '#0284c7', icon: 'ИН' },
  ecology: { label: 'Экология', color: '#16a34a', icon: 'ЭК' },
  culture: { label: 'Культура', color: '#9333ea', icon: 'КЛ' },
  safety: { label: 'Безопасность', color: '#dc2626', icon: 'БЗ' },
};

export const STATUS_META = {
  active: { label: 'Работает', color: '#15803d' },
  planned: { label: 'Запланирован', color: '#1d4ed8' },
  maintenance: { label: 'Обслуживание', color: '#b45309' },
};

export const FIELD_LABELS = {
  name: 'Название',
  category: 'Категория',
  status: 'Статус',
  code: 'Код объекта',
  address: 'Адрес',
  owner: 'Балансодержатель',
  capacity: 'Вместимость',
  length_km: 'Протяжённость, км',
  area_ha: 'Площадь, га',
  year: 'Год',
  description: 'Описание',
  updated: 'Обновлено',
};

export const DEMO_DATA = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature', id: 'school-01',
      geometry: { type: 'Point', coordinates: [82.9271, 55.0287] },
      properties: { name: 'Инженерный лицей', category: 'education', status: 'active', code: 'EDU-001', address: 'Красный проспект, 52', owner: 'Департамент образования', capacity: 960, year: 2021, description: 'Учебный корпус с инженерными лабораториями и медиатекой.', updated: '2026-08-18' },
    },
    {
      type: 'Feature', id: 'clinic-02',
      geometry: { type: 'Point', coordinates: [82.9012, 55.0419] },
      properties: { name: 'Городская поликлиника № 2', category: 'medicine', status: 'active', code: 'MED-002', address: 'ул. 1905 года, 21', owner: 'Министерство здравоохранения', capacity: 640, year: 2018, description: 'Амбулаторный центр с диагностическим отделением.', updated: '2026-08-21' },
    },
    {
      type: 'Feature', id: 'station-03',
      geometry: { type: 'Point', coordinates: [82.8952, 55.0355] },
      properties: { name: 'Транспортный узел «Вокзальный»', category: 'transport', status: 'maintenance', code: 'TRN-003', address: 'пл. Гарина-Михайловского', owner: 'Городской транспортный центр', capacity: 12000, year: 2024, description: 'Пересадочный узел железнодорожного, автобусного и метрополитена.', updated: '2026-08-22' },
    },
    {
      type: 'Feature', id: 'museum-04',
      geometry: { type: 'Point', coordinates: [82.9206, 55.0304] },
      properties: { name: 'Музей городской истории', category: 'culture', status: 'active', code: 'CUL-004', address: 'Красный проспект, 23', owner: 'Управление культуры', capacity: 420, year: 2016, description: 'Выставочный комплекс с цифровым архивом и лекторием.', updated: '2026-08-12' },
    },
    {
      type: 'Feature', id: 'rescue-05',
      geometry: { type: 'Point', coordinates: [82.9555, 55.0158] },
      properties: { name: 'Аварийно-спасательный пост', category: 'safety', status: 'active', code: 'SAFE-005', address: 'ул. Кирова, 84', owner: 'Городская служба спасения', capacity: 48, year: 2020, description: 'Пункт оперативного реагирования и мониторинга происшествий.', updated: '2026-08-24' },
    },
    {
      type: 'Feature', id: 'bus-route-06',
      geometry: { type: 'LineString', coordinates: [[82.879,55.041],[82.895,55.036],[82.921,55.030],[82.943,55.022],[82.965,55.018]] },
      properties: { name: 'Магистральный автобусный маршрут М6', category: 'transport', status: 'active', code: 'TRN-006', owner: 'Горэлектротранспорт', length_km: 8.4, year: 2025, description: 'Демонстрационный маршрут с пятью ключевыми пересадочными остановками.', updated: '2026-08-20' },
    },
    {
      type: 'Feature', id: 'heat-line-07',
      geometry: { type: 'LineString', coordinates: [[82.907,55.052],[82.918,55.044],[82.934,55.038],[82.949,55.029]] },
      properties: { name: 'Реконструируемая теплотрасса', category: 'infrastructure', status: 'maintenance', code: 'INF-007', owner: 'Городские тепловые сети', length_km: 4.7, year: 2026, description: 'Участок модернизации сетей с поэтапным вводом в эксплуатацию.', updated: '2026-08-25' },
    },
    {
      type: 'Feature', id: 'cycle-route-08',
      geometry: { type: 'LineString', coordinates: [[82.889,55.014],[82.907,55.018],[82.925,55.013],[82.944,55.006]] },
      properties: { name: 'Проект веломаршрута «Набережный»', category: 'ecology', status: 'planned', code: 'ECO-008', owner: 'Центр организации дорожного движения', length_km: 6.2, year: 2027, description: 'Связный маршрут вдоль общественных пространств и рекреационных зон.', updated: '2026-08-16' },
    },
    {
      type: 'Feature', id: 'park-zone-09',
      geometry: { type: 'Polygon', coordinates: [[[82.886,55.016],[82.900,55.011],[82.904,55.000],[82.887,54.998],[82.880,55.008],[82.886,55.016]]] },
      properties: { name: 'Парк «Прибрежный»', category: 'ecology', status: 'active', code: 'ECO-009', owner: 'Дирекция городских парков', area_ha: 86, year: 2019, description: 'Рекреационная территория с экологической тропой и спортивными зонами.', updated: '2026-08-14' },
    },
    {
      type: 'Feature', id: 'innovation-zone-10',
      geometry: { type: 'Polygon', coordinates: [[[82.958,55.055],[82.983,55.052],[82.989,55.038],[82.965,55.034],[82.952,55.043],[82.958,55.055]]] },
      properties: { name: 'Инновационно-производственный кластер', category: 'infrastructure', status: 'planned', code: 'INF-010', owner: 'Агентство инвестиционного развития', area_ha: 124, year: 2028, description: 'Проектируемая территория для технологических производств и сервисов.', updated: '2026-08-23' },
    },
    {
      type: 'Feature', id: 'school-zone-11',
      geometry: { type: 'Polygon', coordinates: [[[82.938,55.010],[82.951,55.010],[82.955,55.001],[82.941,54.998],[82.935,55.004],[82.938,55.010]]] },
      properties: { name: 'Территория нового образовательного кампуса', category: 'education', status: 'planned', code: 'EDU-011', owner: 'Департамент строительства', area_ha: 24, capacity: 1450, year: 2027, description: 'Школа, спортивный блок и центр дополнительного образования.', updated: '2026-08-19' },
    },
    {
      type: 'Feature', id: 'medical-zone-12',
      geometry: { type: 'Polygon', coordinates: [[[82.913,55.063],[82.927,55.063],[82.931,55.054],[82.917,55.051],[82.909,55.056],[82.913,55.063]]] },
      properties: { name: 'Медицинский диагностический центр', category: 'medicine', status: 'maintenance', code: 'MED-012', owner: 'Областная клиническая сеть', area_ha: 17, capacity: 280, year: 2022, description: 'Территория диагностического центра, временно работающего с ограничениями.', updated: '2026-08-25' },
    },
  ],
};

export function filterFeatureCollection(collection, filters) {
  const query = filters.search.trim().toLocaleLowerCase('ru');
  const features = collection.features.filter((feature) => {
    const properties = feature.properties || {};
    const searchable = Object.values(properties).join(' ').toLocaleLowerCase('ru');
    return (!query || searchable.includes(query))
      && (filters.category === 'all' || properties.category === filters.category)
      && (filters.status === 'all' || properties.status === filters.status)
      && (filters.geometry === 'all' || feature.geometry?.type === filters.geometry);
  });

  return { ...collection, features };
}

export function getStatistics(collection) {
  return collection.features.reduce((result, feature) => {
    const status = feature.properties?.status || 'unknown';
    result.total += 1;
    result.byStatus[status] = (result.byStatus[status] || 0) + 1;
    result.byGeometry[feature.geometry?.type || 'Unknown'] = (result.byGeometry[feature.geometry?.type || 'Unknown'] || 0) + 1;
    return result;
  }, { total: 0, byStatus: {}, byGeometry: {} });
}
