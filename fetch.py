import json
import time
import codecs
import requests
from config import OcpApimSubscriptionKey

data = {
    "language": "en",
    "analyzerIds": [
        "08ea174b-bfdb-4e64-987e-602f85da7f72",
        "4fa79af1-f22c-408d-98bb-b7d7aeef7f04"],
    "text": "You are"
}

headers = {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': OcpApimSubscriptionKey
}


def create_dict():
    d = dict()

    errors = 0

    with open('./hobbit.txt', 'r') as f:
        paragraphs = f.read().split('\n\n')

    for paragraph in paragraphs:
        data["text"] = paragraph

        r = requests.post('https://api.projectoxford.ai/linguistics/v1.0/analyze', data=json.dumps(data),
                          headers=headers)

        result = json.loads(r.text)

        try:
            tokens = result[0]['result'][0]['Tokens']
            pos_tags = result[1]['result'][0]

            for i, token in enumerate(tokens):
                this_token = token['RawToken']
                this_pos_tag = pos_tags[i]

                if this_pos_tag not in d:
                    d[this_pos_tag] = [this_token]
                else:
                    if this_token not in d[this_pos_tag]:
                        d[this_pos_tag].append(this_token)

        except:
            errors += 1
            print 'Exception {}'.format(errors)

        time.sleep(1.1)

    with codecs.open('./dict.json', 'w', 'utf-8') as w:
        json.dump(d, w, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    create_dict()
