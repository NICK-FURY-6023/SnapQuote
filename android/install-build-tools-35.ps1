$ANDROID_SDK = "$env:LOCALAPPDATA\Android\Sdk"
$TEMP = "$env:TEMP"

Write-Output "Downloading build-tools 35.0.0..."
curl.exe -L --connect-timeout 30 "https://dl.google.com/android/repository/build-tools_r35-windows.zip" -o "$TEMP\build-tools-35.zip"

Write-Output "Extracting..."
tar -xf "$TEMP\build-tools-35.zip" -C "$TEMP\build-tools-35-extracted"

Write-Output "Installing to SDK..."
New-Item -ItemType Directory -Force -Path "$ANDROID_SDK\build-tools\35.0.0" | Out-Null
Copy-Item -Recurse -Force "$TEMP\build-tools-35-extracted\android-15\*" "$ANDROID_SDK\build-tools\35.0.0\"

Write-Output "Verifying..."
Get-ChildItem "$ANDROID_SDK\build-tools\35.0.0"
