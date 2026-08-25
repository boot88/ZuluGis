import MapComponent from './components/MapComponent';

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">Z</div>
        <div className="brand-copy">
          <div className="brand-line">
            <h1>ZuluGIS Demo Lab</h1>
            <span className="header-badge">интерактивный стенд</span>
          </div>
          <p>Объекты городской инфраструктуры, пространственный анализ и подключение WFS</p>
        </div>
      </header>
      <main className="app-main">
        <MapComponent />
      </main>
    </div>
  );
}

export default App;
