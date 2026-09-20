from common import ROOT, read, write
from huggingface_hub import snapshot_download
config=read(ROOT/'model.json')
path=snapshot_download(repo_id=config['repo'],revision=config['revision'],local_dir=str(ROOT/config['directory']))
write(ROOT/config['directory']/'download-source.json',config)
print(path)
