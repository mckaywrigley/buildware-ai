import ContextManagerService from '../services/ContextManagerService';

export async function createContextPreset(name, filePaths) {
  const contextManagerService = new ContextManagerService();
  return await contextManagerService.createContextPreset(name, filePaths);
}

export async function updateContextPreset(id, name, filePaths) {
  const contextManagerService = new ContextManagerService();
  return await contextManagerService.updateContextPreset(id, name, filePaths);
}

export async function deleteContextPreset(id) {
  const contextManagerService = new ContextManagerService();
  return await contextManagerService.deleteContextPreset(id);
}

export async function getContextPresets() {
  const contextManagerService = new ContextManagerService();
  return await contextManagerService.getContextPresets();
}

export async function applyContextPreset(id) {
  const contextManagerService = new ContextManagerService();
  return await contextManagerService.applyContextPreset(id);
}