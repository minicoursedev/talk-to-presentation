"""Initialize user-owned storage without overwriting existing settings."""
import argparse
from common import DATA_ROOT, data_path, write
from user_documents import DOC_LANGUAGES, document_template

def initialize(doc_language='zh-TW'):
    for name in ('cases', 'shared/styles', 'shared/brand', 'shared/voice/reference-voice', 'models'):
        data_path(name).mkdir(parents=True, exist_ok=True)
    if not data_path('brand.json').exists():
        write(data_path('brand.json'), {'name': '示範品牌', 'logo': None})
    target=data_path('shared/voice/reference-voice', 'README.md')
    if not target.exists():
        target.write_text(document_template('voice-catalog', doc_language), encoding='utf-8')
    return DATA_ROOT

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--doc-language', choices=DOC_LANGUAGES, default='zh-TW', help='Language of the single user voice catalog')
    print(initialize(parser.parse_args().doc_language))
