# Upgrade to VirtualBox 6.0.10 #

The problem with **SharedFolder** made me dive into the sourcecode,
single-stepping debug, until I hit the problematic code.

As it turns out, after a lot of tracing, comparing different forks,
the solution was pretty simple.

My server is running Linux (Slackware64 14.2), so my sollution is
for that environment. It should be easy to apply this to other flavors.

As I have `phpvirtualbox` running as an unprivileged user, all steps are
done as that user.

Let's say I have `phpvirtualbox` installed in `~/phpvirtualbox`.
```bash
cd ~
wget https://download.virtualbox.org/virtualbox/6.0.10/VirtualBoxSDK-6.0.10-132072.zip
unzip VirtualBoxSDK-6.0.10-132072.zip
mv sdk sdk-6.0.10
cp sdk-6.0.10/bindings/webservice/vboxweb.wsdl phpvirtualbox/endpoints/lib/vboxweb-6.0.wsdl
cp sdk-6.0.10/bindings/webservice/vboxwebService.wsdl phpvirtualbox/endpoints/lib/vboxwebService-6.0.wsdl
cp sdk-6.0.10/bindings/webservice/php/lib/vboxServiceWrappers.php phpvirtualbox/endpoints/lib/
```
So far, so good. Almost there.

In `phpvirtualbox/endpoints/lib/vboxconnector.php` Line 2232, change

```
$m->createSharedFolder($s['name'],$s['hostPath'],(bool)$s['writable'],(bool)$s['autoMount']);
```
to  
```
$m->createSharedFolder($s['name'],$s['hostPath'],(bool)$s['writable'],(bool)$s['autoMount'],$s['autoMountPoint']);
```
And in `phpvirtualbox/endpoints/lib/vboxwebService-6.0.wsdl` Line 8, change
```
<import location="vboxweb.wsdl" namespace="http://www.virtualbox.org/"/>
```
to
```
<import location="vboxweb-6.0.wsdl" namespace="http://www.virtualbox.org/"/>
```

Restart the `vboxwebsrv` server:
```sh
/etc/init.d/vboxweb-service stop
/etc/init.d/vboxweb-service start
```

### **And that's all.** ###
