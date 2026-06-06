@echo off
echo Adding additional license hashes...
echo 8933bad161af4178b1185d1a37fbf41ea5269c55 >> "%LOCALAPPDATA%\Android\Sdk\licenses\android-sdk-license"
echo 84831b9409646a918e30573bab4c9c91346d8abd >> "%LOCALAPPDATA%\Android\Sdk\licenses\android-sdk-license"
echo 33b6d9119e1c9a8b2e18b8d5dda0d2e7d8a3b1c2 >> "%LOCALAPPDATA%\Android\Sdk\licenses\android-sdk-license"
echo Done. Contents:
type "%LOCALAPPDATA%\Android\Sdk\licenses\android-sdk-license"
