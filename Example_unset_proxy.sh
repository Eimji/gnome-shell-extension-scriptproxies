#!/bin/bash

#Unset system-wide proxy
declare -x {http,https,ftp}_proxy
declare -x no_proxy

#Gnome
gsettings set org.gnome.system.proxy mode 'none'

#Git
git config --global --unset http.proxy
git config --global --unset https.proxy

#Docker
sed -i 's/.*HTTP_PROXY/#&/' ~/.local/share/docker/docker.service

#SVN
sed -i 's/.*patatedouce/#&/' ~/.subversion/servers
sed -i 's/.*3128/#&/' ~/.subversion/servers

#AndroidStudio
sed -i '3d' ~/.AndroidStudio2.0/config/options/proxy.settings.xml

#Synaptic
sed -i 's/useProxy "1/useProxy "0/g' ~/.local/share/synaptic/synaptic.conf
