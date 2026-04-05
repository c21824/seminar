from __future__ import annotations

from pathlib import Path
from textwrap import dedent, indent

ROOT = Path(__file__).resolve().parents[1]

SERVICES = [
    {"name": "staff-service", "module": "staff_service", "port": 8001, "resource": "staff", "model": "Staff", "db": "staff_db"},
    {"name": "manager-service", "module": "manager_service", "port": 8002, "resource": "managers", "model": "Manager", "db": "manager_db"},
    {"name": "customer-service", "module": "customer_service", "port": 8003, "resource": "customers", "model": "Customer", "db": "customer_db"},
    {"name": "catalog-service", "module": "catalog_service", "port": 8004, "resource": "catalog-items", "model": "CatalogItem", "db": "catalog_db"},
    {"name": "book-service", "module": "book_service", "port": 8005, "resource": "books", "model": "Book", "db": "book_db"},
    {"name": "cart-service", "module": "cart_service", "port": 8006, "resource": "carts", "model": "Cart", "db": "cart_db"},
    {"name": "order-service", "module": "order_service", "port": 8007, "resource": "orders", "model": "Order", "db": "order_db"},
    {"name": "ship-service", "module": "ship_service", "port": 8008, "resource": "shipments", "model": "Shipment", "db": "ship_db"},
    {"name": "pay-service", "module": "pay_service", "port": 8009, "resource": "payments", "model": "Payment", "db": "pay_db"},
    {"name": "comment-rate-service", "module": "comment_rate_service", "port": 8010, "resource": "reviews", "model": "Review", "db": "comment_rate_db"},
    {"name": "recommender-ai-service", "module": "recommender_ai_service", "port": 8011, "resource": "recommendations", "model": "Recommendation", "db": "recommender_db"},
]

GATEWAY = {"name": "api-gateway", "module": "api_gateway", "port": 8000, "db": "gateway_db"}

COMMON_REQUIREMENTS = dedent(
    """
    Django==5.1.7
    djangorestframework==3.15.2
    django-environ==0.11.2
    psycopg2-binary==2.9.10
    django-cors-headers==4.7.0
    requests==2.32.3
    gunicorn==23.0.0
    whitenoise==6.8.2
    """
).strip() + "\n"

FRONTEND_PACKAGE = dedent(
    """
    {
      "name": "frontend-react",
      "private": true,
      "version": "0.0.0",
      "type": "module",
      "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview --host 0.0.0.0"
      },
      "dependencies": {
        "react": "^18.3.1",
        "react-dom": "^18.3.1"
      },
      "devDependencies": {
        "@vitejs/plugin-react": "^4.3.2",
        "vite": "^5.4.14"
      }
    }
    """
).strip() + "\n"

FRONTEND_INDEX = dedent(
    """
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Book Microservices Dashboard</title>
        <script type="module" src="/src/main.jsx"></script>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
    """
).strip() + "\n"

FRONTEND_VITE_CONFIG = dedent(
    """
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'

    export default defineConfig({
      plugins: [react()],
      server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
          '/api': {
            target: 'http://api-gateway:8000',
            changeOrigin: true,
          },
        },
      },
    })
    """
).strip() + "\n"

FRONTEND_MAIN = dedent(
    """
    import React from 'react'
    import ReactDOM from 'react-dom/client'
    import App from './App'
    import './styles.css'

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
    """
).strip() + "\n"

FRONTEND_APP = dedent(
    """
    import React, { useEffect, useState } from 'react'

    const serviceCards = [
      'staff-service',
      'manager-service',
      'customer-service',
      'catalog-service',
      'book-service',
      'cart-service',
      'order-service',
      'ship-service',
      'pay-service',
      'comment-rate-service',
      'recommender-ai-service',
    ]

    export default function App() {
      const [gatewayStatus, setGatewayStatus] = useState('loading')

      useEffect(() => {
        fetch('/api/v1/healthz/')
          .then((response) => response.json())
          .then((payload) => setGatewayStatus(payload.status || 'unknown'))
          .catch(() => setGatewayStatus('offline'))
      }, [])

      return (
        <main className="page">
          <section className="hero">
            <p className="eyebrow">Django + React + Docker</p>
            <h1>Microservice Book Platform</h1>
            <p className="lead">
              A starter dashboard connected to the API gateway and the 11 backend services.
            </p>
            <div className="status-pill">Gateway: {gatewayStatus}</div>
          </section>

          <section className="grid">
            {serviceCards.map((service) => (
              <article key={service} className="card">
                <h2>{service}</h2>
                <p>Health, routing and CRUD hooks are scaffolded in Dockerized Django.</p>
              </article>
            ))}
          </section>
        </main>
      )
    }
    """
).strip() + "\n"

