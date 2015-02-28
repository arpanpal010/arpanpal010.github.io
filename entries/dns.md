#Caching DNS Queries Locally#
---
**The Domain Name System (DNS) is a hierarchical distributed naming
system for computers, services, or any resource connected to the
Internet or a private network.** - [`Wikipedia`][1]

Simply put, DNS servers resolve the text based URL of any website
to the IP address of the site that the network understands, and sends
the request to. For some of us, the DNS server of the ISP is well,
not good enough due to many reasons, say for poor performance, lower
TTL or for simply blocking the resolving of a number of websites,
that is where non-ISP DNS solutions come into play, there are
already a number of solutions available, [Google's public DNS][2] being the
first, or [OpenDNS][3]/[OpenNIC][4], or [Yandex's DNS service][5]. Otherwise, with
not-too-much hassle, one can setup his/her own DNS server inside their
local network, for that sweet sweet LAN performance and <2ms query
resolves. Also, you can name your devices whatever you like, and
it will now resolve (if it didn't before, because wifi-routers usually
have this capability built in).

DNS servers are queried everytime we visit a site, so by caching such
requests locally (and storing them persistently) help reduce network
footprint, as well as a little boost in speed. Also, this reduces
outgoing DNS queries in the network, so if there are any snoopers around,
it becomes a little hard for them to deduce the sites you frequent
from the IP addresses, that's just an added advantage.

##Persistent DNS#
---

There are a number of packages that can be used to setup local DNS
resolvers, e.g. [Bind9][6], [DNSMasq][7], etc, I used [pDNSd][8] because it has
the capability of persistence built-in, i.e. the URL-to-IP
relation maps persist over reboots. The documentation of pDNSd can
be found [here][9].

###Installing pDNSd

Because I'm running Raspbian in my RaspberryPi, the package manager is `apt`. To
install pDNSd,

	sudo apt-get install pdnsd resolvconf;

And then just start the service.

	sudo service pdnsd start;

(if given a warning abut pdnsd daemon being disabled, just set the following in `/etc/default/pdnsd`)

	START_DAEMON=yes

*[tip: Remember to open port 53/udp in firewall config.]*

And that's it, now set the DNS of your devices to the local IP of your remote machine.
To test DNS query performance, use a tool like [*drill*][10].

##Sample Configuration
---

This is a sample configuration file located at `/etc/pdnsd.conf`, use this as
a starting point if you would like to further customise the DNS server.

	#global settings
	global {
        	perm_cache=16384; #16MB
        	cache_dir="/var/cache/pdnsd";
        	run_as="pdnsd";
        	server_ip = eth0;  // Use eth0 here if you want to allow other
                                // machines on your network to query pdnsd.
        	status_ctl = on;
        	paranoid=on;
	//      query_method=tcp_udp;   // pdnsd must be compiled with tcp
                                	// query support for this to work.
        	min_ttl=15m;       // Retain cached entries at least 15 minutes.
        	max_ttl=1w;        // One week.
        	timeout=10;        // Global timeout option (10 seconds).

	        // Don't enable if you don't recurse yourself, can lead to problems
	        // delegation_only="com","net";
        	neg_rrs_pol=on; //reduces outgoing overhead by caching queries that
                            //return negetice response, to be used with proxy
        	par_queries=1;  //number of queries per dns server, if more than one
        	debug=off;      //turn on to monitor behaviour
	}

	/* with status_ctl=on and resolvconf installed, this will work out from the box
   	this is the recommended setup for mobile machines */
	/* server {
    	label="resolvconf"; #not used
	}
	*/

	#server settings
	server {
	        label = "root-servers";
	        root_server=on;
	        ip =	46.151.208.154
	        ,	128.199.248.105
	        ,	213.183.57.55
		,	178.17.170.67
	//above are from http://www.opennicproject.org/nearest-servers/
	//google dns
	        ,	8.8.8.8
	        ,       4.4.4.4
	//add your own here
	        ;
	        timeout = 5;
	        uptest = query;
	        interval = 30m;      // Test every half hour.
	        ping_timeout = 300;  // 30 seconds.
	//      proxy_only=on; #set this on only for multiple dns servers
	        purge_cache = off;
	        exclude = .localdomain;
	        policy = included;
	        preset = off;
	}

	#name blocking - create a new neg section
	/* neg {
	        name=doubleclick.net;
	        types=domain;   // This will also block xxx.doubleclick.net, etc.
	}
	*/

[1]: http://en.wikipedia.org/wiki/Domain_Name_System
[2]: https://developers.google.com/speed/public-dns/
[3]: http://www.opendns.com/
[4]: http://www.opennicproject.org/
[5]: http://dns.yandex.com/
[6]: http://www.bind9.net/
[7]: http://www.thekelleys.org.uk/dnsmasq/doc.html
[8]: http://members.home.nl/p.a.rombouts/pdnsd/
[9]: http://members.home.nl/p.a.rombouts/pdnsd/doc.html
[10]: http://linux.die.net/man/1/drill
