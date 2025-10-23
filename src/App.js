import React from 'react';
import MapComponent from './components/MapComponent';
import './styles/App.css';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>Карта с WMS/WFS сервисами</h1>
        <p>Кликните на объект для просмотра атрибутов</p>
      </header>
      <main className="app-main">
        <MapComponent />
      </main>
    </div>
  );
}

export default App;