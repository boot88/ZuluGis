import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, useMapEvents, LayersControl, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Расширенные демо-данные с полигонами и точками
const createAdvancedDemoData = () => {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: "moscow",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [37.3, 55.5], [37.9, 55.5], [37.9, 56.0], [37.3, 56.0], [37.3, 55.5]
          ]]
        },
        properties: {
          name: "Московская область",
          type: "Субъект РФ",
          population: "12500000",
          area: "2561",
          code: "45000000",
          admin_center: "Москва",
          budget: "3500000"
        }
      },
      {
        type: "Feature",
        id: "spb",
        geometry: {
          type: "Polygon", 
          coordinates: [[
            [29.5, 59.8], [30.5, 59.8], [30.5, 60.1], [29.5, 60.1], [29.5, 59.8]
          ]]
        },
        properties: {
          name: "Санкт-Петербург",
          type: "Город федерального значения",
          population: "5350000", 
          area: "1439",
          code: "40000000",
          admin_center: "Санкт-Петербург",
          budget: "1200000"
        }
      },
      {
        type: "Feature",
        id: "kazan",
        geometry: {
          type: "Point",
          coordinates: [49.1088, 55.7961]
        },
        properties: {
          name: "Казань",
          type: "Город",
          population: "1250000",
          area: "425",
          code: "92000000",
          admin_center: "Казань", 
          founded: "1005"
        }
      },
      {
        type: "Feature",
        id: "nizhny",
        geometry: {
          type: "Point",
          coordinates: [44.002, 56.328]
        },
        properties: {
          name: "Нижний Новгород",
          type: "Город",
          population: "1250000",
          area: "411",
          code: "22000000",
          admin_center: "Нижний Новгород",
          founded: "1221"
        }
      },
      {
        type: "Feature",
        id: "ryazan",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [38.5, 53.5], [41.5, 53.5], [41.5, 55.5], [38.5, 55.5], [38.5, 53.5]
          ]]
        },
        properties: {
          name: "Рязанская область",
          type: "Субъект РФ",
          population: "1100000",
          area: "39600",
          code: "61000000",
          admin_center: "Рязань",
          budget: "850000"
        }
      },
      {
        type: "Feature", 
        id: "volgograd",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [41.5, 47.5], [45.5, 47.5], [45.5, 50.5], [41.5, 50.5], [41.5, 47.5]
          ]]
        },
        properties: {
          name: "Волгоградская область",
          type: "Субъект РФ",
          population: "2500000",
          area: "112877", 
          code: "18000000",
          admin_center: "Волгоград",
          budget: "1500000"
        }
      },
      {
        type: "Feature",
        id: "ekb",
        geometry: {
          type: "Point",
          coordinates: [60.6122, 56.8389]
        },
        properties: {
          name: "Екатеринбург",
          type: "Город",
          population: "1500000",
          area: "495",
          code: "65000000",
          admin_center: "Екатеринбург",
          founded: "1723"
        }
      },
      {
        type: "Feature",
        id: "novosibirsk",
        geometry: {
          type: "Point", 
          coordinates: [82.9204, 55.0084]
        },
        properties: {
          name: "Новосибирск",
          type: "Город",
          population: "1600000",
          area: "505",
          code: "54000000",
          admin_center: "Новосибирск", 
          founded: "1893"
        }
      }
    ]
  };
};

