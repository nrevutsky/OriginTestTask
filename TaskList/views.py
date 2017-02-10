from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.template.response import TemplateResponse
from django.utils.decorators import method_decorator
from django.views import View

from TaskList.forms import UserSignUpForm
from TaskList.models import TaskList as user_tasks


class SignInView(View):
    def _mesage_response(self, success, message, id=False):
        data = {
            'success': success,
            'DATA': {
                'message': message
            }
        }
        id and data.update({'id': id})
        return JsonResponse(data)

    def _sign_in(self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')
        if username and password:
            user = authenticate(
                username=username,
                password=password
            )
            login(request, user)
            if not user:
                messages.info(request, "User hasn't been registered")
                return self._mesage_response(False,
                                             "User hasn't been registered or wrong password or login")

        else:
            return self._mesage_response(False, "Please enter required fields")

        return self._mesage_response(True, "Successfully logged in ")

    def _sign_up(self, request):
        form = UserSignUpForm(request.POST)
        if form.is_valid():
            form.save()
            authenticate(username=form.username, password=form.password)
            return self._mesage_response(True, "User successfully created. Please SignIn")
        else:
            return self._mesage_response(False, form.errors)

    def get(self, request):
        return TemplateResponse(request, 'main/sign_in_sign_up.html', {})

    def post(self, request):
        post_type = request.POST.get('submit_type')
        if post_type == 'sign_in':
            return self._sign_in(request)
        elif post_type == 'sign_up':
            return self._sign_up(request)


@method_decorator(login_required(login_url='sign_in_up/'), name='get')
class TaskList(SignInView):
    def get(self, request):
        task_list = user_tasks.objects.filter(user=request.user)
        done_tasks = task_list.filter(done=True)
        tasks = task_list.filter(done=False)
        data = {'done_tasks': done_tasks, 'tasks': tasks}
        return TemplateResponse(request, 'main/task_list.html', data)

    def post(self, request):
        try:
            task = user_tasks.objects.create(user=request.user,
                                             task=request.POST.get('task'),
                                             done=False)
            task.save()
            status = True
        except:
            status = False
        message = status and 'Task was successfully saved' or "Couldn't save task"
        return self._mesage_response(status, message, id=task.id)

    def put(self, request):
        try:
            task = user_tasks.objects.get(id=request.PUT.get('id'))
            task.done = request.PUT.get('done')
            task.save()
            status = True
        except:
            status = False
        message = status and 'Task was successfully updated' or "Couldn't update task"
        return self._mesage_response(status, message)

    def delete(self, request):
        try:
            task = user_tasks.objects.get(user=request.user,
                                          id=request.DELETE.get('id'))
            task.delete()
            status = True
        except:
            status = False
        message = status and 'Task was successfully deleted' or "Couldn't delete task"
        return self._mesage_response(status, message)