FRONTEND_STYLES = dedent(
    """
    :root {
      color-scheme: dark;
      font-family: Inter, system-ui, sans-serif;
      background: #08111f;
      color: #e7eefc;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      background: radial-gradient(circle at top, #19345c, #08111f 55%);
    }

    .page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 48px 24px 64px;
    }

    .hero {
      display: grid;
      gap: 12px;
      margin-bottom: 32px;
    }

    .eyebrow {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: #8fb3ff;
      font-size: 0.8rem;
    }

    h1 {
      margin: 0;
      font-size: clamp(2.6rem, 6vw, 5rem);
      line-height: 0.95;
    }

    .lead {
      max-width: 680px;
      margin: 0;
      color: #b7c6e4;
      font-size: 1.05rem;
    }

    .status-pill {
      width: fit-content;
      padding: 10px 14px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(10px);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    .card {
      padding: 18px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      min-height: 150px;
    }

    .card h2 {
      margin: 0 0 10px;
      font-size: 1.05rem;
    }

    .card p {
      margin: 0;
      color: #bfd0ee;
      line-height: 1.6;
    }
    """
).strip() + "\n"

def compose_template() -> str:
    service_blocks = []
    for service in SERVICES:
        service_blocks.append(
            dedent(
                f"""
                {service['name']}:
                  build:
                    context: ./services/{service['name']}
                  environment:
                    DJANGO_SECRET_KEY: dev-secret
                    DEBUG: "1"
                    DATABASE_URL: postgres://books:books@postgres:5432/{service['db']}
                    SERVICE_NAME: {service['name']}
                    SERVICE_PORT: "8000"
                  ports:
                    - "{service['port']}:8000"
                  depends_on:
                    - postgres
                    - rabbitmq
                    - redis
                """
            ).rstrip()
        )

    gateway_targets = ','.join(f"{service['name']}:8000" for service in SERVICES)
    gateway_block = dedent(
        f"""
        api-gateway:
          build:
            context: ./services/api-gateway
          environment:
            DJANGO_SECRET_KEY: dev-secret
            DEBUG: "1"
            DATABASE_URL: postgres://books:books@postgres:5432/gateway_db
            SERVICE_NAME: api-gateway
            SERVICE_PORT: "8000"
            GATEWAY_TARGETS: "{gateway_targets}"
          ports:
            - "8000:8000"
          depends_on:
            - postgres
            - rabbitmq
            - redis
        """
    ).rstrip()

    header = dedent(
        """
        services:
          postgres:
            image: postgres:16-alpine
            environment:
              POSTGRES_USER: books
              POSTGRES_PASSWORD: books
              POSTGRES_DB: gateway_db
            ports:
              - "5432:5432"
            volumes:
              - postgres_data:/var/lib/postgresql/data
              - ./infra/postgres/init:/docker-entrypoint-initdb.d

          rabbitmq:
            image: rabbitmq:3-management-alpine
            ports:
              - "5672:5672"
              - "15672:15672"

          redis:
            image: redis:7-alpine
            ports:
              - "6379:6379"
        """
    ).rstrip()

    footer = dedent(
        """
        volumes:
          postgres_data:
        """
    ).rstrip()

    def indented(block: str) -> str:
        return indent(block, '  ')

    return header + "\n\n" + "\n\n".join(indented(block) for block in service_blocks) + "\n\n" + indented(gateway_block) + "\n\n" + indented(dedent(
        """
        frontend-react:
          build:
            context: ./frontend-react
          ports:
            - "5173:5173"
          depends_on:
            - api-gateway
        """
    ).rstrip()) + "\n\n" + footer + "\n"

