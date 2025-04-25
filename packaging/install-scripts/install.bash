#!/usr/bin/env bash

help() {
cat <<'EOT'
     Install Script for Virtualbox and PHPVirtualbox (apt-based distros) 

       -v  --virtualbox-only     Install and/or configure Virtualbox 
       -p  --phpvirtualbox-only  Install PHPVirtualbox 
       -a  --all                 Install both Virtualbox and PHPVirtualbox

       --install-extpack         Download and install the Oracle Extension Pack
       --accept-extpack-license  Accept Oracle License to install Extension Pack
       --phpvirtualbox-version=  PHPVirtualbox version to download and install
       --install-dir=            Directory to install PHPVirtualbox
       --vbox-user=              User to run Virtualbox (created if missing)
       -d=  --debug=             Debug output 0=quiet, 10=verbose
EOT
}

# Sensible defaults
DEBUG=0
#Disable visual prompting during upgrades
DEBIAN_FRONTEND=noninteractive
INSTALL_VBOX=${INSTALL_VBOX:=true}
INSTALL_PHPVBOX=${INSTALL_PHPVBOX:=true}
INSTALL_EXTPACK=${INSTALL_EXTPACK:=false}
PHPVBOX_INSTALL_DIR=${PHPVBOX_INSTALL_DIR:='/usr/share/phpvirtualbox'}
PHPVBOX_VERSION=${PHPVBOX_VERSION:='latest'}
APT=${APT:='apt-get -y'}
APT_KEY=${APT_KEY:='apt-key'}
ACCEPT_ORACLE_EXTPACK_LICENSE=${ACCEPT_ORACLE_EXTPACK_LICENSE:='n'}
VBOX_USER=${VBOX_USER:='vbox'}
VBOX_GROUP=${VBOX_GROUP:='vboxusers'}
VBOX_HOME=${VBOX_HOME:="/home/${VBOX_USER}"}
VBOX_VM_DIR=${VBOX_VM_DIR:="${VBOX_HOME}/VBox/VMs"}
VBOX_DRIVES_DIR=${VBOX_DRIVES_DIR:="${VBOX_HOME}/VBox/drives"}
VBOX_IMPORT_DIR=${VBOX_IMPORT_DIR:="${VBOX_HOME}/VBox/import"}
VBOX_AUTOSTART_DIR=${VBOX_AUTOSTART_DIR:="${VBOX_HOME}/VBoxAutostart"}
VBOX_ETC_DEFAULT=${VBOX_ETC_DEFAULT:='/etc/default/virtualbox'}
AUTOSTART_CONF=${AUTOSTART_CONF:='/etc/vbox/autostart.conf'}
WAIT_FOR_STOP=10s




for i in "$@"
do
case $i in
    -d=*|--debug=*)
    DEBUG="${i#*=}"
    ;;
    --install-dir=*)
    PHPVBOX_INSTALL_DIR="${i#*=}"
    ;;
    --virtualbox-user=*)
    VBOX_USER="${i#*=}"
    ;;
    --virtualbox-group=*)
    VBOX_GROUP="${i#*=}"
    ;;
    -v|--virtualbox-only)
    INSTALL_VBOX=true
    INSTALL_PHPVBOX=false
    ;;
    -p|--phpvirtualbox-only)
    INSTALL_VBOX=false
    INSTALL_PHPVBOX=true
    ;;
    --phpvirtualbox-version=*)
    PHPVBOX_VERSION="${i#*=}"
    ;;
    --install-extpack)
    INSTALL_EXTPACK=true
    ;;
    --accept-extpack-license)
    INSTALL_EXTPACK=true
    ACCEPT_ORACLE_EXTPACK_LICENSE='y'
    ;;
    -a|--all)
    INSTALL_VBOX=true
    INSTALL_PHPVBOX=true
    ;;
    -h|--help)
    help
    exit 0
    ;;
    *)
            # unknown option
    ;;
esac
done

## Check we're running as root so we don't need to rely on sudo.
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit
fi

########################
## INSTALL VIRTUALBOX ##
########################

