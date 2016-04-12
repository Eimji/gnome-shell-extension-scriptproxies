#!/bin/bash

# In this proxy script cnfiguration, we suppose:
# proxy server is named 'patatedouce' on domainName.com
# port used by the proxy: '3128'

#System-wide proxy
declare -x {http,https,ftp}_proxy="http://patatedouce:3128/"
declare -x no_proxy="localhost,127.0.0.1,10.{1..255}.{1..255}.{1..255},192.168.{1..255}.{1..255},*.domainName.com"

#Gnome
gsettings set org.gnome.system.proxy mode 'manual' 
gsettings set org.gnome.system.proxy.http host 'patatedouce'
gsettings set org.gnome.system.proxy.http port 3128
gsettings set org.gnome.system.proxy.ftp host 'patatedouce'
gsettings set org.gnome.system.proxy.ftp port 3128
gsettings set org.gnome.system.proxy.https host 'patatedouce'
gsettings set org.gnome.system.proxy.https port 3128
gsettings set org.gnome.system.proxy ignore-hosts "['localhost', '127.0.0.0/8', '10.0.0.0/8', '192.168.0.0/16', '172.16.0.0/12', '*.domainName.com']"

#Git
git config --global http.proxy http://patatedouce:3128
git config --global https.proxy https://patatedouce:3128


#For Docker: 
#ln -s ~/.local/share/docker/docker.service /etc/systemd/system/docker.service
# add the following line to the Docker conf file:
#Environment="HTTP_PROXY=http://patatedouce:3128/" "HTTPS_PROXY=https://proxy:8080/" 
#"NO_PROXY=localhost,127.0.0.0/8,10.0.0.0/8,192.168.0.0/16,172.16.0.0/12,*.domainName.com"
sed -i 's/#Environment="HTTP_PROXY/Environment="HTTP_PROXY/g' ~/.local/share/docker/docker.service

#SVN
sed -i 's/#http-proxy-host = patatedouce/http-proxy-host = patatedouce/g' ~/.subversion/servers
sed -i 's/#http-proxy-port = 3128/http-proxy-port = 3128/g' ~/.subversion/servers

#AndroidStudio
sed -i '3i<option name="USE_HTTP_PROXY" value="true" />' ~/.AndroidStudio2.0/config/options/proxy.settings.xml

#Synaptic: ln -s ~/.local/share/synaptic/synaptic.conf /root/.synaptic/synaptic.conf
sed -i 's/useProxy "0/useProxy "1/g' ~/.local/share/synaptic/synaptic.conf

