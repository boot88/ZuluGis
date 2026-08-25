import { useCallback, useMemo, useRef, useState } from 'react';
import {
  CircleMarker,
  GeoJSON,
  LayersControl,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';
import {
  CATEGORY_META,
  DEMO_DATA,
  FIELD_LABELS,
  STATUS_META,
  filterFeatureCollection,
  getStatistics,
} from '../data/demoData';

const INITIAL_FILTERS = { search: '', category: 'all', status: 'all', geometry: 'all' };
const GEOMETRY_LABELS = { Point: 'Точки', LineString: 'Линии', Polygon: 'Территории' };
const DEFAULT_CENTER = [55.0302, 82.9204];

function MapEventBridge({ measuring, onMeasurePoint, onClearSelection, onPointerChange }) {
  useMapEvents({
    click(event) {
      if (measuring) onMeasurePoint(event.latlng);
      else onClearSelection();
    },
    mousemove(event) {
      onPointerChange(event.latlng);
    },
    mouseout() {
      onPointerChange(null);
    },
  });
  return null;
}

function normalizeFeatureCollection(payload) {
  if (!payload || payload.type !== 'FeatureCollection' || !Array.isArray(payload.features)) {
    throw new Error('сервер вернул данные не в формате GeoJSON FeatureCollection');
  }

  const features = payload.features
    .filter((feature) => feature?.type === 'Feature' && feature.geometry)
    .map((feature, index) => ({
      ...feature,
      id: feature.id ?? feature.properties?.id ?? `wfs-${index + 1}`,
      properties: {
        name: feature.properties?.name || feature.properties?.NAME || `Объект ${index + 1}`,
        ...feature.properties,
      },
    }));

  if (!features.length) throw new Error('в слое нет объектов с геометрией');
  return { ...payload, features };
}

function featureCenter(feature) {
  if (feature.geometry?.type === 'Point') {
    const [longitude, latitude] = feature.geometry.coordinates;
    return L.latLng(latitude, longitude);
  }

  const bounds = L.geoJSON(feature).getBounds();
  return bounds.isValid() ? bounds.getCenter() : L.latLng(DEFAULT_CENTER);
}

function formatValue(key, value) {
  if (key === 'category') return CATEGORY_META[value]?.label || value;
  if (key === 'status') return STATUS_META[value]?.label || value;
  if (typeof value === 'number') return new Intl.NumberFormat('ru-RU').format(value);
  return value === null || value === undefined || value === '' ? '—' : String(value);
}

function MapComponent() {
  const mapRef = useRef(null);
  const requestRef = useRef(null);
  const [dataset, setDataset] = useState(DEMO_DATA);
  const [activeSource, setActiveSource] = useState('demo');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [pointerPosition, setPointerPosition] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [measuring, setMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [wfsUrl, setWfsUrl] = useState(process.env.REACT_APP_WFS_URL || '');
  const [wfsTypeName, setWfsTypeName] = useState(process.env.REACT_APP_WFS_TYPENAME || '');

  const filteredData = useMemo(
    () => filterFeatureCollection(dataset, filters),
    [dataset, filters]
  );
  const statistics = useMemo(() => getStatistics(filteredData), [filteredData]);
  const categories = useMemo(
    () => [...new Set(dataset.features.map((feature) => feature.properties?.category).filter(Boolean))],
    [dataset]
  );
  const statuses = useMemo(
    () => [...new Set(dataset.features.map((feature) => feature.properties?.status).filter(Boolean))],
    [dataset]
  );
  const measurementDistance = measurePoints.length === 2
    ? L.latLng(measurePoints[0]).distanceTo(L.latLng(measurePoints[1]))
    : 0;

  const focusFeature = useCallback((feature, eventPosition = null) => {
    setSelectedFeature(feature);
    const center = eventPosition || featureCenter(feature);
    setSelectedPosition(center);
    const map = mapRef.current;
    if (!map) return;

    if (feature.geometry?.type === 'Point') map.flyTo(center, 15, { duration: 0.55 });
    else {
      const bounds = L.geoJSON(feature).getBounds();
      if (bounds.isValid()) map.fitBounds(bounds.pad(0.55), { maxZoom: 15, animate: true });
    }
  }, []);

  const fitVisibleObjects = useCallback(() => {
    if (!mapRef.current || !filteredData.features.length) return;
    const bounds = L.geoJSON(filteredData).getBounds();
    if (bounds.isValid()) mapRef.current.fitBounds(bounds.pad(0.12), { maxZoom: 14 });
  }, [filteredData]);

  const locateUser = () => {
    if (!navigator.geolocation) {
      setError('Геолокация не поддерживается этим браузером.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = L.latLng(coords.latitude, coords.longitude);
        setUserPosition(position);
        setError('');
        mapRef.current?.flyTo(position, 15, { duration: 0.6 });
      },
      () => setError('Не удалось определить местоположение. Разрешите доступ к геолокации.'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const addMeasurePoint = (latlng) => {
    setMeasurePoints((current) => current.length >= 2 ? [latlng] : [...current, latlng]);
  };

  const toggleMeasurement = () => {
    setMeasuring((current) => !current);
    setMeasurePoints([]);
    setSelectedFeature(null);
    setSelectedPosition(null);
  };

  const exportGeoJson = () => {
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zulugis-${new Date().toISOString().slice(0, 10)}.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activateDemo = () => {
    requestRef.current?.abort();
    setDataset(DEMO_DATA);
    setActiveSource('demo');
    setFilters(INITIAL_FILTERS);
    setSelectedFeature(null);
    setError('');
    window.setTimeout(() => {
      const bounds = L.geoJSON(DEMO_DATA).getBounds();
      if (bounds.isValid()) mapRef.current?.fitBounds(bounds.pad(0.12), { maxZoom: 14 });
    }, 0);
  };

  const loadWfs = async () => {
    if (!wfsUrl.trim() || !wfsTypeName.trim()) {
      setError('Укажите URL WFS-сервиса и имя слоя (typeName).');
      return;
    }

    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    setIsLoading(true);
    setError('');

    try {
      const requestUrl = new URL(wfsUrl.trim(), window.location.origin);
      requestUrl.searchParams.set('service', 'WFS');
      requestUrl.searchParams.set('version', '1.1.0');
      requestUrl.searchParams.set('request', 'GetFeature');
      requestUrl.searchParams.set('typeName', wfsTypeName.trim());
      requestUrl.searchParams.set('outputFormat', 'application/json');
      requestUrl.searchParams.set('maxFeatures', '500');

      const response = await fetch(requestUrl, { signal: controller.signal, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const collection = normalizeFeatureCollection(await response.json());
      setDataset(collection);
      setActiveSource('wfs');
      setFilters(INITIAL_FILTERS);
      setSelectedFeature(null);
      window.setTimeout(() => {
        const bounds = L.geoJSON(collection).getBounds();
        if (bounds.isValid()) mapRef.current?.fitBounds(bounds.pad(0.08), { maxZoom: 14 });
      }, 0);
    } catch (requestError) {
      setError(requestError.name === 'AbortError'
        ? 'Запрос WFS отменён или превысил 15 секунд.'
        : `Не удалось загрузить WFS: ${requestError.message}. Проверьте URL, имя слоя и CORS.`);
    } finally {
      window.clearTimeout(timeout);
      if (requestRef.current === controller) requestRef.current = null;
      setIsLoading(false);
    }
  };

  const styleFeature = (feature) => {
    const category = feature.properties?.category;
    const color = CATEGORY_META[category]?.color || '#475569';
    const selected = selectedFeature?.id === feature.id;
    return {
      color,
      fillColor: color,
      weight: selected ? 5 : 3,
      opacity: 0.9,
      fillOpacity: selected ? 0.34 : 0.18,
      dashArray: feature.properties?.status === 'planned' ? '8 6' : undefined,
    };
  };

  const pointToLayer = (feature, latlng) => {
    const color = CATEGORY_META[feature.properties?.category]?.color || '#475569';
    return L.circleMarker(latlng, {
      radius: selectedFeature?.id === feature.id ? 11 : 8,
      color: '#ffffff',
      weight: 3,
      fillColor: color,
      fillOpacity: 0.96,
    });
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      click(event) {
        if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent);
        focusFeature(feature, event.latlng);
      },
      mouseover() {
        if (layer.setStyle) layer.setStyle({ weight: 5, fillOpacity: 0.32 });
      },
      mouseout() {
        if (layer.setStyle) layer.setStyle(styleFeature(feature));
      },
    });
  };

  const filterKey = `${activeSource}-${filters.search}-${filters.category}-${filters.status}-${filters.geometry}-${selectedFeature?.id || ''}`;

  return (
    <div className="gis-workspace">
      <section className={`map-stage ${measuring ? 'is-measuring' : ''}`} aria-label="Интерактивная карта">
        <MapContainer ref={mapRef} center={DEFAULT_CENTER} zoom={12} zoomControl preferCanvas>
          <MapEventBridge
            measuring={measuring}
            onMeasurePoint={addMeasurePoint}
            onClearSelection={() => { setSelectedFeature(null); setSelectedPosition(null); }}
            onPointerChange={setPointerPosition}
          />
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Светлая схема">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap &copy; CARTO'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Спутник">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='Tiles &copy; Esri'
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {filteredData.features.length > 0 && (
            <GeoJSON
              key={filterKey}
              data={filteredData}
              style={styleFeature}
              pointToLayer={pointToLayer}
              onEachFeature={onEachFeature}
            />
          )}

          {userPosition && (
            <CircleMarker center={userPosition} radius={9} pathOptions={{ color: '#fff', weight: 4, fillColor: '#06b6d4', fillOpacity: 1 }}>
              <Tooltip direction="top">Ваше местоположение</Tooltip>
            </CircleMarker>
          )}

          {measurePoints.length > 0 && measurePoints.map((point, index) => (
            <CircleMarker key={`${point.lat}-${point.lng}`} center={point} radius={6} pathOptions={{ color: '#fff', weight: 3, fillColor: '#f97316', fillOpacity: 1 }}>
              <Tooltip permanent direction="top">{index + 1}</Tooltip>
            </CircleMarker>
          ))}
          {measurePoints.length === 2 && (
            <Polyline positions={measurePoints} pathOptions={{ color: '#f97316', weight: 4, dashArray: '8 7' }}>
              <Tooltip permanent>{measurementDistance >= 1000 ? `${(measurementDistance / 1000).toFixed(2)} км` : `${Math.round(measurementDistance)} м`}</Tooltip>
            </Polyline>
          )}

          {selectedFeature && selectedPosition && (
            <Popup position={selectedPosition} onClose={() => { setSelectedFeature(null); setSelectedPosition(null); }} minWidth={250}>
              <article className="map-popup">
                <span className="popup-eyebrow">{CATEGORY_META[selectedFeature.properties?.category]?.label || selectedFeature.geometry?.type}</span>
                <h3>{selectedFeature.properties?.name || 'Объект'}</h3>
                <p>{selectedFeature.properties?.description || 'Описание не указано.'}</p>
                <button type="button" onClick={() => focusFeature(selectedFeature)}>Показать целиком</button>
              </article>
            </Popup>
          )}
        </MapContainer>

        <div className="map-toolbar" aria-label="Инструменты карты">
          <button type="button" onClick={fitVisibleObjects} title="Показать все найденные объекты">⌗ <span>Весь слой</span></button>
          <button type="button" onClick={locateUser} title="Определить местоположение">◎ <span>Где я</span></button>
          <button type="button" className={measuring ? 'active' : ''} aria-pressed={measuring} onClick={toggleMeasurement} title="Измерить расстояние">↔ <span>Линейка</span></button>
          <button type="button" onClick={exportGeoJson} disabled={!filteredData.features.length} title="Скачать найденные объекты">⇩ <span>GeoJSON</span></button>
        </div>

        {measuring && (
          <div className="measure-hint">
            {measurePoints.length === 0 && 'Укажите первую точку на карте'}
            {measurePoints.length === 1 && 'Укажите вторую точку'}
            {measurePoints.length === 2 && `Расстояние: ${measurementDistance >= 1000 ? `${(measurementDistance / 1000).toFixed(2)} км` : `${Math.round(measurementDistance)} м`}. Новый клик начнёт измерение заново.`}
          </div>
        )}

        <div className="coordinate-strip">
          {pointerPosition ? `${pointerPosition.lat.toFixed(5)}, ${pointerPosition.lng.toFixed(5)}` : 'Наведите курсор на карту'}
        </div>
      </section>

      <aside className="control-panel">
        <div className="panel-topline">
          <div>
            <span className="panel-kicker">Источник данных</span>
            <h2>{activeSource === 'demo' ? 'Городской демо-слой' : wfsTypeName}</h2>
          </div>
          <span className={`source-pill ${activeSource}`}>{activeSource === 'demo' ? 'DEMO' : 'WFS'}</span>
        </div>

        <div className="stats-grid">
          <div><strong>{statistics.total}</strong><span>показано</span></div>
          <div><strong>{statistics.byStatus.active || 0}</strong><span>работает</span></div>
          <div><strong>{statistics.byGeometry.Point || 0}</strong><span>точек</span></div>
          <div><strong>{(statistics.byGeometry.LineString || 0) + (statistics.byGeometry.Polygon || 0)}</strong><span>контуров</span></div>
        </div>

        <section className="filter-card" aria-label="Фильтры объектов">
          <label className="search-field">
            <span className="sr-only">Поиск объектов</span>
            <input
              type="search"
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
              placeholder="Название, адрес или код…"
            />
            <span aria-hidden="true">⌕</span>
          </label>
          <div className="filter-row">
            <label>Категория
              <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
                <option value="all">Все категории</option>
                {categories.map((category) => <option key={category} value={category}>{CATEGORY_META[category]?.label || category}</option>)}
              </select>
            </label>
            <label>Статус
              <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
                <option value="all">Все статусы</option>
                {statuses.map((status) => <option key={status} value={status}>{STATUS_META[status]?.label || status}</option>)}
              </select>
            </label>
          </div>
          <div className="geometry-tabs" role="group" aria-label="Тип геометрии">
            <button type="button" className={filters.geometry === 'all' ? 'active' : ''} onClick={() => setFilters({ ...filters, geometry: 'all' })}>Все</button>
            {Object.entries(GEOMETRY_LABELS).map(([geometry, label]) => (
              <button type="button" key={geometry} className={filters.geometry === geometry ? 'active' : ''} onClick={() => setFilters({ ...filters, geometry })}>{label}</button>
            ))}
          </div>
          {Object.values(filters).some((value) => value !== '' && value !== 'all') && (
            <button type="button" className="reset-link" onClick={() => setFilters(INITIAL_FILTERS)}>Сбросить фильтры</button>
          )}
        </section>

        {error && <div className="panel-message error" role="alert">{error}</div>}

        <section className="objects-section">
          <div className="section-heading"><h3>Объекты</h3><span>{filteredData.features.length} из {dataset.features.length}</span></div>
          <div className="object-list">
            {filteredData.features.map((feature) => {
              const category = CATEGORY_META[feature.properties?.category];
              const status = STATUS_META[feature.properties?.status];
              return (
                <button
                  type="button"
                  key={feature.id}
                  className={`object-card ${selectedFeature?.id === feature.id ? 'selected' : ''}`}
                  onClick={() => focusFeature(feature)}
                >
                  <span className="object-icon" style={{ '--object-color': category?.color || '#475569' }}>{category?.icon || 'ГС'}</span>
                  <span className="object-copy">
                    <strong>{feature.properties?.name || 'Без названия'}</strong>
                    <small>{category?.label || feature.geometry?.type} · {feature.properties?.code || feature.id}</small>
                  </span>
                  <span className="status-dot" title={status?.label || 'Статус не указан'} style={{ '--status-color': status?.color || '#64748b' }} />
                </button>
              );
            })}
            {!filteredData.features.length && <div className="empty-state">По заданным условиям объекты не найдены.</div>}
          </div>
        </section>

        {selectedFeature && (
          <section className="details-card">
            <div className="section-heading"><h3>Карточка объекта</h3><button type="button" onClick={() => { setSelectedFeature(null); setSelectedPosition(null); }} aria-label="Закрыть карточку">×</button></div>
            <h4>{selectedFeature.properties?.name}</h4>
            <p>{selectedFeature.properties?.description}</p>
            <dl>
              {Object.entries(selectedFeature.properties || {}).filter(([key]) => !['name', 'description'].includes(key)).map(([key, value]) => (
                <div key={key}><dt>{FIELD_LABELS[key] || key}</dt><dd>{formatValue(key, value)}</dd></div>
              ))}
              <div><dt>Геометрия</dt><dd>{GEOMETRY_LABELS[selectedFeature.geometry?.type] || selectedFeature.geometry?.type}</dd></div>
            </dl>
          </section>
        )}

        <details className="wfs-card">
          <summary>Подключить внешний WFS</summary>
          <p>Для закрытых серверов используйте серверный proxy. Пароли не должны находиться в React-коде.</p>
          <label>URL сервиса<input value={wfsUrl} onChange={(event) => setWfsUrl(event.target.value)} placeholder="https://host/geoserver/workspace/wfs" /></label>
          <label>Имя слоя<input value={wfsTypeName} onChange={(event) => setWfsTypeName(event.target.value)} placeholder="workspace:layer" /></label>
          <div className="wfs-actions">
            <button type="button" onClick={loadWfs} disabled={isLoading}>{isLoading ? 'Загрузка…' : 'Загрузить WFS'}</button>
            <button type="button" className="secondary" onClick={activateDemo}>Вернуть демо</button>
          </div>
        </details>
      </aside>
    </div>
  );
}

export default MapComponent;
