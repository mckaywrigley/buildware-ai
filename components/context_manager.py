from django.urls import reverse
from django.shortcuts import render, redirect
from actions.context_manager import ContextManager

def context_manager(request):
    context_manager = ContextManager()

    if request.method == 'POST':
        action = request.POST.get('action')
        name = request.POST.get('name')
        file_paths = request.POST.getlist('file_paths')

        if action == 'create':
            context_manager.create_context(name, file_paths)
        elif action == 'add':
            context_manager.add_files_to_context(name, file_paths)
        elif action == 'remove':
            context_manager.remove_files_from_context(name, file_paths)

        return redirect(reverse('context_manager'))

    contexts = context_manager.list_contexts()
    return render(request, 'context_manager.html', {'contexts': contexts})