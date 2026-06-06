import os

sdk_home = os.environ.get('LOCALAPPDATA', 'C:/Users/DELL/AppData/Local')
license_dir = os.path.join(sdk_home, 'Android', 'Sdk', 'licenses')
os.makedirs(license_dir, exist_ok=True)

hashes = [
    '24333f8a63b6825ea13c551c332f8b699af1e2e0',
    '8933bad161af4178b1185d1a37fbf41ea5269c55',
    '84831b9409646a918e30573bab4c9c91346d8abd',
]

filepath = os.path.join(license_dir, 'android-sdk-license')
with open(filepath, 'w') as f:
    for h in hashes:
        f.write(h + '\n')

print(f'License file written to {filepath}')
with open(filepath) as f:
    print(f.read())
