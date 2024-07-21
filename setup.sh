#!/bin/sh
set -e

# Define versions
INSTALL_NODE_VER=14
INSTALL_NVM_VER=0.37.2


if [ "$1" = '--version' ]; then
	echo "==> Using specified node version - $2"
	INSTALL_NODE_VER=$2
fi

echo "==> Checking if .bashrc exists and is writable"
touch ~/.bashrc

echo "==> Installing node version manager (NVM). Version $INSTALL_NVM_VER"
# Removed if already installed
rm -rf ~/.nvm
# Unset exported variable
export NVM_DIR=

# Install nvm 
curl -o- https://raw.githubusercontent.com/creationix/nvm/v$INSTALL_NVM_VER/install.sh | bash
# Make nvm command available to terminal
source ~/.nvm/nvm.sh

echo "==> Installing node version $INSTALL_NODE_VER"
nvm install $INSTALL_NODE_VER

echo "==> Make this version system default"
nvm alias default $INSTALL_NODE_VER
nvm use default


echo "==> Installed versions"
nvm --version
node --version
npm --version

echo "==> Binary paths"
which npm
which node

echo "==> Installed node versions"
nvm ls

nvm cache clear

echo "==> Installing node modules"
npm install

echo "==> Completed. Plese execute 'npm run start' to run the application"