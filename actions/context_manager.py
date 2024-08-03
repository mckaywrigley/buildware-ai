from typing import List
from db.models import ContextPreset

class ContextManager:
    def create_context(self, name: str, file_paths: List[str]) -> ContextPreset:
        """
        Creates a new context preset with the given name and list of file paths.
        """
        context_preset = ContextPreset(name=name, file_paths=file_paths)
        context_preset.save()
        return context_preset

    def get_context(self, name: str) -> ContextPreset:
        """
        Retrieves the context preset with the given name.
        """
        return ContextPreset.objects.get(name=name)

    def add_files_to_context(self, name: str, file_paths: List[str]) -> ContextPreset:
        """
        Adds the given file paths to the context preset with the given name.
        """
        context_preset = self.get_context(name)
        context_preset.file_paths.extend(file_paths)
        context_preset.save()
        return context_preset

    def remove_files_from_context(self, name: str, file_paths: List[str]) -> ContextPreset:
        """
        Removes the given file paths from the context preset with the given name.
        """
        context_preset = self.get_context(name)
        context_preset.file_paths = [path for path in context_preset.file_paths if path not in file_paths]
        context_preset.save()
        return context_preset

    def list_contexts(self) -> List[ContextPreset]:
        """
        Returns a list of all the available context presets.
        """
        return list(ContextPreset.objects.all())