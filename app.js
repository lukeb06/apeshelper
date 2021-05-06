var fetch = require("node-fetch");

var express = require("express");
var app = express();
var server = require("http").Server(app);
server.listen(process.env.PORT || 3000, () => console.log("Server Started!"));

app.use(require("cors")());

var matchAll = require("match-all");

var keys = [
	"AIzaSyA8x1TJcYrm9aWcfOts-ErxUvcfbSY2bz0",
	"AIzaSyASYa5MgufKHwb3njv0M72n__WF_sG9lh0",
	"AIzaSyBFYyn93wf6_8u-0yBsq7nrIRdrVCyQNos"
];

Array.prototype.random = function() {
	return this[Math.floor(Math.random() * this.length)];
}

var googleSearch = async (query) => {
	var r = await fetch(`https://www.googleapis.com/customsearch/v1?key=${keys.random()}&cx=e51615b7e7a44e7e6&q=${query}`);
	r = await r.json();
	return r.items;
}

app.use("/", express.static(`${__dirname}/client`));

app.get("/", () => res.sendFile(`${__dirname}/client/index.html`));



var quizSearch = (req, res) => {
	googleSearch(req.query.q).then(items => {
		res.send(items);
	});
}




app.get("/quizSearch", quizSearch);





function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}






var globalHeaders = {
    "user-agent": "Mozilla/5.0",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1"
  }







var scrapeQuiz = (req, res) => {
  fetch(`https://quizlet.com/${req.params.quizId}/${req.params.quizTitle}`, {
  "headers": globalHeaders,
  "referrer": "https://quizlet.com/287534176/learn",
  "referrerPolicy": "origin-when-cross-origin",
  "body": null,
  "method": "GET"
}).then(r => r.text())
	.then(r => {
		// res.send(r);
		var words = matchAll(r, new RegExp("\"SetPageTerm-wordText\"><span .*?>(.*?)<\/span>", "g")).toArray();
		var defs = matchAll(r, new RegExp("\"SetPageTerm-definitionText\"><span .*?>(.*?)<\/span>", "g")).toArray();

		console.log(matchAll("SetTextTerm", new RegExp("Set(.*?)Term", "g")).toArray());

		var terms = [];

		words.forEach((v, i) => {
			terms.push({[v]: defs[i]});
		});

		console.log(terms);

		res.send(terms);
	});
}








app.get("/scrapeQuiz/:quizId/:quizTitle", scrapeQuiz);





app.get("/execute", (req, res) => {
	var totalItems = [];
	var doneSearching = false;
	quizSearch({query:{q:req.query.q}}, {send:(items) => {
		if (items == undefined) return res.send([]);
		items.forEach((item, i) => {
			setTimeout(() => {
				scrapeQuiz({params:{quizId:item.link.split("/")[3], quizTitle:item.link.split("/")[4]}}, {send:(_items) => {
					var newItems = _items.map(v => [Object.keys(v)[0], Object.values(v)[0]]);
					
					var relations = newItems.map(v => {
						var sims = [
							similarity(v[0] || "", req.query.q || ""),
							similarity(v[1] || "", req.query.q || "")
						];
						
						if (sims[0] > sims[1]) {
							return [sims[0], v[1]];
						} else {
							return [sims[1], v[0]];
						}
					});
					
					relations.forEach(v => {
						if (v[0] > 0.7) {
							totalItems.push(v[1]);
						}
					});
					
					if (i == items.length - 1) doneSearching = true;
				}});
			},100*i);
		});
	}});
	
	var inter = setInterval(() => {
		if (doneSearching) {
			clearInterval(inter);
			res.send(totalItems);
		}
	},100);
});



app.get("/search", (req, res) => {
	var params = Object.entries(req.query).map(v => `${v[0]}=${v[1]}`).join("&")
	fetch(`https://www.google.com/search?${params}`).then(r=>r.text()).then(r => {
		res.send(r);
	});
});


app.get("/url", (req, res) => {
	fetch(req.query.q, {headers:globalHeaders}).then(r => r.text()).then(r => res.send(r));
});





