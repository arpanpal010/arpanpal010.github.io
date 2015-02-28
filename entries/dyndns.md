#Setting up a Free DynDNS#
---

DynDNS, or Dynamic DNS, is a way to setup static URLs that point to dynamic IP
addresses. Like me, many of you subscribe to an ISP that provides you with a static
IP for network configuration, but provides you with a dynamic IP for browsing, although it
is very good for the privacy and anonimity, it hinders the accessibility, specially
if you have multiple personal services running at home, like a subsonic music
streamer radio, SSH, FTPs, EtherPad/EtherCalc or private file storage solutions like Seafile etc. This is
where [DynDNS][1] comes in, it provides with a URL that always point to the devices in my
home network, even though the IP address changes. The logic beneath this is to check for an
IP change after a certain interval, and notify the change to the DNS provider.  

The first thing to do if you want to setup a Dynamic DNS is to choose a website that
offers the service. You will be using this website's Name Servers to serve your IP
when your URL is requested, and this is where you will notify of your IP change.
Ofcourse, if you are looking for or have bought a domain, then it's possible you 
have this service as part of your hosting package, these hosts definitely do...

* [Digital Ocean][2]
* [Google Cloud DNS][3]
* [Amazon Route53][4]
* [NameCheap][5]
* [Linode][6]


but if you are looking for a free or temporary solution, I'll list some here, each of
them atleast have some distinct feature that they offer, so it is worth checking them
out, and choose the one that fits the most of your needs.

* [DuckDNS][7]
* [FreeDNS (afraid.org)][8]
* [Hopper.pw][9]
* [DNS Dynamic][10]
* [yDNS][11]
* [EntryDNS][12]
* [dtDNS][13]

After you have registered, and chosen your hostname/domain name, there are multiple 
clients-side services available that set up a dynamic DNS, and each of them
support a plethora of protocols to do so. First check if your router has this
capability built-in, and if they do, skip the rest and go to your browsers
support page to look for a solution, if not, another way is to manage it from your
host devices with some software. A popular one among them is [ddClient][14],
written in Perl, it is one of the original utilities intended for linux to setup
DDNS.

###Using ddClient

ddClient can be installed with the default package manager, or you can get it from
their site and build it yourself, here I'm going with the former.

    sudo apt-get install ddclient; #has multiple socket and io perl dependencies

If this is the first time installing ddClient, it will autorun the initial
configuration script and ask for your DynDNS information such as hostname,
username/password, refresh time etc. Also, it will ask for the NIC you will be using
for the connection (default: *eth0* for wired, *wlan0* for wireless). 

You can choose to do the configuration later or manually as well, in the first case
you will need to run
Install
    dpkg-reconfigure ddclient;

or, if you already have a configuration file, you can just drop it in /etc, as 
`/etc/ddclient.conf`

Now, for ddclient to start, just enable the service module.

    sudo service ddclient start;

Usually this is all that you will be needing to setup ddClient to update the IP
address to the DynDNS provider.

###Sample Configuration taken from [dnsdynamic][10]#

If you are here for a configuration file, feel free to use the one provided below as
a starting point, and fill up your own information in it.

    daemon=600                          # check every 10mins for ip address change
    syslog=yes                          # enabled logging
    mail=root                           # mail all msgs to root
    mail-failure=root                   # mail failed update msgs to root
    pid=/var/run/ddclient.pid           # record PID in file.
    ssl=yes                             # use ssl-support.  Works with ssl-library
    use=web, web=myip.dnsdynamic.com    # get ip from server.
    server=www.dnsdynamic.org           # default server
    login=user@gmail.com                # default login
    password=password                   # default password
    server=www.dnsdynamic.org,              \
    protocol=dyndns2                        \
    your-dyndns-uri.here #e.g awesome.dnsdynamic.com

Some other methods for updating your IP are...
* using a [crontab][15] entry
* using a bash/python script (NameCheap has a quite common and simple one)
* using another client [inadyn][16] (has clients for windows/OSX)
* Using the site's api to send a webservice call to update the IP

*[tip: you can redirect your domain to a dynamic IP using CNAME aliases]*


[1]: http://en.wikipedia.org/wiki/Dynamic_DNS
[2]: https://www.digitalocean.com/
[3]: https://developers.google.com/cloud-dns/
[4]: http://aws.amazon.com/route53/
[5]: https://www.namecheap.com/
[6]: https://www.linode.com/
[7]: http://duckdns.org/
[8]: https://freedns.afraid.org/
[9]: https://www.hopper.pw/
[10]: http://www.dnsdynamic.org
[11]: https://ydns.eu/
[12]: https://entrydns.net/
[13]: https://www.dtdns.com/
[14]: http://sourceforge.net/projects/ddclient/
[15]: http://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html
[16]: http://www.inatech.eu/inadyn/