if [ "${INSTALL_VBOX}" = true ]; then
    # Virtualbox Version needs to match PHPVirtualBox version
    # unless pulling from "develop" or "master"
    if [ "${PHPVBOX_VERSION}" == 'latest' ]; then
	RELEASE_TAG_URL=$(curl -Ls -o /dev/null -w %{url_effective} https://github.com/phpvirtualbox/phpvirtualbox/releases/latest)
	PHPVBOX_VERSION=$(echo $RELEASE_TAG_URL | awk -F/ '{print $8}')
    fi
    if [ "${PHPVBOX_VERSION}" == "development" ]; then

        VIRTUALBOX_VERSION=$(wget -O- https://raw.githubusercontent.com/phpvirtualbox/phpvirtualbox/develop/endpoints/lib/config.php | grep "define('PHPVBOX_VER'" | sed -n "s/^.*\([0-9]\+\.[0-9]\+\).*$/\1/p")
    else
        VIRTUALBOX_VERSION=`echo "$PHPVBOX_VERSION" | sed -n "s/^\([0-9]\+\.[0-9]\+\).*$/\1/p"`
    fi

    if [[ $VIRTUALBOX_VERSION =~ ^[0-9]+.[0-9]+$ ]]; then
	cat << EOT
###############################
## INSTALLING VIRTUALBOX $VIRTUALBOX_VERSION ##
###############################
EOT
    else
        echo "ERROR: UNKNOWN VIRTUALBOX VERSION: $VIRTUALBOX_VERSION"
        exit -1
    fi
	set -u
	set -e
	set -o pipefail

	echo ">>>> Importing Oracle Virtualbox Debian Repository key <<<<"
	wget -q https://www.virtualbox.org/download/oracle_vbox_2016.asc -O- | ${APT_KEY} add -

	echo ">>>> Adding Oracle Virtualbox Debian Repository <<<<"
	echo -e "## Virtualbox\ndeb [arch=amd64] http://download.virtualbox.org/virtualbox/debian $(lsb_release -cs) contrib" | tee /etc/apt/sources.list.d/virtualbox.list >/dev/null

	echo ">>>> Updating Oracle Virtualbox Debian Repository index <<<<"
	${APT} update
	echo ">>>> Installing build-essential pwgen and curl <<<<"
	${APT} install build-essential pwgen curl

	echo ">>>> Stop vbox services <<<<"
	systemctl --no-pager stop vboxdrv.service vboxautostart-service.service vboxweb-service.service || true

	echo ">>>> Waiting $WAIT_FOR_STOP until all services shut down <<<<"
	sleep "$WAIT_FOR_STOP"

	echo ">>>> Installing VirtualBox on non-x11 system <<<<"
	${APT} install --reinstall virtualbox-${VIRTUALBOX_VERSION} --no-install-recommends

	echo ">>>> Adding vbox user <<<<"
	adduser --disabled-password --gecos "VirtualBox" vbox || true
	echo ">>>> Setting password for vbox user <<<<"
	pw=$(pwgen -s 30 1)
	echo -e "${pw}\n${pw}\n" | passwd vbox >/dev/null
	echo "$pw" | tee /root/vbox.user.password >/dev/null
	chmod og-rwx /root/vbox.user.password
	echo ">>>> Adding ${VBOX_USER} user to ${VBOX_GROUP} group <<<<"
	adduser ${VBOX_USER} ${VBOX_GROUP}
	echo ">>>> Adding ${VBOX_USER} user to cdrom group <<<<"
	adduser ${VBOX_USER} cdrom

	echo ">>>> Creating '${VBOX_VM_DIR}' <<<<"
	su ${VBOX_USER} -c "mkdir -p \"${VBOX_VM_DIR}\""
	echo ">>>> Creating '${VBOX_DRIVES_DIR}' <<<<"
	su ${VBOX_USER} -c "mkdir -p \"${VBOX_DRIVES_DIR}\""
	echo ">>>> Creating '${VBOX_IMPORT_DIR}' <<<<"
	su ${VBOX_USER} -c "mkdir -p \"${VBOX_IMPORT_DIR}\""
	echo ">>>> Setting '${VBOX_VM_DIR}' as default machine folder for user vbox <<<<"
	su ${VBOX_USER} -c "vboxmanage setproperty machinefolder \"${VBOX_VM_DIR}\""

	echo ">>>> Removing any previous VBox Extension Pack <<<<"
	vboxmanage extpack uninstall "Oracle VM VirtualBox Extension Pack"

	if [ "${INSTALL_EXTPACK}" = true ]; then
		echo ">>>> Installing latest VBox Extension Pack <<<<"
		cd /tmp
		version=$(wget -qO- https://download.virtualbox.org/virtualbox/LATEST.TXT)
		wget -c "https://download.virtualbox.org/virtualbox/${version}/Oracle_VM_VirtualBox_Extension_Pack-${version}.vbox-extpack"
		echo ${ACCEPT_ORACLE_EXTPACK_LICENSE} | vboxmanage extpack install "Oracle_VM_VirtualBox_Extension_Pack-${version}.vbox-extpack"
		rm "Oracle_VM_VirtualBox_Extension_Pack-${version}.vbox-extpack"
		cd -
	fi

	echo ">>>> Creating '${AUTOSTART_CONF}' <<<<"
	echo -e "default_policy = deny\nvbox = {\n    allow = true\n}" | tee "$AUTOSTART_CONF" >/dev/null

	echo ">>>> Creating '${VBOX_AUTOSTART_DIR}' <<<<"
	su ${VBOX_USER} -c "mkdir -p \"${VBOX_AUTOSTART_DIR}\""
	su ${VBOX_USER} -c "chmod g+w \"${VBOX_AUTOSTART_DIR}\""
	# set sticky bit
	su ${VBOX_USER} -c "chmod +t \"${VBOX_AUTOSTART_DIR}\""
	su ${VBOX_USER} -c "vboxmanage setproperty autostartdbpath \"${VBOX_AUTOSTART_DIR}\""

	echo ">>>> Removing old autostart config from '${VBOX_ETC_DEFAULT}' <<<<"
	touch "$VBOX_ETC_DEFAULT"
	sed -i -e "/^\s*VBOXAUTOSTART_DB\s*=.*$/d" "$VBOX_ETC_DEFAULT"
	sed -i -e "/^\s*VBOXAUTOSTART_CONFIG\s*=.*$/d" "$VBOX_ETC_DEFAULT"

	echo ">>>> Appending new autostart config to '${VBOX_ETC_DEFAULT}' <<<<"
	echo -e "VBOXAUTOSTART_DB=${VBOX_AUTOSTART_DIR}\nVBOXAUTOSTART_CONFIG=/etc/vbox/autostart.conf" | tee -a "$VBOX_ETC_DEFAULT" >/dev/null

	echo ">>>> Restarting vbox services <<<<"
	systemctl --no-pager status vboxdrv.service
	systemctl --no-pager restart vboxdrv.service
	systemctl --no-pager status vboxdrv.service

	echo ">>>> Restarting vbox services <<<<"
	systemctl --no-pager status vboxautostart-service.service
	systemctl --no-pager restart vboxautostart-service.service
	systemctl --no-pager status vboxautostart-service.service

	echo ">>>> Creating '${VBOX_HOME}/bin' <<<<"
	su ${VBOX_USER} -c "mkdir -p \"${VBOX_HOME}/bin\""

	echo ">>>> Creating '${VBOX_HOME}/bin/vbox_save_rvms.bash' <<<<"
	set +e
	read -r -d '' vbox_save_rvms_bash_content <<'EOF'
#!/usr/bin/env bash

set -u
set -e
set -o pipefail

svm="$HOME/saved_vms"
echo -n "" >"$svm"

vboxmanage list runningvms | cut -d'"' -f3 | cut -d" " -f2 | while read uid; do
  echo "Saving state of $uid ..."
  vboxmanage controlvm "$uid" savestate
  echo "DONE"
  echo "$uid" >>"$svm"
done

chmod og-rwx "$svm"
EOF
	read_exit_val=$?
	set -e
	if [ $read_exit_val != 1 ]; then
	    exit $read_exit_val
	fi

	echo "$vbox_save_rvms_bash_content" | su ${VBOX_USER} -c "tee \"${VBOX_HOME}/bin/vbox_save_rvms.bash\" >/dev/null"
	echo ">>>> Making '${VBOX_HOME}/bin/vbox_save_rvms.bash' executable <<<<"
	su ${VBOX_USER} -c "chmod +x \"${VBOX_HOME}/bin/vbox_save_rvms.bash\""

	echo ">>>> Creating '${VBOX_HOME}/bin/vbox_start_svms.bash' <<<<"
	set +e
	read -r -d '' vbox_start_svms_bash_content <<'EOF'
#!/usr/bin/env bash

set -u
set -e
set -o pipefail

svm="$HOME/saved_vms"

if [ ! -f "$svm" ]; then
  exit 0
fi

vms=$(vboxmanage list vms)
svms=$(cat "$svm")

for uid in $svms; do
  echo "Trying to start VM $uid"
  if [ $( echo "$vms" | grep "$uid" | wc -l ) == 0 ]; then
    echo "Found no VM $uid, skipping"
    continue
  else
    echo "Found VM $uid"
  fi
  echo "Starting VM $uid in headless mode..."
  vboxmanage startvm "$uid" --type headless
  echo "DONE"

  echo "Removing VM $uid from autostart"
  tmp_file=$(mktemp)
  grep -v "$uid" "$svm" >"$tmp_file" || true
  mv -f "$tmp_file" "$svm"
  echo "DONE"
done
EOF
	read_exit_val=$?
	set -e
	if [ $read_exit_val != 1 ]; then
	    exit $read_exit_val
	fi

	echo "$vbox_start_svms_bash_content" | su ${VBOX_USER} -c "tee \"${VBOX_HOME}/bin/vbox_start_svms.bash\" >/dev/null"
	echo ">>>> Making '${VBOX_HOME}/bin/vbox_start_svms.bash' executable <<<<"
	su ${VBOX_USER} -c "chmod +x \"${VBOX_HOME}/bin/vbox_start_svms.bash\""

	echo ">>>> Creating '${VBOX_HOME}/bin/vbox_activate_auto.bash' <<<<"
	set +e
	read -r -d '' vbox_activate_auto_bash_content <<'EOF'
#!/usr/bin/env bash

set -u
set -e
set -o pipefail

rvms=$(vboxmanage list runningvms)
vms=$(vboxmanage list vms)

function activate_auto() {
  if [ $( echo "$rvms" | grep "$1" | wc -l ) != 0 ]; then
    echo "VM $1 is running, skipping"
    continue
  fi

  if [ $( echo "$vms" | grep "$1" | wc -l ) == 0 ]; then
    echo "Found no VM $1, skipping"
    continue
  fi

  echo "Enabling autostart for VM $1 ..."
  vboxmanage modifyvm "$1" --autostart-enabled on
  echo "Enabling autostop (savestate) for VM $1 ..."
  vboxmanage modifyvm "$1" --autostop-type savestate
}

if [[ $# -eq 0 ]]; then
  echo "$vms" | cut -d'"' -f3 | cut -d" " -f2 | while read uid; do
    activate_auto "$uid"
  done
else
  while [ $# -gt 0 ]; do
    activate_auto "$1"
    shift
  done
fi
EOF
	read_exit_val=$?
	set -e
	if [ $read_exit_val != 1 ]; then
	    exit $read_exit_val
	fi

	echo "$vbox_activate_auto_bash_content" | su ${VBOX_USER} -c "tee \"${VBOX_HOME}/bin/vbox_activate_auto.bash\" >/dev/null"
	echo ">>>> Making '${VBOX_HOME}/bin/vbox_activate_auto.bash' executable <<<<"
	su ${VBOX_USER} -c "chmod +x \"${VBOX_HOME}/bin/vbox_activate_auto.bash\""

	echo ">>>> Creating '${VBOX_HOME}/bin/vbox_deactivate_auto.bash' <<<<"
	set +e
	read -r -d '' vbox_deactivate_auto_bash_content <<'EOF'
#!/usr/bin/env bash

set -u
set -e
set -o pipefail

rvms=$(vboxmanage list runningvms)
vms=$(vboxmanage list vms)

function deactivate_auto() {
  if [ $( echo "$rvms" | grep "$1" | wc -l ) != 0 ]; then
    echo "VM $1 is running, skipping"
    continue
  fi

  if [ $( echo "$vms" | grep "$1" | wc -l ) == 0 ]; then
    echo "Found no VM $1, skipping"
    continue
  fi

  echo "Disabeling autostart for VM $1 ..."
  vboxmanage modifyvm "$1" --autostart-enabled off
}

if [[ $# -eq 0 ]]; then
  echo "$vms" | cut -d'"' -f3 | cut -d" " -f2 | while read uid; do
    deactivate_auto "$uid"
  done
else
  while [ $# -gt 0 ]; do
    deactivate_auto "$1"
    shift
  done
fi
EOF
	read_exit_val=$?
	set -e
	if [ $read_exit_val != 1 ]; then
	    exit $read_exit_val
	fi

	echo "$vbox_deactivate_auto_bash_content" | su ${VBOX_USER} -c "tee \"${VBOX_HOME}/bin/vbox_deactivate_auto.bash\" >/dev/null"
	echo ">>>> Making '${VBOX_HOME}/bin/vbox_deactivate_auto.bash' executable <<<<"
	su ${VBOX_USER} -c "chmod +x \"${VBOX_HOME}/bin/vbox_deactivate_auto.bash\""
fi

###########################
## INSTALL PHPVIRTUALBOX ##
###########################

if [ "${INSTALL_PHPVBOX}" = true ]; then
	cat << EOT
##############################
## INSTALLING PHPVIRTUALBOX ##
##############################
EOT
	set -u
	set -e
	set -o pipefail

	echo ">>>> Setting websrvauthlibrary <<<<"
	VBoxManage setproperty websrvauthlibrary null

	echo ">>>> Removing old vboxweb config from '${VBOX_ETC_DEFAULT}' <<<<"
	touch "${VBOX_ETC_DEFAULT}"
	sed -i -e "/^\s*VBOXWEB_USER\s*=.*$/d" "${VBOX_ETC_DEFAULT}"

	echo ">>>> Appending new vboxweb config to '${VBOX_ETC_DEFAULT}' <<<<"
	echo "VBOXWEB_USER=vbox" | tee -a ${VBOX_ETC_DEFAULT} >/dev/null

	hname=$(hostname)
	# remove leading whitespace characters
	hname="${hname#"${hname%%[![:space:]]*}"}"
	# remove trailing whitespace characters
	hname="${hname%"${hname##*[![:space:]]}"}"

	fqdn=$(hostname -A)
	# remove leading whitespace characters
	fqdn="${fqdn#"${fqdn%%[![:space:]]*}"}"
	# remove trailing whitespace characters
	fqdn="${fqdn%"${fqdn##*[![:space:]]}"}"

	echo ">>>> Removing previous ${PHPVBOX_INSTALL_DIR} <<<<"
	rm -rf "${PHPVBOX_INSTALL_DIR}"
	echo ">>>> Creating ${PHPVBOX_INSTALL_DIR} <<<<"
	mkdir "${PHPVBOX_INSTALL_DIR}"
	echo ">>>> Owning by ${VBOX_GROUP} <<<<"
	chgrp ${VBOX_GROUP} "${PHPVBOX_INSTALL_DIR}"

	echo ">>>> Cloning phpvirtualbox <<<<"
	if [ "${PHPVBOX_VERSION}" == "development" ]; then
	    git clone https://github.com/phpvirtualbox/phpvirtualbox.git "${PHPVBOX_INSTALL_DIR}"
	    chgrp -R ${VBOX_GROUP} "${PHPVBOX_INSTALL_DIR}"

	    cd "${PHPVBOX_INSTALL_DIR}"
	    echo ">>>> Using develop branch <<<<"
	    git checkout develop
	else
	    if [ "${PHPVBOX_VERSION}" == 'latest' ]; then
		RELEASE_TAG_URL=$(curl -Ls -o /dev/null -w %{url_effective} https://github.com/phpvirtualbox/phpvirtualbox/releases/latest)
		PHPVBOX_VERSION=$(echo $RELEASE_TAG_URL | awk -F/ '{print $8}')
	    fi
	    cd /tmp
	    wget -c https://github.com/phpvirtualbox/phpvirtualbox/archive/${PHPVBOX_VERSION}.tar.gz
	    mkdir -p "${PHPVBOX_INSTALL_DIR}"
	    chgrp ${VBOX_GROUP} "${PHPVBOX_INSTALL_DIR}"
	    cd "${PHPVBOX_INSTALL_DIR}"
	    tar -xzvf /tmp/${PHPVBOX_VERSION}.tar.gz --strip-components=1
	    cd -
	fi

	if [ "${PHPVBOX_INSTALL_DIR}" != "/usr/share/phpvirtualbox" ]; then
	    echo ">>>> Changing path to ${PHPVBOX_INSTALL_DIR} in phpvirtualbox.conf <<<<"
	    REPLACE=$(echo ${PHPVBOX_INSTALL_DIR} | sed -e 's/[\/&]/\\&/g')
	    sed -i -e "s/\/usr\/share\/phpvirtualbox/$REPLACE/g" phpvirtualbox.conf
	fi
	#echo ">>>> Allowing connections from anywhere in phpvirtualbox.conf <<<<"
	#sed -i -e "s/^\(\s*\)Require local$/\1#Require local\n\1# Allow connections from anywhere:\nRequire all granted/g" phpvirtualbox.conf
	#echo ">>>> Changing alias in phpvirtualbox.conf <<<<"
	#sed -i -e "s/Alias \/phpvirtualbox\S*/Alias \/phpvirtualbox.${hname}/g" phpvirtualbox.conf

	#dpkg -s apache2 php7.0 libapache2-mod-php7.0 >/dev/null 2>&1
	#if [ $? -ne 0 ]; then
	#    echo "Dependency is missing:"
	#    apt-cache policy apache2 php7.0 libapache2-mod-php7.0 | grep -B1 Installed
	#    exit 1
	#fi

	echo ">>>> Installing apache, php, etc <<<<"
	${APT} install apache2 php libapache2-mod-php php-soap php-xml

	echo ">>>> Installing apache alias <<<<"
	cp ${PHPVBOX_INSTALL_DIR}/phpvirtualbox.conf /etc/apache2/conf-available/
	echo ">>>> Enabling Apache alias <<<<"
	a2enconf phpvirtualbox
	echo ">>>> Reloading Apache config <<<<"
	systemctl --no-pager reload apache2

	echo ">>>> Creating phpVirtualbox config <<<<"
	if [ ! -f /root/vbox.user.password ]; then
	    echo "Dependency is missing: /root/vbox.user.password"
	    exit 1
	fi
	cp ${PHPVBOX_INSTALL_DIR}/config.php-example ${PHPVBOX_INSTALL_DIR}/config.php

	echo ">>>> Setting user and password in phpVirtualbox config <<<<"
	sed -i -e 's/^var $username = .*$/var $username = '"'vbox'"';/g' ${PHPVBOX_INSTALL_DIR}/config.php
	pw=$(cat /root/vbox.user.password)
	sed -i -e 's/^var $password = .*$/var $password = '"'${pw}'"';/g' ${PHPVBOX_INSTALL_DIR}/config.php

	echo ">>>> Setting site name in phpVirtualbox config <<<<"
	sed -i -e 's/^\(var $location = .*\)$/\1\nvar $name = '"'${fqdn}'"';/g' ${PHPVBOX_INSTALL_DIR}/config.php

	echo ">>>> Setting folder restrictions in phpVirtualbox config <<<<"
	sed -i -e 's/^\s*#*\s*\(var $browserRestrictFolders\)\s*=\s*.*$/\1 = array('"'\/home\/vbox\/VBox'"');/g' ${PHPVBOX_INSTALL_DIR}/config.php

	echo ">>>> Enabling advanced vm config in phpVirtualbox config <<<<"
	sed -i -e 's/^\s*#*\s*\(var $enableAdvancedConfig =.*\)$/\1/g' ${PHPVBOX_INSTALL_DIR}/config.php

	echo ">>>> Restarting vboxweb services <<<<"
	systemctl --no-pager status vboxweb-service.service
	systemctl --no-pager restart vboxweb-service.service
	systemctl --no-pager status vboxweb-service.service
	netstat -tulpena | grep 18083 || true

        cat << EOT
******************************************************
* PHPVirtualBox is now installed.  To access, go to: *
* http://localhost/phpvirtualbox                     *
* Username: admin                                    *
* Password: admin                                    *
* For security, by default, all connections are      *
* blocked other than localhost.                      *
* To enable external connections* edit               *
* /etc/apache2/conf-available/phpvirtualbox.conf     *
* We recommend SSL + IP Blocking + Auth at a minimum *
******************************************************
EOT
fi