POSTGRES_INIT = "\n".join(
    [
        "CREATE DATABASE staff_db;",
        "CREATE DATABASE manager_db;",
        "CREATE DATABASE customer_db;",
        "CREATE DATABASE catalog_db;",
        "CREATE DATABASE book_db;",
        "CREATE DATABASE cart_db;",
        "CREATE DATABASE order_db;",
        "CREATE DATABASE ship_db;",
        "CREATE DATABASE pay_db;",
        "CREATE DATABASE comment_rate_db;",
        "CREATE DATABASE recommender_db;",
    ]
) + "\n"

DOCKERFILE = dedent(
    """
    FROM python:3.11-slim

    ENV PYTHONDONTWRITEBYTECODE=1 \
        PYTHONUNBUFFERED=1

    WORKDIR /app

    RUN apt-get update \
        && apt-get install -y --no-install-recommends gcc netcat-traditional \
        && rm -rf /var/lib/apt/lists/*

    COPY requirements.txt /app/requirements.txt
    RUN pip install --no-cache-dir -r requirements.txt

    COPY . /app

    CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
    """
).strip() + "\n"

MANAGE = dedent(
    """
    #!/usr/bin/env python
    import os
    import sys

    if __name__ == '__main__':
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
        from django.core.management import execute_from_command_line

        execute_from_command_line(sys.argv)
    """
).strip() + "\n"

SETTINGS_TEMPLATE = dedent(
    """
    from pathlib import Path
    import environ
    import os

    BASE_DIR = Path(__file__).resolve().parent.parent
    env = environ.Env(DEBUG=(bool, False))
    environ.Env.read_env(BASE_DIR / '.env')

    SECRET_KEY = env('DJANGO_SECRET_KEY', default='dev-secret')
    DEBUG = env.bool('DEBUG', default=True)
    ALLOWED_HOSTS = ['*']

    INSTALLED_APPS = [
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
        'rest_framework',
        'corsheaders',
        'core',
    ]

    MIDDLEWARE = [
        'corsheaders.middleware.CorsMiddleware',
        'django.middleware.security.SecurityMiddleware',
        'whitenoise.middleware.WhiteNoiseMiddleware',
        'django.contrib.sessions.middleware.SessionMiddleware',
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
    ]

    ROOT_URLCONF = 'config.urls'
    TEMPLATES = [
        {
            'BACKEND': 'django.template.backends.django.DjangoTemplates',
            'DIRS': [],
            'APP_DIRS': True,
            'OPTIONS': {
                'context_processors': [
                    'django.template.context_processors.request',
                    'django.contrib.auth.context_processors.auth',
                    'django.contrib.messages.context_processors.messages',
                ],
            },
        },
    ]

    WSGI_APPLICATION = 'config.wsgi.application'
    ASGI_APPLICATION = 'config.asgi.application'

    DATABASES = {
        'default': env.db('DATABASE_URL', default='sqlite:///db.sqlite3')
    }

    AUTH_PASSWORD_VALIDATORS = []
    LANGUAGE_CODE = 'en-us'
    TIME_ZONE = 'UTC'
    USE_I18N = True
    USE_TZ = True
    STATIC_URL = '/static/'
    STATIC_ROOT = BASE_DIR / 'staticfiles'
    DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

    REST_FRAMEWORK = {
        'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
        'DEFAULT_AUTHENTICATION_CLASSES': [],
        'DEFAULT_PERMISSION_CLASSES': [],
    }

    CORS_ALLOW_ALL_ORIGINS = True
    SERVICE_NAME = os.getenv('SERVICE_NAME', 'service')
    SERVICE_PORT = os.getenv('SERVICE_PORT', '8000')
    """
).strip() + "\n"

URLS_TEMPLATE = dedent(
    """
    from django.contrib import admin
    from django.http import JsonResponse
    from django.urls import include, path
    from core.views import healthz

    urlpatterns = [
        path('admin/', admin.site.urls),
        path('healthz/', healthz),
        path('api/v1/', include('core.urls')),
    ]
    """
).strip() + "\n"

WSGI = dedent(
    """
    import os
    from django.core.wsgi import get_wsgi_application

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    application = get_wsgi_application()
    """
).strip() + "\n"

ASGI = dedent(
    """
    import os
    from django.core.asgi import get_asgi_application

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    application = get_asgi_application()
    """
).strip() + "\n"

