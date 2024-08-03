import { promises as fs } from 'fs';

class ContextManagerService {
  constructor() {
    this.contextPresets = [];
  }

  async createContextPreset(name, filePaths) {
    const newPreset = { id: this.contextPresets.length + 1, name, filePaths };
    this.contextPresets.push(newPreset);
    await this.persistContextPresets();
    return newPreset;
  }

  async updateContextPreset(id, name, filePaths) {
    const presetIndex = this.contextPresets.findIndex((preset) => preset.id === id);
    if (presetIndex === -1) {
      throw new Error('Context preset not found');
    }

    this.contextPresets[presetIndex] = { id, name, filePaths };
    await this.persistContextPresets();
    return this.contextPresets[presetIndex];
  }

  async deleteContextPreset(id) {
    const presetIndex = this.contextPresets.findIndex((preset) => preset.id === id);
    if (presetIndex === -1) {
      throw new Error('Context preset not found');
    }

    this.contextPresets.splice(presetIndex, 1);
    await this.persistContextPresets();
  }

  getContextPresets() {
    return this.contextPresets;
  }

  async applyContextPreset(id) {
    const preset = this.contextPresets.find((p) => p.id === id);
    if (!preset) {
      throw new Error('Context preset not found');
    }

    // Prioritize the files in the preset during the build or deployment process
    await prioritizeFilesInPreset(preset.filePaths);
  }

  async persistContextPresets() {
    await fs.writeFile('context-presets.json', JSON.stringify(this.contextPresets));
  }
}

export default ContextManagerService;