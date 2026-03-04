import http.server
import json
import os
import urllib.request
import urllib.error

PORT = 5000

OTS_CALENDARS = [
    'https://a.pool.opentimestamps.org',
    'https://b.pool.opentimestamps.org',
    'https://alice.btc.calendar.opentimestamps.org',
    'https://bob.btc.calendar.opentimestamps.org',
]

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/ots/stamp':
            self._proxy_ots_stamp()
        elif self.path == '/api/ots/verify':
            self._proxy_ots_verify()
        else:
            self.send_error(404)

    def do_GET(self):
        if self.path.startswith('/api/ots/stamp/'):
            self._proxy_ots_get_stamp()
        elif self.path == '/api/ipfs/check' or self.path.startswith('/api/ipfs/check?'):
            self._proxy_ipfs_check()
        else:
            super().do_GET()

    def _proxy_ots_stamp(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        results = []
        for cal in OTS_CALENDARS:
            try:
                url = f'{cal}/digest'
                req = urllib.request.Request(
                    url,
                    data=body,
                    headers={'Content-Type': 'application/x-www-form-urlencoded'},
                    method='POST'
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    ots_data = resp.read()
                    results.append({
                        'calendar': cal,
                        'success': True,
                        'data': ots_data.hex()
                    })
            except Exception as e:
                results.append({
                    'calendar': cal,
                    'success': False,
                    'error': str(e)
                })

        any_success = any(r['success'] for r in results)
        self.send_response(200 if any_success else 502)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            'submitted': any_success,
            'results': results
        }).encode())

    def _proxy_ots_get_stamp(self):
        hash_hex = self.path.split('/api/ots/stamp/')[-1].strip('/')
        if not hash_hex or len(hash_hex) != 64:
            self.send_error(400, 'Invalid hash')
            return

        for cal in OTS_CALENDARS:
            try:
                url = f'{cal}/timestamp/{hash_hex}'
                req = urllib.request.Request(url, method='GET')
                with urllib.request.urlopen(req, timeout=10) as resp:
                    if resp.status == 200:
                        ots_data = resp.read()
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/octet-stream')
                        self.end_headers()
                        self.wfile.write(ots_data)
                        return
            except Exception:
                continue

        self.send_response(404)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'error': 'Timestamp not found on any calendar'}).encode())

    def _proxy_ots_verify(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body)
            hash_hex = data.get('hash', '')
        except Exception:
            self.send_error(400)
            return

        for cal in OTS_CALENDARS:
            try:
                url = f'{cal}/timestamp/{hash_hex}'
                req = urllib.request.Request(url, method='GET')
                with urllib.request.urlopen(req, timeout=10) as resp:
                    if resp.status == 200:
                        ots_data = resp.read()
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({
                            'found': True,
                            'calendar': cal,
                            'data': ots_data.hex(),
                            'size': len(ots_data)
                        }).encode())
                        return
            except Exception:
                continue

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            'found': False,
            'message': 'Pending Bitcoin confirmation (usually takes 1-2 hours)'
        }).encode())

    def _proxy_ipfs_check(self):
        from urllib.parse import urlparse, parse_qs
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        cid = params.get('cid', [''])[0]

        if not cid:
            self.send_error(400, 'Missing cid parameter')
            return

        gateways = [
            f'https://ipfs.io/ipfs/{cid}',
            f'https://cloudflare-ipfs.com/ipfs/{cid}',
            f'https://dweb.link/ipfs/{cid}',
        ]

        results = []
        for gw in gateways:
            try:
                req = urllib.request.Request(gw, method='HEAD')
                with urllib.request.urlopen(req, timeout=8) as resp:
                    results.append({
                        'gateway': gw,
                        'available': resp.status == 200,
                        'status': resp.status
                    })
            except urllib.error.HTTPError as e:
                results.append({'gateway': gw, 'available': False, 'status': e.code})
            except Exception as e:
                results.append({'gateway': gw, 'available': False, 'error': str(e)})

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            'cid': cid,
            'available': any(r.get('available') for r in results),
            'gateways': results
        }).encode())

    def log_message(self, fmt, *args):
        if '/api/' in (args[0] if args else ''):
            super().log_message(fmt, *args)
        else:
            super().log_message(fmt, *args)


if __name__ == '__main__':
    with http.server.HTTPServer(('0.0.0.0', PORT), Handler) as httpd:
        print(f'Guardian Net server on port {PORT}')
        print(f'  Static files: .')
        print(f'  OTS proxy:    /api/ots/stamp, /api/ots/verify')
        print(f'  IPFS check:   /api/ipfs/check?cid=...')
        httpd.serve_forever()
