#Optimizing the kernel in my Raspberry Pi#
---

The Raspberry Pi (Model B) is a 700MHz/512MB device that runs its own full fledged
debian distribution called the Raspbian. To get the most out of
its tiny core, I decided to look up in the internet how to tweak
its kernel parameters to increase security as well as tune the network throughput.

In most debian based systems, these parameters are found either
directly inside the file `/etc/sysctl.conf` or they're divided
into a group of files in `/etc/sysctl.d/`, mine was the former.

Because it is one of the system configuration files, sudo will be
needed to edit the file, so begin with 

	$ sudo nano /etc/sysctl.conf

and fill it with the parameters listed below,

##Security Fixes
---

Enable Spoof protection (reverse-path filter)

	net.ipv4.conf.default.rp_filter=1
	net.ipv4.conf.all.rp_filter=1

Enable TCP/IP SYN cookies

	net.ipv4.tcp_syncookies=1

Ignore ICMP broadcasts - protects from smurf attacks

	net.ipv4.icmp_echo_ignore_broadcasts = 1

Ignore bogus ICMP errors

	net.ipv4.icmp_ignore_bogus_error_responses = 1

Do not accept IP source route packets

	net.ipv4.conf.all.accept_source_route = 0
	net.ipv4.conf.default.accept_source_route = 0

Log Martian Packets

	net.ipv4.conf.all.log_martians = 1
	net.ipv4.conf.default.log_martians = 1

Do not allow anyone to alter the routing tables
also, do not accept ICMP redirects (prevent MITM attacks)

	net.ipv4.conf.all.accept_redirects = 0
	net.ipv4.conf.default.accept_redirects = 0
	net.ipv4.conf.eth0.accept_redirects = 0
	net.ipv4.conf.all.secure_redirects = 0
	net.ipv4.conf.default.secure_redirects = 0

Router function (important!!) if you will be forwarding packets
to other devices in your network

	net.ipv4.ip_forward = 1

Do not send ICMP redirects (really important for our single NIC gateway)

	net.ipv4.conf.all.send_redirects = 0
	net.ipv4.conf.default.send_redirects = 0
	net.ipv4.conf.eth0.send_redirects = 0

Enable execShield (although I do not think this ARM processor has
the registes it requires)

	kernel.exec-shield = 1
	kernel.randomize_va_space = 1

Avoid running Out Of Memory

	vm.min_free_kbytes=8192

##Network Tuning
---

Increase file descriptor limit

	fs.file-max=65536

Allow more pids to reduce rollover, (may break some programs)

	kernel.pid_max=65536

Tune IPv6

	net.ipv6.conf.default.router_solicitations = 0
	net.ipv6.conf.default.accept_ra_rtr_pref = 0
	net.ipv6.conf.default.accept_ra_pinfo = 0
	net.ipv6.conf.default.accept_ra_defrtr = 0
	net.ipv6.conf.default.autoconf = 0
	net.ipv6.conf.default.dad_transmits = 0
	net.ipv6.conf.default.max_addresses = 1

Increase port limits

	net.ipv4.ip_local_port_range = 2000 65000

Increase max buffer size setable using setsockopt()

	net.ipv4.tcp_rmem = 4096 87380 8388608
	net.ipv4.tcp_wmem = 4096 87380 8388608

Increase TCP buffer default limits and window sizes

	net.core.rmem_max = 8388608
	net.core.wmem_max = 8388608
	net.core.netdev_max_backlog = 5000
	net.ipv4.tcp_window_scaling = 1


##Apply Changes
---
After finishing, load the changes into the kernel with the command

	$ sudo sysctl -p
