"""Select one project template for a user-owned document, without translation links."""
from common import ROOT

DOC_LANGUAGES = {'zh-TW': '', 'zh-CN': '.zh-CN', 'en': '.en'}

def document_body(text):
    if text.startswith('[繁體中文]('):
        return text.split('\n', 1)[1].lstrip('\n')
    return text

def document_template(name, language='zh-TW'):
    return document_body((ROOT/'templates'/f'{name}{DOC_LANGUAGES[language]}.md').read_text(encoding='utf-8'))
