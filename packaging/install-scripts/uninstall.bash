#!/usr/bin/env bash

help() {
cat <<'EOT'
     Uninstall Script for Virtualbox and PHPVirtualbox (apt-based distros) 

       -v  --virtualbox-only     Uninstall Virtualbox && apt source
       -p  --phpvirtualbox-only  Uninstall PHPVirtualbox 
       -a  --all                 Uninstall both Virtualbox and PHPVirtualbox

       --purge                   Remove config as well
       --install-dir=            Directory PHPVirtualbox is installed
       --remove-vbox-user=       Virtualbox user to remove
       --remove-vbox-group=      Virtualbox group to remove
       -d=  --debug=             Debug output 0=quiet, 10=verbose
EOT
}

# Sensible defaults
DEBUG=0
UNINSTALL_VBOX=${INSTALL_VBOX:=true}
UNINSTALL_PHPVBOX=${INSTALL_PHPVBOX:=true}
UNINSTALL_EXTPACK=${INSTALL_EXTPACK:=true}
PURGE=${PURGE:=false}
PHPVBOX_INSTALL_DIR=${PHPVBOX_INSTALL_DIR:='/usr/share/phpvirtualbox'}
APT=${APT:='apt-get -y'}
APT_KEY=${APT_KEY:='apt-key'}
VBOX_VER=${VBOX_VER:='6.1'}
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
    UNINSTALL_VBOX=true
    UNINSTALL_PHPVBOX=false
    ;;
    -p|--phpvirtualbox-only)
    UNINSTALL_VBOX=false
    UNINSTALL_PHPVBOX=true
    ;;
    --purge)
    PURGE=true
    ;;
    -a|--all)
    UNINSTALL_VBOX=true
    UNINSTALL_PHPVBOX=true
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

#############################
## UNINSTALL PHPVIRTUALBOX ##
#############################

if [ "${UNINSTALL_PHPVBOX}" = true ]; then
	set -u
	set -e
	set -o pipefail

	echo ">>>> Removing ${PHPVBOX_INSTALL_DIR} <<<<"
	rm -rf "${PHPVBOX_INSTALL_DIR}"

	echo ">>>> Disabling Apache alias <<<<"
	a2disconf phpvirtualbox || true
	echo ">>>> Removing Apache alias <<<<"
	rm /etc/apache2/conf-available/phpvirtualbox.conf || true

	echo ">>>> Reloading Apache config <<<<"
	systemctl --no-pager reload apache2

        echo <<'EOT'
******************************************************
* PHPVirtualBox is now uninstalled.                  *
******************************************************
EOT
fi

##########################
## UNINSTALL VIRTUALBOX ##
##########################

if [ "${UNINSTALL_VBOX}" = true ]; then
	set -u
	set -e
	set -o pipefail

	echo ">>>> Removing any previous VBox Extension Pack <<<<"
	vboxmanage extpack uninstall "Oracle VM VirtualBox Extension Pack" || true

	echo ">>>> Stop vbox services <<<<"
	systemctl --no-pager stop vboxdrv.service vboxautostart-service.service vboxweb-service.service || true

	echo ">>>> Waiting $WAIT_FOR_STOP until all services shut down <<<<"
	sleep "$WAIT_FOR_STOP"

	echo ">>>> Uninnstalling VirtualBox on non-x11 system <<<<"
	${APT} remove virtualbox-${VBOX_VER}

	echo ">>>> Removing Oracle Virtualbox Debian Repository key <<<<"
	${APT_KEY} del B9F8 D658 297A F3EF C18D  5CDF A2F6 83C5 2980 AECF
	${APT_KEY} del 7B0F AB3A 13B9 0743 5925  D9C9 5442 2A4B 98AB 5139

	echo ">>>> Removing Oracle Virtualbox Debian Repository <<<<"
	rm /etc/apt/sources.list.d/virtualbox.list || true

	echo ">>>> Updating Oracle Virtualbox Debian Repository index <<<<"
	${APT} update


	echo ">>>> Removing vbox user <<<<"
	deluser vbox || true
	echo ">>>> Removing vbox group <<<<"
	delgroup vbox || true

	echo ">>>> Deleting '${VBOX_IMPORT_DIR}' (if empty) <<<<"
	rmdir ${VBOX_IMPORT_DIR}
	echo ">>>> Deleting '${VBOX_DRIVES_DIR}' (if empty) <<<<"
	rmdir ${VBOX_DRIVES_DIR}
	echo ">>>> Deleting '${VBOX_VM_DIR}' (if empty) <<<<"
	rmdir ${VBOX_VM_DIR}


	echo ">>>> Deleting '${AUTOSTART_CONF}' <<<<"
	rm ${AUTOSTART_CONF} || true

	echo ">>>> Deleting '${VBOX_AUTOSTART_DIR}' <<<<"
	rmdir ${VBOX_AUTOSTART_DIR} || true

	echo ">>>> Deleting '${VBOX_HOME}/bin/vbox_save_rvms.bash' <<<<"
	rm ${VBOX_HOME}/bin/vbox_save_rvms.bash || true

	echo ">>>> Deleting '${VBOX_HOME}/bin/vbox_start_svms.bash' <<<<"
	rm ${VBOX_HOME}/bin/vbox_start_svms.bash || true

	echo ">>>> Deleting '${VBOX_HOME}/bin/vbox_activate_auto.bash' <<<<"
	rm ${VBOX_HOME}/bin/vbox_activate_auto.bash || true

	echo ">>>> Deleting '${VBOX_HOME}/bin/vbox_deactivate_auto.bash' <<<<"
	rm ${VBOX_HOME}/bin/vbox_deactivate_auto.bash || true

	echo ">>>> Removing '${VBOX_HOME}/bin' <<<<"
	rmdir ${VBOX_HOME}/bin || true

fi
