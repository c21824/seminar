import os
import requests
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt


def _target_map() -> dict:
    raw_targets = os.getenv('GATEWAY_TARGETS', '')
    target_map = {}
    for pair in raw_targets.split(','):
        if not pair:
            continue
        name, port = pair.split(':', 1)
        target_map[name] = f'{name}:{port}'
    return target_map

def healthz(request):
    return JsonResponse({'status': 'ok', 'service': 'api-gateway'})

def routes(request):
    targets = []
    for service, host_port in _target_map().items():
        targets.append({'service': service, 'upstream': host_port})
    return JsonResponse({'status': 'ok', 'routes': targets})


def services_health(request):
    services = []
    for service, host_port in _target_map().items():
        url = f'http://{host_port}/healthz/'
        try:
            response = requests.get(url, timeout=2)
            if response.ok:
                services.append({'service': service, 'status': 'ok', 'upstream': host_port})
            else:
                services.append({'service': service, 'status': 'error', 'upstream': host_port})
        except requests.RequestException:
            services.append({'service': service, 'status': 'down', 'upstream': host_port})

    healthy = sum(1 for item in services if item['status'] == 'ok')
    return JsonResponse(
        {
            'status': 'ok',
            'gateway': 'api-gateway',
            'healthy': healthy,
            'total': len(services),
            'services': services,
        }
    )

@csrf_exempt
def proxy(request, service, path):
    upstream = _target_map().get(service)
    if not upstream:
        return JsonResponse({'error': 'unknown service'}, status=404)
    normalized_path = path.rstrip('/') + '/'
    url = f'http://{upstream}/api/v1/{normalized_path}'
    headers = {'Content-Type': request.headers.get('Content-Type', 'application/json')}
    if request.headers.get('Authorization'):
        headers['Authorization'] = request.headers['Authorization']
    try:
        response = requests.request(
            method=request.method,
            url=url,
            params=request.GET,
            data=request.body,
            headers=headers,
            timeout=10,
        )
    except requests.RequestException:
        return JsonResponse({'error': 'upstream unavailable', 'service': service}, status=503)
    return HttpResponse(response.content, status=response.status_code, content_type=response.headers.get('Content-Type', 'application/json'))
