! function(w) {
	"use strict";
	// !-- -------------------------------------------------------- -->
	// !-- Utilities												-->
	// !-- -------------------------------------------------------- -->
	// implementing $ with queryselector(+all)
	var $ = function(selector, rootNode) {
		return (rootNode || document).querySelector(selector);
	};
	var $$ = function(selector, rootNode) {
		return Array.prototype.slice.call((rootNode || document).querySelectorAll(selector));
	};
	// // binding models to views
	// var bindModelToView = function(obj, oprop, el, eprop) {
	//	eprop = eprop || 'value'; // for inputs
	//	Object.defineProperty(obj, prop, {
	//		get: function() {
	//			return el[eprop];
	//		},
	//		set: function(v) {
	//			el[eprop] = v;
	//		},
	//		configurable: true,
	//	})
	// };
	var utils = {
		escapeRegExp: function(string) { // escape regex
			return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
		},
		capFirst: function(text) { // capitalize first char, lower the rest
			return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
		},
		clearElements: function(container) {
			while (container.firstChild) {
				container.removeChild(container.firstChild);
			}
			return container;
		},
		hideElement: function(container) {
			container.style.opacity = "0";
		},
		showElement: function(container) {
			container.style.opacity = "1";
		},
		show: function(container) {
			container.style.display = "initial";
		},
		hide: function(container) {
			container.style.display = "none";
		},
		// register custom events
		registerEvent: function(event, bubbles, cancelable) {
			return (CustomEvent) ? new CustomEvent(event, {
				bubbles: bubbles,
				cancelable: cancelable
			}) : (document.createEvent('Event').initEvent(event, bubbles, cancelable));
		},
		// custom listeners
		registerListener: function(target, type, callback) { (target.addEventListener || target.attachEvent)(target.addEventListener ? type: 'on' + type, callback);
		},
		removeListener: function(target, type, callback) { (target.removeEventListener || target.detachEvent)(target.removeEventListener ? type: 'on' + type, callback);
		},
		// template string to dom element , remember to return el.childNodes[0] // or use element accordingly;
		str2WrappedDOMElement: function(html) {
			var el = document.createElement('div');
			el.innerHTML = html;
			// return el.childNodes[0];
			return el;
		},
		// minimal ajax // use this.<attr> in callbacks to access the xhr object directly
		ajax: function(o) {
			o.useAsync = o.useAsync || true;
			if (!o.method || ! o.url || ! o.success) return false;
			var xhr = w.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
			xhr.timeout = geminiBlog.timeout || 4000;
			// throws syntax error otherwise
			if (o.mimeType) {
				xhr.overrideMimeType("text/plain; charset=x-user-defined");
			}
			xhr.ontimeout = function() {
				console.error("Request timed out: " + o.url);
			};
			xhr.onerror = o.error ? o.error: function() {
				console.log(xhr);
			};
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && xhr.status == 200) {
					o.success ? o.success(xhr) : (function() {
						console.log(xhr);
					})();
					// } else {
					//	   console.log(xhr);
				}
			}
			xhr.open(o.method, o.url, o.useAsync);
			xhr.send(null);
		},
	};
	// !-- -------------------------------------------------------- -->
	// !-- Variables												-->
	// !-- -------------------------------------------------------- -->
	// global var
	var geminiBlog = {
		blogName: "geminiBlog",
		author			: {
			name		: "Arpan",
			fullName	: "Arpan Pal",
			contact		: [
				{ name	: "homepage", url : "arpanpal.in" },
				{ name	: "mailme"	, url : "mailto:arpan.pal010@gmail.com" },
				{ name	: "github"	, url : "https://www.github.com/", id : "arpanpal010", },
				{ name	: "linkedin", url : "https://www.linkedin.com/in/arpanpal010", },
				{ name	: "twitter" , id  : "arpanpal010", url : "https://www.twitter.com/" },
			]
		},
		entries			: [],			// holds meta of all entries
		freshNumber		: 7,			// how many entries to show in snippets
		tags			: [],			// holds all tags
		templates		: [],			// for all templates
		variables		: [],			// for all variables in posts
		variablePrefix	: '{|',			// {|this|} is a variable
		variablePostfix : '|}',
		snippetLength	: 170,			// how many characters to show per entry snippet?
		repoBase		: "./entries/", // all entries beginning with ./  are prepended this url
		useAsync		: true,			// whether to use synchronous HTTP requests (bad idea)
		timeout			: 4000,			// request timeout
		markDownloads	: false,		// whether markdown files can be downloaded by the viewers
	};
	// !-- -------------------------------------------------------- -->
	// !-- Templates												-->
	// !-- -------------------------------------------------------- -->
	// default templates, can be overridden in config
	geminiBlog.templates = {
		snippetViewTemplate : [
			"<article class='snippet-wrapper'>",
				"<div class='snippet-head'>",
					"<a class='snippet-tags'></a>",
					"<span class='snippet-separator'> » </span>",
					"<a class='snippet-title'></a>",
					"<span class='snippet-date'></span>",
				"</div>",
				"<div class='snippet-body'>",
				"</div>",
				"<div class='snippet-footer'>",
				"</div>",
			"</article>"
		].join(''),

		detailsViewTemplate : [
			"<article class='details-wrapper'>",
				"<div class='details-head'>",
					"<div class='details-head-wrapper'>",
						"<span class='details-tags'>",
							"<a class='details-tag'></a>",
						"</span>",
						"<span class='details-separator'> » </span>",
						"<a class='details-title'></a>",
						"<span class='details-date'></span>",
					"</div>",
				"</div>",
				"<div class='details-body'>",
				"</div>",
				"<div class='details-footer'>",
					"<div class='markdown-source'>",
						"( The source markdown file for this entry can be found <a id='md-src'>Here</a> )",
					"</div>",
					"<div class='previous-next-links'>",
						"<a id='previous-link'>\u2190 Older</a>",
						"<a id='next-link'>Newer \u2192</a>",
					"</div>",
					"<div id='disqus_thread'>",
					"</div>",
				"</div>",
			"</article>"
		].join(''),

		archiveViewTemplate : [
			"<article class='archived-entries'>",
				"<div class='archive-wrapper'>",
					"<span class='archive-date'></span>",
					"<span class='archive-separator'> » </span>",
					"<a class='archive-title'></a>",
					"<span class='tags'>",
						"<a class='archive-tags'></a>",
					"</span>",
				"</div>",
			"</article>"
		].join(''),

		tagViewTemplate : [
			"<article class='tags-box'>",
				"<div class='tags-container'>",
					"<div class='tags-wrapper'>",
						"<a class='tags-title'></a>",
						"<span class='tags-strength'></span>",
					"</div>",
				"</div>",
			"</article>"
		].join(''),
	}
	// !-- -------------------------------------------------------- -->
	// !-- Functions												-->
	// !-- -------------------------------------------------------- -->
	geminiBlog.registerEntry = function(entryUrl, title, pubDate, tags) { // required entryUrl
		// register the .md file as an entry and add it to geminiBlog.entries
		var pd = new Date(pubDate) || null;
		title = title || entryUrl;
		var id = title.replace('.md', '').replace(/[^a-z0-9]/gi, '-').toLowerCase();
		// if url begins with ./ replace it with repoBase, else leave as is and consider as full url
		var eurl = (entryUrl.slice(0, 2) === "./") ? geminiBlog.repoBase + entryUrl.slice(2) : entryUrl;
		var tags_clean = ['untagged'];
		if (tags && tags !== "") {
			tags_clean = tags.replace(" ", "").split(",");
		}

		// create the entry object
		var entry = { // properties of each entry
			index: geminiBlog.entries.length,
			id: id,
			url: eurl,
			title: title,
			pubDate: pd,
			tags: tags_clean
		};
		geminiBlog.entries.push(entry);
		// push tag in tags_clean to geminiBlog.tags if not already in
		// accepts tagname= "Unatagged" useful in searching entries without tags
		for (var i = 0; i < tags_clean.length; i++) {
			if (geminiBlog.tags.indexOf(tags_clean[i]) == - 1) {
				geminiBlog.tags.push(tags_clean[i]);
				console.log("added tag: " + tags_clean[i]);
			}
		}
	};
	// sort list by a key - default: pubDate
	geminiBlog.sortEntries = function(key, elist, reverse) {
		key = key || "index" // "pubDate";
		elist = elist || geminiBlog.entries;
		reverse = reverse || true; // most recent first // highest value first
		elist.sort(function(a, b) {
			var keyA = a[key];
			var keyB = b[key];
			if (reverse) {
				return ((keyA < keyB) ? 1: ((keyA > keyB) ? - 1: 0));
			}
			else {
				return ((keyA < keyB) ? - 1: ((keyA > keyB) ? 1: 0));
			}
		});
	}
	// find entries by their id
	geminiBlog.getEntryById = function(eid) {
		if (geminiBlog.entries.length === 0) {
			return false;
		}
		if (geminiBlog.entries.length === 1) {
			return geminiBlog.entries[0];
		}
		for (var i in geminiBlog.entries) {
			// alert(geminiBlog.entries[i].id + " " + eid);
			if (geminiBlog.entries[i].id === eid) {
				return geminiBlog.entries[i];
			}
		}
		// alert(geminiBlog.entries[i].id+" "+eid);
		return false;
	}
	// find entries by their indexd
	geminiBlog.getEntryByIndex = function(eindex) {
		if (geminiBlog.entries.length === 0) {
			return false;
		}
		if (geminiBlog.entries.length === 1) {
			return geminiBlog.entries[0];
		}
		for (var i in geminiBlog.entries) {
			// alert(geminiBlog.entries[i].id + " " + eid);
			if (geminiBlog.entries[i].index === eindex) {
				return geminiBlog.entries[i];
			}
		}
		// alert(geminiBlog.entries[i].id+" "+eid);
		return false;
	}
	// find entries by tag
	geminiBlog.getEntriesByTag = function(tag) {
		if (geminiBlog.entries.length === 0) {
			return false;
		}
		if (geminiBlog.entries.length === 1) {
			return geminiBlog.entries[0];
		}
		var tagged_entries = [];

		for (var i in geminiBlog.entries) {
			var entry = geminiBlog.entries[i];
			if (entry.tags.indexOf(tag) !== - 1) {
				tagged_entries.push(entry);
			}
		}
		return (tagged_entries.length > 0) ? tagged_entries: false;
	}
	// markdown to html conversion function with variable replacement
	/* markdown2html parser https://github.com/chjj/marked/ */
	if (w.marked) {
		geminiBlog.markDownOptions = geminiBlog.markDownOptions || {
			renderer: new marked.Renderer(),
			gfm: true,
			tables: true,
			breaks: false,
			pedantic: false,
			sanitize: true,
			smartLists: true,
			smartypants: false
		}
		// this function makes html from markdown
		geminiBlog.mdToHTML = function(md) {
			if (marked && geminiBlog.markDownOptions) {
				return marked(geminiBlog.handleVars(md), geminiBlog.markDownOptions);
			}
			return false;
		}
	}
	// parse and replace variables in entry
	geminiBlog.handleVars = function(markd, vname, vvalue) {
		// read vprefix and vpostfix from config
		// just replace if variable and value provided
		vname = vname || "";
		vvalue = vvalue || null;
		// if name and value provided, do just that
		if (vname !== "" && vvalue != null) {
			return markd.replace(new RegExp(utils.escapeRegExp(geminiBlog.variablePrefix + vname + geminiBlog.variablePostfix), 'g'), vvalue);
		}
		// else try defined variables
		for (var i = 0; i < geminiBlog.variables.length; i++) {
			vname = geminiBlog.variables[i].name;
			vvalue = geminiBlog.variables[i].value;
			markd = markd.replace(new RegExp(utils.escapeRegExp(geminiBlog.variablePrefix + vname + geminiBlog.variablePostfix), 'g'), vvalue);
		}
		return markd;
	}
	geminiBlog.createSnippet = function(entry, sliceAmount) {
		sliceAmount = sliceAmount || geminiBlog.snippetLength;

		var snippetViewHTML = utils.str2WrappedDOMElement(geminiBlog.templates.snippetViewTemplate);
		var wrapper = $('.snippet-wrapper', snippetViewHTML);
		wrapper.setAttribute('id', entry.id)
		wrapper.setAttribute("onclick", "document.location.href = '#!post=" + entry.id + "'");

		var head = $('.snippet-head', wrapper);

		// set tags
		var tagHtml = $('.snippet-tags', head);
		// console.log( tagHtml);
		for (var t in entry.tags) {
			if (t == 0) {
				// only change the tag because it already exists
				tagHtml.setAttribute("id", entry.tags[t]);
				tagHtml.setAttribute("href", "#!tag=" + entry.tags[t]);
				tagHtml.textContent = entry.tags[t];
			} else if (t > 0) {
				//insert a clone
				var newTagHtml = tagHtml.cloneNode(true);
				newTagHtml.textContent = entry.tags[t] + ", ";
				newTagHtml.setAttribute("id", entry.tags[t]);
				newTagHtml.setAttribute("href", "#!tag=" + entry.tags[t]);
				head.insertBefore(newTagHtml, head.childNodes[0]);
			}
		}

		//set title
		$('.snippet-title', head).setAttribute("href", "#!post=" + entry.id);
		$('.snippet-title', head).textContent = (entry.title.length > 25) ? entry.title.slice(0, 25) + "...": entry.title;
		$('.snippet-date', head).textContent = " added on " + entry.pubDate.toLocaleDateString();

		if (!entry.snippetHtml) {
			entry.snippetHtml = geminiBlog.mdToHTML(entry.text.slice(0, sliceAmount) + "&hellip;");
		}
		$('.snippet-body', wrapper).innerHTML = entry.snippetHtml;

		// console.log(snippetViewHTML.innerHTML);
		// console.log(entry);
		// return inner dom
		return snippetViewHTML.childNodes[0];
	}
	geminiBlog.createDetails = function(entry) {
		var detailsViewHTML = utils.str2WrappedDOMElement(geminiBlog.templates.detailsViewTemplate);

		var head = $('.details-head-wrapper', detailsViewHTML);

		// set tags
		var headTags = $('.details-tags', detailsViewHTML);
		var tagHtml = $('.details-tag', headTags);
		// console.log( tagHtml);
		for (var t in entry.tags) {
			if (t == 0) {
				// only change the tag because it already exists
				tagHtml.setAttribute("id", entry.tags[t]);
				tagHtml.setAttribute("href", "#!tag=" + entry.tags[t]);
				tagHtml.textContent = entry.tags[t];
			} else if (t > 0) {
				//insert a clone
				var newTagHtml = tagHtml.cloneNode(true);
				newTagHtml.textContent = entry.tags[t] + ", ";
				newTagHtml.setAttribute("id", entry.tags[t]);
				newTagHtml.setAttribute("href", "#!tag=" + entry.tags[t]);
				headTags.insertBefore(newTagHtml, headTags.childNodes[0]);
			}
		}

		//set title
		$('.details-title', head).setAttribute("href", "#!post=" + entry.id);
		$('.details-title', head).setAttribute("id", entry.id);
		$('.details-title', head).textContent = (entry.title.length > 25) ? entry.title.slice(0, 25) + "...": entry.title;
		$('.details-date', head).textContent = " added on " + entry.pubDate.toLocaleDateString();

		//set content
		$('.details-body', detailsViewHTML).innerHTML = entry.html;

		//footer
		var footer = $('.details-footer', detailsViewHTML);
		//markdown source
		if(geminiBlog.markDownloads) {
			$('#md-src', footer).setAttribute('href', entry.url);
		} else {
			utils.hide($('.markdown-source', footer));
		}

		//previous link
		if (entry.index > 0) {
			$('#previous-link', footer).setAttribute("href", "#!post=" + geminiBlog.getEntryByIndex(entry.index - 1).id);
			$('#previous-link', footer).setAttribute("title", geminiBlog.getEntryByIndex(entry.index - 1).title);
		} else {
			// remove link
			utils.hide($('#previous-link', footer));
		}
		// next link
		if (entry.index < geminiBlog.entries.length - 1) {
			$('#next-link', footer).setAttribute("href", "#!post=" + geminiBlog.getEntryByIndex(entry.index + 1).id);
			$('#next-link', footer).setAttribute("title", geminiBlog.getEntryByIndex(entry.index + 1).title);
		} else {
			// remove link
			utils.hide($('#next-link', footer));
		}

		// console.log(detailsViewHTML.innerHTML);
		return detailsViewHTML.childNodes[0];
	}
	geminiBlog.createArchiveHtml = function(entry) {
		var archiveViewHTML = utils.str2WrappedDOMElement(geminiBlog.templates.archiveViewTemplate);
		var wrapper = $('.archive-wrapper', archiveViewHTML);
		wrapper.setAttribute("onclick", "document.location.href = '#!post=" + entry.id + "'");

		var head = wrapper; //$('.archive-head', wrapper);

		var tagHead = $('.tags', wrapper);

		// set tags
		var tagHtml = $('.archive-tags', tagHead);
		// console.log( tagHtml);
		for (var t in entry.tags) {
			if (t == 0) {
				// only change the tag because it already exists
				tagHtml.setAttribute("id", entry.tags[t]);
				tagHtml.setAttribute("href", "#!tag=" + entry.tags[t]);
				tagHtml.textContent = entry.tags[t];
			} else if (t > 0) {
				//insert a clone
				var newTagHtml = tagHtml.cloneNode(true);
				newTagHtml.textContent = entry.tags[t] + ", ";
				newTagHtml.setAttribute("id", entry.tags[t]);
				newTagHtml.setAttribute("href", "#!tag=" + entry.tags[t]);
				// head.insertBefore(newTagHtml, $('.archive-tags', head));
				tagHead.insertBefore(newTagHtml, tagHead.childNodes[0]);
				// tagHead.appendChild(newTagHtml);
			}
		}

		//set title
		$('.archive-title', head).setAttribute("href", "#!post=" + entry.id);
		$('.archive-title', head).textContent = (entry.title.length > 25) ? entry.title.slice(0, 25) + "...": entry.title;
		$('.archive-date', head).textContent = entry.pubDate.toLocaleDateString();

		// if (!entry.archiveHtml) {
		//	entry.archiveHtml = geminiBlog.mdToHTML(entry.text.slice(0, sliceAmount) + "&hellip;");
		// }
		// $('.archive-body', wrapper).innerHTML = entry.archiveHtml;

		// console.log(archiveViewHTML.innerHTML);
		// console.log(entry);
		// return inner dom
		return archiveViewHTML.childNodes[0];
	}
	geminiBlog.createTagHtml = function(tag) { // unused at the moment
		// var tagViewHTML = utils.str2WrappedDOMElement(geminiBlog.templates.tagViewTemplate);
		// $('.tags-wrapper', tagViewHTML).setAttribute("onclick", "document.location.href = '#!tag=" + tag + "'");
		//
		// $('.tags-title', tagViewHTML).textContent = tag;
		//
		// console.log(tagViewHTML.innerHTML);
		// console.log(tag);
		// // return inner dom
		// return tagViewHTML.childNodes[0];
	}
	// shows a subsection of entries in snippet mode, heading + a partial of content + meta
	geminiBlog.snippetView = function(entries, containerClass, sliceLength) {
		entries = entries || geminiBlog.entries;
		sliceLength = sliceLength || geminiBlog.freshNumber - 1;
		var container = utils.clearElements($(containerClass || geminiBlog.containerDiv));

		// var event = utils.registerEvent('new-entry-fetched', true, true);
		// utils.registerListener(document, 'new-entry-fetched', function(e) {
		//	   console.log("Loaded entry: " + e.data.index + ": " + e.data.title + " " + e.data.pubDate.toLocaleDateString());
		//	   container.appendChild(geminiBlog.createSnippet(e.data));
		// })
		entries.forEach(function(entry, index) {
			// fetch entry and process
			if (!entry.text) {
				utils.ajax({
					method: "GET",
					url: entry.url,
					mimeType: "text/plain; charset=x-user-defined",
					success: function(xhr) {
						console.log('processEntry(): Status: ' + xhr.status);
						entry.text = xhr.responseText;
						entry.html = geminiBlog.mdToHTML(xhr.responseText);

						//create and add snippet
						console.log("Loaded entry: " + entry.index + ": " + entry.title + " " + entry.pubDate.toLocaleDateString());
						if (index < sliceLength) container.appendChild(geminiBlog.createSnippet(entry));

						// dispatch event
						// event.data = entry;
						// document.dispatchEvent(event);
					},
					error: function() {
						console.error(this.statusText);
						response = error404;
						return false;
					}
				})
			} else {
				//create and add snippet
				console.log("Found entry: " + entry.index + ": " + entry.title + " " + entry.pubDate.toLocaleDateString());
				if (index < sliceLength) container.appendChild(geminiBlog.createSnippet(entry));
			}
		});
	}
	geminiBlog.detailsView = function(entry, containerClass) {
		var container = utils.clearElements($(containerClass || geminiBlog.containerDiv));

		var detailsViewInstructions = function(entry) {
			//create and add snippet
			console.log("Loaded entry: " + entry.index + ": " + entry.title + " " + entry.pubDate.toLocaleDateString());
			container.appendChild(geminiBlog.createDetails(entry));

			// scroll(0,posTop); // scroll to top after the entry loads, set the px value in config depending on header height
			// scroll upto entry.id anchor, markdown heading is just below
			document.getElementById(entry.id).scrollIntoView(true);

			// reset disqus pagetracker to current page
			// this will only work if the dsqsDiv has been created
			// already, otherwise TypeError: a is not defined
			geminiBlog.resetDisqus(entry, document.location, "en");
		}

		// fetch entry and process
		if (!entry.text) {
			utils.ajax({
				method: "GET",
				url: entry.url,
				mimeType: "text/plain; charset=x-user-defined",
				success: function(xhr) {
					console.log('processEntry(): Status: ' + xhr.status);
					entry.text = xhr.responseText;
					entry.html = geminiBlog.mdToHTML(xhr.responseText);

					//generate
					detailsViewInstructions(entry);

				},
				error: function() {
					console.error(this.statusText);
					response = error404;
					return false;
				}
			})
		} else {
			//create and add details
			detailsViewInstructions(entry);
		}
	}
	geminiBlog.archiveView = function(containerClass) {
		var container = utils.clearElements($(containerClass || geminiBlog.containerDiv));

		geminiBlog.entries.forEach(function(entry, index) {
			// fetch entry and process
			if (!entry.text) {
				utils.ajax({
					method: "GET",
					url: entry.url,
					mimeType: "text/plain; charset=x-user-defined",
					success: function(xhr) {
						console.log('processEntry(): Status: ' + xhr.status);
						entry.text = xhr.responseText;
						entry.html = geminiBlog.mdToHTML(xhr.responseText);

						//create and add snippet
						console.log("Loaded entry: " + entry.index + ": " + entry.title + " " + entry.pubDate.toLocaleDateString());
						container.appendChild(geminiBlog.createArchiveHtml(entry));

						// dispatch event
						// event.data = entry;
						// document.dispatchEvent(event);
					},
					error: function() {
						console.error(this.statusText);
						response = error404;
						return false;
					}
				})
			} else {
				//create and add snippet
				console.log("Found entry: " + entry.index + ": " + entry.title + " " + entry.pubDate.toLocaleDateString());
				container.appendChild(geminiBlog.createArchiveHtml(entry));
			}
		})
	}
	geminiBlog.tagsView = function(containerClass) {
		var container = utils.clearElements($(containerClass || geminiBlog.containerDiv));
		var tagViewHTML = utils.str2WrappedDOMElement(geminiBlog.templates.tagViewTemplate);
		var tagsContainer = $('.tags-container', tagViewHTML);
		var tagsWrapper = $('.tags-wrapper', tagsContainer);
		// tagsContainer.setAttribute("onclick", "document.location.href = '#!tag=" + tag + "'")

		geminiBlog.tags.forEach(function(tag, index) {
			if(index === 0) {
				tagsWrapper.setAttribute("onclick", "document.location.href = '#!tag=" + tag + "'");
				$('.tags-title', tagsWrapper).textContent = tag;
				var strength = geminiBlog.getEntriesByTag(tag).length;
				$('.tags-strength', tagsWrapper).textContent = geminiBlog.getEntriesByTag(tag).length ===1 ? "1 entry" : strength + " entries";
			} else {
				var tagsWrapperClone = tagsWrapper.cloneNode(true);
				tagsWrapperClone.setAttribute("onclick", "document.location.href = '#!tag=" + tag + "'");
				$('.tags-title', tagsWrapperClone).textContent = tag;
				var strength = geminiBlog.getEntriesByTag(tag).length;
				$('.tags-strength', tagsWrapperClone).textContent = geminiBlog.getEntriesByTag(tag).length ===1 ? "1 entry" : strength + " entries";
				tagsContainer.appendChild(tagsWrapperClone);
			}
		})
		container.appendChild(tagViewHTML.childNodes[0]);
	}

	// reset disqus comments panel when post changes
	geminiBlog.resetDisqus = function (entry, location, newLanguage) {
		DISQUS.reset({
			reload: true,
			config: function() {
				this.page.identifier = entry.id;
				this.page.title = entry.title;
				this.page.url = location;
				this.language = newLanguage;
			}
		});
		console.log("Updated DISQUS info for: " + entry.title);
	}

	geminiBlog.router = function() {
		// if anchored - show entry maching id with anchor or tag matching anchor or default page
		var anchor = document.location.hash.substring(2).toLowerCase(); // substring(2) removing hashbang
		if (anchor !== "") {
			// routing done here based on hashbang anchors
			switch (true) {
				case anchor === "frontpage" : return geminiBlog.snippetView();;
				case anchor === "archive"	: return geminiBlog.archiveView();;
				case anchor === "tags"		: return geminiBlog.tagsView();;
				// case anchor === "tags": return showTags();;
				// case anchor === "archive": return showArchive();;

				// parse posts by regex
				case(/^post=(.*)/.test(anchor)):
					if (geminiBlog.getEntryById(anchor.match(/^post=(.*)/)[1])) {
					return geminiBlog.detailsView(geminiBlog.getEntryById(anchor.match(/^post=(.*)/)[1]));
				} else {
					document.location.href = "#!frontpage";
				}
				break;

				// parse tags by regex
				case (/^tag=(.*)/.test(anchor)):
					if (anchor.match(/^tag=(.*)/)[1]) {
					return geminiBlog.snippetView(geminiBlog.getEntriesByTag(anchor.match(/^tag=(.*)/)[1]));
				} else {
					document.location.href = "#!frontpage";
				}
				break;

				default:
					document.location.href = "#!frontpage";
				break;
			}
		}
		// default - snippetview of fresh entries
		return geminiBlog.snippetView();
	}

	// setup = these functions are run after the page finishes loading
	geminiBlog.init = function() {
		document.title=geminiBlog.blogName;
		// sort the lists
		geminiBlog.sortEntries();
		geminiBlog.tags.sort();

		// populate sidebar with a list of entries - comment this out if sidebar is hidden
		// listView();
		// show view accordingly by router
		geminiBlog.router();
		utils.registerListener(w, 'hashchange', geminiBlog.router);
	}
	// !-- -------------------------------------------------------- -->
	// !-- Start													-->
	// !-- -------------------------------------------------------- -->
	// fire geminiBlog.init() after page load or if the anchor changes
	utils.registerListener(w, 'load', geminiBlog.init);
	// debug
	w['geminiBlog'] = geminiBlog;

	// TODO: add a contact/about info at the bottom of detailviews
	// assign links to contact icons or hide them
	function contactLinkMaker() { // contactLinks defined in config
		for (var i = 0; i < contactLinks.length; i++) {
			var cl = contactLinks[i];
			// console.log(cl);
			if (document.getElementById("contact_" + cl.name)) {
				var el = document.getElementById("contact_" + cl.name);
				var id = cl.id || '';
				var url = cl.url || '';
				if (url || id) { // || url) {
					el.setAttribute("href", url + id);
					el.setAttribute("title", utils.capFirst(cl.name) + ": " + id);
					el.style.display = "inline-block";
				}
				else {
					el.style.display = "none";
				}
			}
		}
	}
} (window);
// vim: set ft=javascript