APP_VIEWS = dedent(
    """
    from rest_framework import status, viewsets
    from rest_framework.decorators import action
    from rest_framework.response import Response
    from django.http import JsonResponse
    from .models import DomainItem
    from .serializers import DomainItemSerializer

    def healthz(request):
        return JsonResponse({'status': 'ok', 'service': 'SERVICE_NAME'})

    class DomainItemViewSet(viewsets.ModelViewSet):
        queryset = DomainItem.objects.all().order_by('-id')
        serializer_class = DomainItemSerializer

        @action(detail=False, methods=['get'])
        def sample(self, request):
            return Response({'service': 'SERVICE_NAME', 'message': 'sample endpoint'})
    """
).strip() + "\n"

APP_SERIALIZER = dedent(
    """
    from rest_framework import serializers
    from .models import DomainItem

    class DomainItemSerializer(serializers.ModelSerializer):
        class Meta:
            model = DomainItem
            fields = ['id', 'name', 'description', 'created_at', 'updated_at']
    """
).strip() + "\n"

APP_MODELS = dedent(
    """
    from django.db import models

    class DomainItem(models.Model):
        name = models.CharField(max_length=255)
        description = models.TextField(blank=True)
        created_at = models.DateTimeField(auto_now_add=True)
        updated_at = models.DateTimeField(auto_now=True)

        class Meta:
            ordering = ['-id']

        def __str__(self):
            return self.name
    """
).strip() + "\n"

APP_URLS = dedent(
    """
    from rest_framework.routers import DefaultRouter
    from django.urls import path, include
    from .views import DomainItemViewSet

    router = DefaultRouter()
    router.register(r'items', DomainItemViewSet, basename='items')

    urlpatterns = [
        path('', include(router.urls)),
    ]
    """
).strip() + "\n"

APP_APPS = dedent(
    """
    from django.apps import AppConfig

    class CoreConfig(AppConfig):
        default_auto_field = 'django.db.models.BigAutoField'
        name = 'core'
    """
).strip() + "\n"


def service_model_template(model_name: str) -> str:
  return dedent(
    f"""
    from django.db import models

    class {model_name}(models.Model):
      name = models.CharField(max_length=255)
      description = models.TextField(blank=True)
      created_at = models.DateTimeField(auto_now_add=True)
      updated_at = models.DateTimeField(auto_now=True)

      class Meta:
        ordering = ['-id']

      def __str__(self):
        return self.name
    """
  ).strip() + "\n"


def service_serializer_template(model_name: str) -> str:
  return dedent(
    f"""
    from rest_framework import serializers
    from .models import {model_name}

    class {model_name}Serializer(serializers.ModelSerializer):
      class Meta:
        model = {model_name}
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
    """
  ).strip() + "\n"


def service_views_template(service_name: str, model_name: str) -> str:
  return dedent(
    f"""
    from django.http import JsonResponse
    from rest_framework import viewsets
    from rest_framework.decorators import action
    from rest_framework.response import Response
    from .models import {model_name}
    from .serializers import {model_name}Serializer

    def healthz(request):
      return JsonResponse({{'status': 'ok', 'service': '{service_name}'}})

    class {model_name}ViewSet(viewsets.ModelViewSet):
      queryset = {model_name}.objects.all().order_by('-id')
      serializer_class = {model_name}Serializer

      @action(detail=False, methods=['get'])
      def sample(self, request):
        return Response({{'service': '{service_name}', 'message': 'sample endpoint'}})
    """
  ).strip() + "\n"


def service_urls_template(resource: str, model_name: str) -> str:
  return dedent(
    f"""
    from rest_framework.routers import DefaultRouter
    from django.urls import path, include
    from .views import {model_name}ViewSet

    router = DefaultRouter()
    router.register(r'{resource}', {model_name}ViewSet, basename='{resource}')

    urlpatterns = [
      path('', include(router.urls)),
    ]
    """
  ).strip() + "\n"


def service_admin_template(model_name: str) -> str:
  return dedent(
    f"""
    from django.contrib import admin
    from .models import {model_name}

    admin.site.register({model_name})
    """
  ).strip() + "\n"

