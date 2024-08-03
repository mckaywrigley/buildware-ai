import React, { useState } from 'react';
import { createContextPreset, updateContextPreset } from '../actions/ContextManagerActions';

const CreateContextPreset = () => {
  const [name, setName] = useState('');
  const [filePaths, setFilePaths] = useState('');
  const [presetId, setPresetId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const paths = filePaths.split(',').map((p) => p.trim());

    if (presetId) {
      await updateContextPreset(presetId, name, paths);
    } else {
      await createContextPreset(name, paths);
    }

    setName('');
    setFilePaths('');
    setPresetId(null);
  };

  const handleEdit = (preset) => {
    setName(preset.name);
    setFilePaths(preset.filePaths.join(', '));
    setPresetId(preset.id);
  };

  return (
    <div>
      <h2>Create/Update Context Preset</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          File Paths:
          <textarea
            value={filePaths}
            onChange={(e) => setFilePaths(e.target.value)}
          />
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default CreateContextPreset;