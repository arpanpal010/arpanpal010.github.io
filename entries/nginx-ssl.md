#Using SSL with NGINX#
---

A SSL Certificate is a way to enhance the connection security of your web services,
and encrypt the tunnel the data travels through to the server from the client, and
vice-versa. Also, the certificate acts as an identity, and can be verified in case of
spoof suspicion. Usually Certificate Authorities(CA) issue SSL certificates to verify the
server's details, however, for personal/free use, hosts can generate self-signed
certificates as well, without any 3rd-party collaboration.

##Setting Up#
---

You will need,

* A Server running [NGINX][1]
* [OpenSSL][2] to generate and self-sign the certificate

To install nginx and openssl (if you haven't already)

    $ sudo apt-get install nginx openssl;

##Procedure
---

####Creating the private key #
Create certificate with openssl using default location /etc/nginx with keysize=2048 bit RSA encryption

	$ sudo openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -outform PEM -out /etc/nginx/privatekey.pem;

Set permission so that only the root user can access the key

    $ chmod 600 /etc/nginx/privatekey.pem

####Issue Signing Request

Issue a signing request for the key, this step usually involves the Certificate
Authorities, however, we will be self-signing it for our purpose

You will need to enter some identifying information at this step, like Country/State
code, Organization name, etc, most important among them is the common name and email
address, for the common name, either enter the server IP address, or your fully
qualified domain name, and enter a valid email address for the email field.

	$ sudo openssl req -new -key /etc/nginx/privatekey.pem -out /etc/nginx/signingrequest.csr;
	#fields -  fill as needed. common name=FQDN or IP or . (blank)

####Remove Passphrase

Remove the passphrase from the privatekey - otherwise you will need to enter it 
everytime nginx reloads, we will be using a copy of the privatekey for security,
although it is always better to have passphrases enabled, it can become a hassle
sometimes..

	$ sudo cp /etc/nginx/{privatekey.pem,withpassphrase.pem} #actualserver.pem is the key with passphrase
	$ sudo openssl rsa -in /etc/nginx/withpassphrase.pem -out /etc/nginx/privatekey.pem

####Sign the certificate

Sign the certificate with the privatekey.pem **without** the passphrase - change validity days if needed

	$ sudo openssl x509 -req -days 365 -in /etc/nginx/signingrequest.csr -signkey /etc/nginx/privatekey.pem -out /etc/nginx/certificate.crt;

That's it, now the generated `certificate.crt` file can be used as a certificate!

##Add the key and the certificate to nginx#
---
Copy the keys to somewhere nginx has read access to e.g `/etc/nginx/`
Example config `/etc/nginx/nginx.conf` (from [nginx docs][3])

	server {
		listen              443 ssl;
		keepalive_timeout   70;

		ssl_protocols       SSLv3 TLSv1 TLSv1.1 TLSv1.2;
		ssl_ciphers         AES128-SHA:AES256-SHA:RC4-SHA:DES-CBC3-SHA:RC4-MD5;
		ssl_certificate     /etc/nginx/certificate.crt;
		ssl_certificate_key /etc/nginx/privatekey.pem;
		ssl_session_cache   shared:SSL:10m;
		ssl_session_timeout 10m;

		#other stuff below
	}

Now try accessing your server via https. Although the browser will complain that the
certificate is not signed by any of the Root or Higher-Class authorities, but in 
that case just add a security exception and add the certificate to the trusted list.

*[tip: Dont forget to open port 443 of firewall]*

[1]: http://nginx.org/
[2]: https://www.openssl.org/
[3]: http://nginx.org/docs
