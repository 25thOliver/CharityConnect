#!/bin/bash

# Start Django development server with proper environment variables
export DEBUG=True
export SECRET_KEY="django-insecure-kpeak98e3bt33&o5qolpgwdm#=&6xslioenifh8tg^6sfc(eap"
export ALLOWED_HOSTS="localhost,127.0.0.1"

echo "Starting Django development server..."
echo "Server will be available at: http://127.0.0.1:8000/"
echo "Press Ctrl+C to stop the server"
echo ""

python3 manage.py runserver 