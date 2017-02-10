# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-10 10:23
from __future__ import unicode_literals

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('TaskList', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tasklist',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]