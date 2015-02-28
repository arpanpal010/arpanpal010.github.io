#Personal GIT server#
---
Version control is something I have learnt to give importance the hard way. After
losing some of my college projects due to data corruption, and a moderately important
one that I _"bugged up"_ by modifying it to the point of no return, I gave some
serious thought to versioning. Keeping zipped copies of projects and ending up with a
bunch of folders with different codes in each was way too much hassle. That is when
I thought of setting up repositories for codes, and because I cannot push everything
to [Github][1], I was looking for more of a local solution.

For those who are in a similar situation, this is the procedure to setup a locally
version controlled repository(s) to host codes in a remote machine, prefereably in the
same network. Using Git, codes can be pulled, updated or cloned over **ssh** (*every 
contributor needs to use the same username, or their own public key added to the 
server*) or via **http** (*clone only, also insecure*). Also, I keep my gits in my 
Raspberry Pi, and brag about it any chance I get.

##Things to keep in mind#
---

####Authentication#
If coding with a bunch of people in the same project, keep in mind that they would
need to authenticate themselves to access and modify your code. One way to do that
would be to create a single user *'git'* and add the contributors' public keys to
`~/.ssh/authorized_keys` of the *git* user. This username can be secured by limiting
access and setting up permissione. For small/personal use, just add the public keys
to the default *'pi'* user. But it is always better to use a non-default username,
specially if using it over the internet.

####Authorization#
* If the repo will be used over internet, dont forget to disable password based
logins and root logins, 

* Modify firewall setting and install fail2ban or sshguard for enhanced security.

* Disable shell access to git users by specifying user shell for the git user in
`/etc/passwd` as `/usr/bin/git-shell` (or write `which git-shell` in a terminal to
get the path to git-shell)

*[tip: Generate keys with ssh-keygen and copy it over with ssh-copy-id]*

##Procedure#
---

You will need, [SSH][2] access to the remote machine, [Git][3] installed in all
devices, and some *free time*.

###Create a bare repository#

A bare repository is just an empty repository folder containing only the git
configuration and hooks, once you create a bare repo, you can use it as a
starting point of your project. All repository folders end in `.git`.
If you want group write access for the repository, add the
`--shared` flag. This is how to create an empty repository.

    $ git init --bare --shared /path/to/git/container/directory/$reponame.git

###Add the remote#

Now if you already have the project lying around somewhere in
a directory in your file-system, you can either just navigate to
that folder and add the git remote, assuming your remote name will be *raspberrypi*
and your username at the remote machine will be *git*, and the repository name being
*$reponame*, the command will be like below

    $ git remote add raspberrypi ssh://git@raspberrypi:/path/to/git/container/directory/$reponame.git

###Clone the repository#

Or, if you would be starting from scratch and will go on adding
files as you need'em, then just clone the repository somewhere
inside your file-system.

    $ git clone ssh://git@raspberrypi:/path/to/git/container/directory/$reponame.git

And start working in it immediately. From here, use the repository as you would with
github, although, the users will have to be able to authenticate themselves with the
password or key based authentication to push to this repository. 

*[tip: if the location
you are pushing to becoms too long for you, you can add an **insteadOf** in your
gitconfig to give it a shortname, say **remotepi**.]*

###Display the code#

The bare repository has the actual codes obfuscated/encrypted. To host a copy of the
code elsewhere or view/download single files from server use the **post-receive** hook
to checkout the repo at some directory everytime you push to the repo, and make that 
directory available to the server.

Create a file `/location/to/git-bare-repo/hooks/post-receive` with the content

    #!/bin/sh  
    GIT_WORK_TREE=/path/where/repo/files/should/be/extracted/ git checkout -f

Make it executable

    $ chmod a+x /git-bare-repo/hooks/post-receive

[tip: If displaying the codes online, make sure the user the server runs under has 
read/write access to the directory.]

    #in git container folder
    $ chgrp -R $server-username /container/git-bare-repo/

###Allow public access#
To allow people to clone the repo from the web, make the directory containing the
code publicy accessible and enable the **post-update** hook 

Create a file `/location/to/git-bare-repo/hooks/post-update` with the content

    #!/bin/sh  
    exec git-update-server-info

Make it executable

    $ chmod a+x /git-bare-repo/hooks/post-update

Then you can clone the repo just by typing

    $ git clone http://url.to.server:port/path/to/$reponame.git

Checkout the [Git docs][4] for more information.

[1]: https://github.com
[2]: http://www.openssh.com/ 
[3]: http://git-scm.com/downloads 
[4]: http://git-scm.com/doc
