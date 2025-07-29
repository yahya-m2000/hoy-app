#!/bin/bash

set -e

echo "Starting ci_post_clone.sh script"

# Install CocoaPods if not already installed
if ! command -v pod &> /dev/null; then
    echo "CocoaPods not found, installing..."
    sudo gem install cocoapods
else
    echo "CocoaPods already installed"
fi

# Navigate to iOS directory and install pods
cd ../
echo "Running pod install..."
pod install

echo "ci_post_clone.sh completed successfully"