const MapComponent = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeLayer, setActiveLayer] = useState('demo');
  const [serverUrl, setServerUrl] = useState('https://gs-stg.politerm.com/geoserver/term/wfs');

  // Загрузка WFS данных
  const loadWFSData = async (url = serverUrl) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const wfsUrl = `${url}?service=WFS&version=1.0.0&request=GetFeature&typeName=term:oktmo&maxFeatures=100&outputFormat=application/json`;
      
      console.log('Loading WFS from:', wfsUrl);
      
      const response = await fetch(wfsUrl, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa('mo:mo')
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          setGeoJsonData(data);
          setActiveLayer('wfs');
          setError(null);
        } else {
          throw new Error('Нет данных в ответе от сервера');
        }
      } else {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
    } catch (err) {
      console.error('WFS Error:', err);
      setError(`WFS недоступен: ${err.message}`);
      // Автоматически переключаемся на демо-данные
      switchToDemoData();
    } finally {
      setIsLoading(false);
    }
  };

  const switchToDemoData = () => {
    setGeoJsonData(createAdvancedDemoData());
    setActiveLayer('demo');
    setError(null);
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    // Сначала пробуем загрузить WFS, при ошибке используем демо-данные
    loadWFSData().catch(() => {
      switchToDemoData();
    });
  }, []);

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const popupContent = `
        <div class="popup-content">
          <h4>${feature.properties.name || 'Объект'}</h4>
          <table class="popup-table">
            ${Object.entries(feature.properties)
              .slice(0, 4) // Показываем первые 4 свойства в попапе
              .map(([key, value]) => `
                <tr>
                  <td><strong>${key}:</strong></td>
                  <td>${value || 'N/A'}</td>
                </tr>
              `).join('')}
            ${Object.keys(feature.properties).length > 4 ? 
              `<tr><td colspan="2"><em>... и еще ${Object.keys(feature.properties).length - 4} свойств</em></td></tr>` : ''}
          </table>
        </div>
      `;
      
      layer.bindPopup(popupContent);
      
      layer.on('click', (e) => {
        setSelectedFeature(feature);
        L.DomEvent.stopPropagation(e);
      });

      layer.on('mouseover', () => {
        layer.setStyle({
          weight: 4,
          fillOpacity: 0.3
        });
      });

      layer.on('mouseout', () => {
        layer.setStyle({
          weight: 2,
          fillOpacity: 0.2
        });
      });
    }
  };

  const pointToLayer = (feature, latlng) => {
    return L.circleMarker(latlng, {
      radius: 8,
      fillColor: "#ff7800",
      color: "#000",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    });
  };

  const getStyle = (feature) => {
    const isPoint = feature.geometry.type === 'Point';
    
    if (isPoint) {
      return {
        color: "#3388ff",
        weight: 2,
        fillColor: "#3388ff",
        fillOpacity: 0.8
      };
    } else {
      return {
        color: activeLayer === 'wfs' ? "#e74c3c" : "#27ae60",
        weight: 2,
        fillColor: activeLayer === 'wfs' ? "#e74c3c" : "#27ae60",
        fillOpacity: 0.2
      };
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: () => {
        setSelectedFeature(null);
      },
    });
    return null;
  };

  const handleServerTest = () => {
    loadWFSData(serverUrl);
  };

  return (
    <div className="map-container">
      <MapContainer
        center={[55.7558, 37.6173]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <MapClickHandler />
        
        <LayersControl position="topright">
          {/* Базовые слои */}
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            />
          </LayersControl.BaseLayer>

          {/* WFS/Demo слои */}
          <LayersControl.Overlay checked name="Геоданные">
            <LayerGroup>
              {geoJsonData && (
                <GeoJSON
                  key={activeLayer}
                  data={geoJsonData}
                  onEachFeature={onEachFeature}
                  pointToLayer={pointToLayer}
                  style={getStyle}
                />
              )}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
        
        {/* Попап для выбранного объекта */}
        {selectedFeature && (
          <Popup
            position={[
              selectedFeature.geometry.coordinates
                ? selectedFeature.geometry.type === 'Point' 
                  ? selectedFeature.geometry.coordinates[1]
                  : selectedFeature.geometry.coordinates[0][0][1]
                : 55.7558,
              selectedFeature.geometry.coordinates
                ? selectedFeature.geometry.type === 'Point'
                  ? selectedFeature.geometry.coordinates[0]
                  : selectedFeature.geometry.coordinates[0][0][0]
                : 37.6173
            ]}
            onClose={() => setSelectedFeature(null)}
          >
            <div className="feature-popup">
              <h3>{selectedFeature.properties.name || 'Объект'}</h3>
              <div className="attributes-section">
                <table className="attributes-table">
                  <tbody>
                    {Object.entries(selectedFeature.properties).map(([key, value]) => (
                      <tr key={key}>
                        <td className="attribute-name">{key}:</td>
                        <td className="attribute-value">
                          {value !== null && value !== undefined ? value.toString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Popup>
        )}
      </MapContainer>

      {/* Панель информации */}
      <div className="info-panel">
        <div className="panel-header">
          <h3>WFS/WMS Картографическое приложение</h3>
          <div className="data-source">
            Источник данных: <span className={`source-badge ${activeLayer}`}>
              {activeLayer === 'wfs' ? 'WFS Сервер' : 'Демо-данные'}
            </span>
          </div>
        </div>

        <div className="server-config">
          <h4>Настройка сервера</h4>
          <div className="url-input">
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="URL WFS сервера"
            />
            <button 
              className="test-btn"
              onClick={handleServerTest}
              disabled={isLoading}
            >
              Тест
            </button>
          </div>
          <button 
            className="demo-btn"
            onClick={switchToDemoData}
          >
            Использовать демо-данные
          </button>
        </div>

        {isLoading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Загрузка данных с WFS сервера...</p>
          </div>
        )}

        {error && activeLayer !== 'demo' && (
          <div className="error-state">
            <h4>Ошибка подключения</h4>
            <p>{error}</p>
          </div>
        )}

        {geoJsonData && (
          <div className="data-info">
            <div className="stats">
              <strong>Загружено объектов:</strong> {geoJsonData.features.length}
              <br />
              <strong>Тип данных:</strong> {activeLayer === 'wfs' ? 'Реальные WFS данные' : 'Демонстрационные'}
            </div>
            
            {activeLayer === 'demo' && (
              <div className="demo-notice">
                <p>⚠️ Используются демонстрационные данные</p>
                <p>Для подключения к реальному WFS серверу укажите корректный URL выше</p>
              </div>
            )}

            <div className="instructions">
              <p>📌 <strong>Кликните на объект</strong> для просмотра атрибутов</p>
              <p>🗺️ Используйте <strong>колесо мыши</strong> для масштабирования</p>
              <p>🖱️ <strong>Перетаскивайте</strong> карту для навигации</p>
            </div>
          </div>
        )}

        {selectedFeature && (
          <div className="selected-feature">
            <h4>Выбранный объект</h4>
            <div className="feature-type">
              Тип: <span className="type-badge">{selectedFeature.geometry.type}</span>
            </div>
            <div className="feature-details">
              <table className="attributes-table compact">
                <tbody>
                  {Object.entries(selectedFeature.properties)
                    .slice(0, 5)
                    .map(([key, value]) => (
                      <tr key={key}>
                        <td className="attribute-name">{key}:</td>
                        <td className="attribute-value">
                          {value !== null && value !== undefined ? value.toString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
              {Object.keys(selectedFeature.properties).length > 5 && (
                <div className="more-info">
                  ... и еще {Object.keys(selectedFeature.properties).length - 5} свойств
                </div>
              )}
            </div>
          </div>
        )}

        {!selectedFeature && geoJsonData && (
          <div className="no-selection">
            <p>Выберите объект на карте для просмотра детальной информации</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;