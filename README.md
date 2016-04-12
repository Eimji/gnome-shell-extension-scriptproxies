# Gnome Shell extension *Script your Proxies*

*   The 'Script your proxies' extension allows you to enable/disable a network proxy for all applications 
or services you use daily, by simply using a shell script. 

*   Let us consider the following situation:
        
    -   at your office, you need to accommodate a proxy server whose name is *patatedouce* and whose 
    used port is *3128*.  
    -   at your home, you do not have any proxy: you have a direct access to Internet

*   At your office, you can write a script, e.g. named as *set_my_office_proxy.sh* to enable the proxy 
configuration for all applications or services you can use. For example, this script can be as follows:
        
        #!/bin/bash

        #System-wide proxy
        declare -x {http,https,ftp}_proxy="http://patatedouce:3128/"
        declare -x no_proxy="localhost,127.0.0.1,10.{1..255}.{1..255}.{1..255},192.168.{1..255}.{1..255},
        *.domainName.com"

        #Gnome
        gsettings set org.gnome.system.proxy mode 'manual' 
        gsettings set org.gnome.system.proxy.http host 'patatedouce'
        gsettings set org.gnome.system.proxy.http port 3128
        gsettings set org.gnome.system.proxy.ftp host 'patatedouce'
        gsettings set org.gnome.system.proxy.ftp port 3128
        gsettings set org.gnome.system.proxy.https host 'patatedouce'
        gsettings set org.gnome.system.proxy.https port 3128
        gsettings set org.gnome.system.proxy ignore-hosts "['localhost', '127.0.0.0/8', '10.0.0.0/8', 
        '192.168.0.0/16', '172.16.0.0/12', '*.domainName.com']"

        #Git
        git config --global http.proxy http://patatedouce:3128
        git config --global https.proxy https://patatedouce:3128

        #Docker: ln -s ~/.local/share/docker/docker.service /etc/systemd/system/docker.service
        sed -i 's/#Environment="HTTP_PROXY/Environment="HTTP_PROXY/g' ~/.local/share/docker/docker.service

*   At your home, you then write a script, e.g. *unset_proxy.sh*, to disable the proxy configuration used 
at your office. This 'unset_proxy.sh' script is as follows:

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

*   With the 'Script your proxies' extension, you can now easily enable those two proxy scripts depending 
on where you are (at home or office).


## Installation 

*   If possible, please install from the Gnome Shell Extension website.
[Install Script your Proxies](https://extensions.gnome.org/ "Gnome Shell extension page")
*   Additional information is available at 
[Github](https://github.com/Eimji/gnome-shell-extension-scriptproxies "Github of the extension")


## How to use

*   For each network proxy, you need to write a script for configuring the applications/services you use. 
*   Click on *New proxy* to start writing this script!
*   The *No proxy* entry is for a network environment without any proxy. The *No proxy* script is then 
used to undo all the settings for a proxy.
*   See the two examples of a proxy script and *No proxy* on the Github page of the extension:
*Example_proxy.sh* and *Example_unset_proxy.sh*
*   NB: the *No proxy* entry cannot be deleted:
    -   (if you install the extension, I suppose you work in at least two different 
    network environments, with a proxy server, and you often need to switch between 
    these two network configurations; e.g. office and home) 
    -   (genarally, you do not have any proxy at your home network)


## Contact

*   Comments, suggestions or requests: Twitter @Eimji or email eimji.hvp@gmail.com
*   Bug reports: on the Github page of the extension. 


## Licence

*   The Gnome Shell extension *Script your Proxies* is covered by copyright and is provided under the terms
of the GNU General Public License.
*   See the copyright statement in the file extension.js and the file
COPYING for details.

