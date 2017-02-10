from __future__ import unicode_literals

from django.contrib.auth.models import User
from django.db import models


class TaskList(models.Model):
    user = models.ForeignKey(User)
    task = models.CharField(max_length=500)
    done = models.BooleanField(default=False)
