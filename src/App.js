import React from 'react';
import ContextPresetList from './components/ContextPresetList';
import CreateContextPreset from './components/CreateContextPreset';

function App() {
  return (
    <div>
      <h1>Buildware</h1>
      <ContextPresetList />
      <CreateContextPreset />
    </div>
  );
}

export default App;