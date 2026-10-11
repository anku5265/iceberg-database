import requests
import sys

with open(r'd:\icebergdb\HP_POLICE_GROUND_MASTER_BLUEPRINT.pdf', 'rb') as f:
    files = {'file': ('HP_POLICE_GROUND_MASTER_BLUEPRINT.pdf', f, 'application/pdf')}
    r = requests.post('https://tmpfiles.org/api/v1/upload', files=files)
    if r.status_code == 200:
        raw_url = r.json()['data']['url']
        dl_url = raw_url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')
        print('DIRECT_URL:', dl_url)
    else:
        print('Failed:', r.status_code, r.text)
