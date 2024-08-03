from django.db import models

class ContextPreset(models.Model):
    name = models.CharField(max_length=100, unique=True)
    file_paths = models.JSONField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='context_presets')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='context_presets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)