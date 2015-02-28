//-- ######################################################## -->
//-- Configurations ######################################### -->
//-- ######################################################## -->

    var blogName = "geminiBlog"; //uncomment the javascript in index.html : header section and remove other stylings

//-- ######################################################## -->

    //info
    var author = "Arpan Pal";
    var contactLinks=[ //hide the url/id to hide displaying the item
        {name: "homepage",
            //url: "arpanpal010.github.io",
            //id: "#",
        },
        {name: "mailme",
            url: "mailto:arpan.pal010@gmail.com",
        },
        {name: "github",
            url: "https://www.github.com/",
            id: "arpanpal010",
        },
        {name: "linkedin",
            url: "https://www.linkedin.com/in/arpanpal010",
        },
        {name: "twitter",
            id: "arpanpal010",
            url: "https://www.twitter.com/"
        },
    ]

//-- ######################################################## -->

    //global definitions
    var repoBase = "./entries/"; //remember the ending slash
    var use_async = false; // enable when being served
    var timeout = 4; //seconds after which an async request 404s

    //divs used in compositing the page
    var containerDiv = "entries-wrapper";
    var sidebarDiv = "sidebar-wrapper";

    //deprecated
    //var posTop = 0; //px value of top of entry, the page is scrolled to this amount everytime an entry is loaded

    //default post to display
    var freshNum = 7; //most recent entries to be displayed in default snippetView
    var snippetLength = 170; //characters to display in snippet mode

    //markdown parsing options - passed to marked() in mdConvert()
    var md_options = {
        'gfm' : true,
        'tables' : true,
        'breaks' :false,
        'pedantic' :false,
        'sanitize' : true,
        'smartlists' :true ,
        'smartypants' :false,
    }

//-- ######################################################## -->

//variables
    //anything enclosed between these is considered a variable
    //and will be replaced by handleVars()
    //values will be looked up from the dictionary below
    var vprefix = "{|";
    var vpostfix = "|}";

    var variables_in_entries = [
        //{'name': "variable", 'value': "varValue"},
        {name : "blogHome", value : "/blog.html"}, //used in error50x message
        {name : "today", value : (new Date).toLocaleDateString()},
        {name : "marked.js", value: "[`marked.js`](https://github.com/chjj/marked)"},
    ];

//-- ######################################################## -->

    //register new entries here
//entries begin with ./, they are replaced by the repoBase url
//this will come handy if CORS is enabled, however rarely
    register("./firewall.md", "Firewall - IPTables", "January 21, 2015", "web,firewall");
    register("./sysctl.md", "Kernel Tweaks", "January 26, 2015", "kernel, rpi");
    register("./dns.md", "Local DNS Server", "January 31, 2015", "web,dns");
    register("./nginx-ssl.md", "SSL with NGINX", "February 5, 2015", "web,server");
    register("./git-server.md", "Personal GITs", "February 11, 2015", "git, rpi");
    register("./dyndns.md", "Dynamic DNS", "February 17, 2015", "web");

//-- ######################################################## -->

//Errors and other messages
    //404 - entry not found
    var error404 = ["#Sorry!!!#",
        "###The entry you requested cannot be found.#",
        "####Please try again later.#",
        "Possible reasons of unavailability:  ",
            "* Entry does not exist (yet).",
            "* Entry not found at the URL [#{|title|}][1].",
            "* Are you connected to the internet?",
        "",
        "####Would you like to return [home][2]?#",
        "[1]:{|url|}",
        "[2]:{|blogHome|}",
    ].join("\n");

    //50x
    var error50x = ["#Encountered a server hiccup.#",
        "####Would you like to return [home][1]?#",
        //"Error code: **{|errorCode|}**",
        "[1]:{|blogHome|}",
    ].join("\n");

    //no more entries found.
    var noMoreEntries = [
        "Sorry, No more entries found.",
    ].join("\n");

//-- ######################################################## -->

    //enable markdown sources to be downloaded
    var markDownloads = true;

//-- ######################################################## -->

//DISQUS Comments
    var enableDisqus= true;
    var disqus_shortname = 'gitioblog'; // Required - Replace example with your forum shortname"
    var disqus_url       = document.location;