GATEWAY_SETTINGS = dedent(
    """
    from pathlib import Path
    import environ
    import os

    BASE_DIR = Path(__file__).resolve().parent.parent
    env = environ.Env(DEBUG=(bool, False))
    environ.Env.read_env(BASE_DIR / '.env')

    SECRET_KEY = env('DJANGO_SECRET_KEY', default='dev-secret')
    DEBUG = env.bool('DEBUG', default=True)
    ALLOWED_HOSTS = ['*']

    INSTALLED_APPS = [
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
        'rest_framework',
        'corsheaders',
        'gateway',
    ]

    MIDDLEWARE = [
        'corsheaders.middleware.CorsMiddleware',
        'django.middleware.security.SecurityMiddleware',
        'whitenoise.middleware.WhiteNoiseMiddleware',
        'django.contrib.sessions.middleware.SessionMiddleware',
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
    ]

    ROOT_URLCONF = 'config.urls'
    TEMPLATES = [
        {
            'BACKEND': 'django.template.backends.django.DjangoTemplates',
            'DIRS': [],
            'APP_DIRS': True,
            'OPTIONS': {
                'context_processors': [
                    'django.template.context_processors.request',
                    'django.contrib.auth.context_processors.auth',
                    'django.contrib.messages.context_processors.messages',
                ],
            },
        },
    ]

    WSGI_APPLICATION = 'config.wsgi.application'
    ASGI_APPLICATION = 'config.asgi.application'
    DATABASES = {
        'default': env.db('DATABASE_URL', default='sqlite:///db.sqlite3')
    }
    AUTH_PASSWORD_VALIDATORS = []
    LANGUAGE_CODE = 'en-us'
    TIME_ZONE = 'UTC'
    USE_I18N = True
    USE_TZ = True
    STATIC_URL = '/static/'
    STATIC_ROOT = BASE_DIR / 'staticfiles'
    DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
    REST_FRAMEWORK = {'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer']}
    CORS_ALLOW_ALL_ORIGINS = True
    SERVICE_NAME = os.getenv('SERVICE_NAME', 'api-gateway')
    SERVICE_PORT = os.getenv('SERVICE_PORT', '8000')
    GATEWAY_TARGETS = os.getenv('GATEWAY_TARGETS', '')
    """
).strip() + "\n"

GATEWAY_URLS = dedent(
    """
    from django.contrib import admin
    from django.urls import include, path
    from gateway.views import healthz, routes, proxy

    urlpatterns = [
        path('admin/', admin.site.urls),
        path('healthz/', healthz),
        path('api/v1/routes/', routes),
        path('api/v1/proxy/<str:service>/<path:path>/', proxy),
    ]
    """
).strip() + "\n"

GATEWAY_VIEWS = dedent(
    """
    import os
    import requests
    from django.http import JsonResponse, HttpResponse
    from django.views.decorators.csrf import csrf_exempt

    def healthz(request):
        return JsonResponse({'status': 'ok', 'service': 'api-gateway'})

    def routes(request):
        raw_targets = os.getenv('GATEWAY_TARGETS', '')
        targets = []
        for pair in raw_targets.split(','):
            if not pair:
                continue
            service, host_port = pair.split(':')
            targets.append({'service': service, 'upstream': host_port})
        return JsonResponse({'status': 'ok', 'routes': targets})

    @csrf_exempt
    def proxy(request, service, path):
        raw_targets = os.getenv('GATEWAY_TARGETS', '')
        target_map = {}
        for pair in raw_targets.split(','):
            if not pair:
                continue
            name, host_port = pair.split(':')
            target_map[name] = host_port
        upstream = target_map.get(service)
        if not upstream:
            return JsonResponse({'error': 'unknown service'}, status=404)
        url = f'http://{upstream}/api/v1/{path}'
        response = requests.request(
            method=request.method,
            url=url,
            params=request.GET,
            data=request.body,
            headers={'Content-Type': request.headers.get('Content-Type', 'application/json')},
            timeout=10,
        )
        return HttpResponse(response.content, status=response.status_code, content_type=response.headers.get('Content-Type', 'application/json'))
    """
).strip() + "\n"

GATEWAY_APP = dedent(
    """
    from django.apps import AppConfig

    class GatewayConfig(AppConfig):
        default_auto_field = 'django.db.models.BigAutoField'
        name = 'gateway'
    """
).strip() + "\n"

GATEWAY_REQUIREMENTS = COMMON_REQUIREMENTS

SERVICE_DOCKERFILE = DOCKERFILE

SERVICE_REQUIREMENTS = COMMON_REQUIREMENTS


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def write(path: Path, content: str) -> None:
    ensure_dir(path.parent)
    path.write_text(content, encoding='utf-8')


