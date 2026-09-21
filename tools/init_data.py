"""Initialize user-owned storage without overwriting existing settings."""
import shutil
from common import ROOT, DATA_ROOT, data_path, write

def initialize():
    for name in ('cases', 'shared/styles', 'shared/brand', 'shared/voice/reference-voice', 'models'):
        data_path(name).mkdir(parents=True, exist_ok=True)
    if not data_path('brand.json').exists():
        write(data_path('brand.json'), {'name': '示範品牌', 'logo': None})
    for suffix in ('', '.zh-CN', '.en'):
        target=data_path('shared/voice/reference-voice', f'README{suffix}.md')
        if not target.exists():
            target.write_text((ROOT/'templates'/f'voice-catalog{suffix}.md').read_text().replace('(voice-catalog', '(README'), encoding='utf-8')
    return DATA_ROOT

if __name__=='__main__': print(initialize())
