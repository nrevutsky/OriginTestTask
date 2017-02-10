#!/usr/bin/env bash
apt-get update
apt-get install libpq-dev python-dev
apt-get install postgresql postgresql-contrib
apt-get install python-virtualenv
virturtualenv ./origin
sudo -H -u postgres bash -c '
    createdb origin
    psql -c \"CREATE USER origin WITH PASSWORD 'origin_dev';\"
    psql -c "GRANT ALL PRIVILEGES ON DATABASE origin TO dev_origin;"
'
source ./origin/bin/activate
pip install -r requirements.txt
./manage.py makemigrations
./manage.py migrate
./manage.py runserver

