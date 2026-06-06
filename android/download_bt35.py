import os
import urllib.request
import zipfile
import shutil
import sys

sdk_home = os.environ.get('LOCALAPPDATA', 'C:/Users/DELL/AppData/Local')
sdk_dir = os.path.join(sdk_home, 'Android', 'Sdk')
bt35_dir = os.path.join(sdk_dir, 'build-tools', '35.0.0')
os.makedirs(bt35_dir, exist_ok=True)

# License hashes
license_dir = os.path.join(sdk_dir, 'licenses')
os.makedirs(license_dir, exist_ok=True)
hashes = [
    '24333f8a63b6825ea13c551c332f8b699af1e2e0',
    '8933bad161af4178b1185d1a37fbf41ea5269c55',
    '84831b9409646a918e30573bab4c9c91346d8abd',
]
with open(os.path.join(license_dir, 'android-sdk-license'), 'w') as f:
    for h in hashes:
        f.write(h + '\n')
print('Licenses updated')

# Download build-tools 35
url = 'https://dl.google.com/android/repository/build-tools_r35-windows.zip'
zip_path = os.path.join(os.environ.get('TEMP', '/tmp'), 'build-tools-35.zip')
print(f'Downloading {url}...')
urllib.request.urlretrieve(url, zip_path)
print(f'Downloaded to {zip_path}')

# Extract
extract_dir = os.path.join(os.environ.get('TEMP', '/tmp'), 'bt35-extract')
with zipfile.ZipFile(zip_path, 'r') as zf:
    zf.extractall(extract_dir)
print(f'Extracted to {extract_dir}')

# Copy to SDK
inner = os.path.join(extract_dir, 'android-15')
for item in os.listdir(inner):
    s = os.path.join(inner, item)
    d = os.path.join(bt35_dir, item)
    if os.path.isdir(s):
        shutil.copytree(s, d, dirs_exist_ok=True)
    else:
        shutil.copy2(s, d)
print(f'Copied to {bt35_dir}')
print('Done!')
