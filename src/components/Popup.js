import React from 'react';

const Popup = ({ feature, onClose }) => {
  if (!feature) return null;

  const properties = feature.getProperties();
  
  // Фильтруем системные свойства и геометрию
  const attributeProperties = Object.entries(properties)
    .filter(([key]) => !['geometry', 'bbox'].includes(key))
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});

  return (
    <div className="popup">
      <div className="popup-header">
        <h3>Атрибуты объекта</h3>
        <button className="popup-close" onClick={onClose}>×</button>
      </div>
      <div className="popup-content">
        {Object.keys(attributeProperties).length > 0 ? (
          <table className="attributes-table">
            <tbody>
              {Object.entries(attributeProperties).map(([key, value]) => (
                <tr key={key}>
                  <td className="attribute-name">{key}:</td>
                  <td className="attribute-value">
                    {value !== null && value !== undefined ? value.toString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Нет доступных атрибутов</p>
        )}
      </div>
    </div>
  );
};

export default Popup;