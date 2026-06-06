#!/bin/bash
LICENSE_DIR="/c/Users/DELL/AppData/Local/Android/Sdk/licenses"
mkdir -p "$LICENSE_DIR"
echo "24333f8a63b6825ea13c551c332f8b699af1e2e0" > "$LICENSE_DIR/android-sdk-license"
echo "8933bad161af4178b1185d1a37fbf41ea5269c55" >> "$LICENSE_DIR/android-sdk-license"
echo "84831b9409646a918e30573bab4c9c91346d8abd" >> "$LICENSE_DIR/android-sdk-license"
echo "Done"
cat "$LICENSE_DIR/android-sdk-license"
