import requests
import base64
import json
from phpserialize import unserialize
from Crypto.Cipher import AES
APP_SECRET_KEY="###############" #App Secret key
APP_API_LINK="https://api.autho.app/app/auth/###############" #App Api Link

from datetime import datetime
def DecryptEndToEnd(AppKey,cipher):
    key = bytes(base64.b64decode(AppKey))
    enc_pass = cipher
    p_obj = json.loads(base64.b64decode(enc_pass).decode())
    decobj = AES.new(key, AES.MODE_CBC, base64.b64decode(p_obj['iv']))
    data = decobj.decrypt(base64.b64decode(p_obj['value']))
    return str(unserialize(data).decode())


def checkAuth(auth_method,auth_value):
    request = requests.post(APP_API_LINK, {"auth_method" : auth_method, "auth_value" : auth_value})
    if(request.status_code == 200):
        json_encrypted = json.loads(DecryptEndToEnd(APP_SECRET_KEY, request.json()['auth']))
        if(datetime.now().timestamp() > json_encrypted['auth_expires_at'] and json_encrypted['auth_access_status'] == False):
            return False
        return True
    return False

#ip || custom
if checkAuth("ip",0):
    print('Welcome to the app')