def create_frontend() -> None:
    root = ROOT / 'frontend-react'
    write(root / 'package.json', FRONTEND_PACKAGE)
    write(root / 'index.html', FRONTEND_INDEX)
    write(root / 'vite.config.js', FRONTEND_VITE_CONFIG)
    write(root / 'src' / 'main.jsx', FRONTEND_MAIN)
    write(root / 'src' / 'App.jsx', FRONTEND_APP)
    write(root / 'src' / 'styles.css', FRONTEND_STYLES)
    write(root / 'Dockerfile', dedent(
        """
        FROM node:20-alpine
        WORKDIR /app
        COPY package.json ./
        RUN npm install
        COPY . .
        EXPOSE 5173
        CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
        """
    ).strip() + "\n")


def create_gateway() -> None:
    root = ROOT / 'services' / GATEWAY['name']
    write(root / 'requirements.txt', GATEWAY_REQUIREMENTS)
    write(root / 'Dockerfile', SERVICE_DOCKERFILE)
    write(root / 'manage.py', MANAGE)
    write(root / 'config' / '__init__.py', '')
    write(root / 'config' / 'settings.py', GATEWAY_SETTINGS)
    write(root / 'config' / 'urls.py', GATEWAY_URLS)
    write(root / 'config' / 'wsgi.py', WSGI)
    write(root / 'config' / 'asgi.py', ASGI)
    write(root / 'gateway' / '__init__.py', '')
    write(root / 'gateway' / 'apps.py', GATEWAY_APP)
    write(root / 'gateway' / 'views.py', GATEWAY_VIEWS)
    write(root / '.env.example', dedent(
        """
        DJANGO_SECRET_KEY=dev-secret
        DEBUG=1
        DATABASE_URL=postgres://books:books@postgres:5432/gateway_db
        SERVICE_NAME=api-gateway
        SERVICE_PORT=8000
        GATEWAY_TARGETS=staff-service:8001,manager-service:8002,customer-service:8003,catalog-service:8004,book-service:8005,cart-service:8006,order-service:8007,ship-service:8008,pay-service:8009,comment-rate-service:8010,recommender-ai-service:8011
        """
    ).strip() + "\n")


def create_service(service: dict) -> None:
    root = ROOT / 'services' / service['name']
    model_name = service['model']
    write(root / 'requirements.txt', SERVICE_REQUIREMENTS)
    write(root / 'Dockerfile', SERVICE_DOCKERFILE)
    write(root / 'manage.py', MANAGE)
    write(root / 'config' / '__init__.py', '')
    write(root / 'config' / 'settings.py', SETTINGS_TEMPLATE)
    write(root / 'config' / 'urls.py', URLS_TEMPLATE)
    write(root / 'config' / 'wsgi.py', WSGI)
    write(root / 'config' / 'asgi.py', ASGI)
    write(root / 'core' / '__init__.py', '')
    write(root / 'core' / 'apps.py', APP_APPS)
    write(root / 'core' / 'models.py', service_model_template(model_name))
    write(root / 'core' / 'serializers.py', service_serializer_template(model_name))
    write(root / 'core' / 'views.py', service_views_template(service['name'], model_name))
    write(root / 'core' / 'urls.py', service_urls_template(service['resource'], model_name))
    write(root / 'core' / 'admin.py', service_admin_template(model_name))
    write(root / 'core' / 'migrations' / '__init__.py', '')
    write(root / '.env.example', dedent(f"""
        DJANGO_SECRET_KEY=dev-secret
        DEBUG=1
        DATABASE_URL=postgres://books:books@postgres:5432/{service['db']}
        SERVICE_NAME={service['name']}
        SERVICE_PORT={service['port']}
        """).strip() + "\n")


def create_compose_and_infra() -> None:
    write(ROOT / 'docker-compose.yml', compose_template())
    init_dir = ROOT / 'infra' / 'postgres' / 'init'
    write(init_dir / '01-create-dbs.sql', POSTGRES_INIT)
    write(ROOT / '.env.example', dedent(
        """
        DJANGO_SECRET_KEY=dev-secret
        DEBUG=1
        """
    ).strip() + "\n")


def main() -> None:
    create_compose_and_infra()
    create_frontend()
    create_gateway()
    for service in SERVICES:
        create_service(service)
    print('Scaffold generated successfully.')


if __name__ == '__main__':
    main()
