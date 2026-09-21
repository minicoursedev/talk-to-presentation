from common import ROOT, data_path, read, write
from huggingface_hub import snapshot_download
config=read(ROOT/'model.json')
path=snapshot_download(repo_id=config['repo'],revision=config['revision'],local_dir=str(data_path(config['directory'])))
write(data_path(config['directory'])/'download-source.json',config)
print(path)
