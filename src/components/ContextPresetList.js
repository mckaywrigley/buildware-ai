import React, { useState, useEffect } from 'react';
import { getContextPresets, deleteContextPreset, applyContextPreset } from '../actions/ContextManagerActions';

const ContextPresetList = () => {
  const [contextPresets, setContextPresets] = useState([]);

  useEffect(() => {
    const fetchContextPresets = async () => {
      const presets = await getContextPresets();
      setContextPresets(presets);
    };
    fetchContextPresets();
  }, []);

  const handleDelete = async (presetId) => {
    await deleteContextPreset(presetId);
    setContextPresets(await getContextPresets());
  };

  const handleApply = async (presetId) => {
    await applyContextPreset(presetId);
    // Trigger a build or deployment with the prioritized files
  };

  return (
    <div>
      <h2>Context Presets</h2>
      <ul>
        {contextPresets.map((preset) => (
          <li key={preset.id}>
            <h3>{preset.name}</h3>
            <p>Files: {preset.filePaths.join(', ')}</p>
            <button onClick={() => handleDelete(preset.id)}>Delete</button>
            <button onClick={() => handleApply(preset.id)}>Apply</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContextPresetList;