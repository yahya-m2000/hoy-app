#!/bin/bash

set -e

echo "Starting ci_post_clone.sh script"

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
    echo "Node.js not found, installing..."
    # Install Node.js using Homebrew (available on Xcode Cloud)
    brew install node
else
    echo "Node.js already installed: $(node --version)"
fi

# Navigate to project root and install npm dependencies
cd ../../
echo "Installing npm dependencies..."
npm ci

# Install CocoaPods if not already installed
if ! command -v pod &> /dev/null; then
    echo "CocoaPods not found, installing..."
    sudo gem install cocoapods
else
    echo "CocoaPods already installed"
fi

# Navigate to iOS directory and install pods
cd ios/
echo "Running pod install..."
pod install

echo "ci_post_clone.sh completed successfully"