var fetch = require("node-fetch");

var express = require("express");
var app = express();
var server = require("http").Server(app);
server.listen(process.env.PORT || 80, () => console.log("Server Started!"));

var matchAll = require("match-all");

var googleSearch = async (query) => {
	var r = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyASYa5MgufKHwb3njv0M72n__WF_sG9lh0&cx=e51615b7e7a44e7e6&q=${query}`);
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




var scrapeQuiz = (req, res) => {
  fetch(`https://quizlet.com/${req.params.quizId}/${req.params.quizTitle}`, {
  "headers": {
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
    "upgrade-insecure-requests": "1",
    "cookie": "currentCardIndex=0%2C0; set_num_visits_per_set=8; setPageData=%7B%22studySelected%22%3Afalse%7D; __cfduid=d499dc5c6bc0a85d8f0184a1403fb79c31619719840; qi5=dj53zzmsqhe6%3AaqyBqjugY0HZ0NzpsgLF; fs=qsc7tt; _ga=GA1.2.1681965699.1619719848; g_state={\"i_l\":0,\"i_t\":1619806254096}; qlts=1_QD9Yi-mH13BFrcjrvc7JB8EiweUPpdRmgSEd9buKd.UKeo6Jpikp2CDi76bx6Dbmwlcrd.8Rr.A9XQ; qtkn=gBuY8cugrxzUu6bBw9YZT3; ab.storage.userId.6f8c2b67-8bd5-42f6-9c5f-571d9701f693=%7B%22g%22%3A%2274212266%22%2C%22c%22%3A1619719858816%2C%22l%22%3A1619719858816%7D; ab.storage.deviceId.6f8c2b67-8bd5-42f6-9c5f-571d9701f693=%7B%22g%22%3A%22dd9dde1b-6834-8963-7b02-ad9d71ea14c5%22%2C%22c%22%3A1619719858890%2C%22l%22%3A1619719858890%7D; _delighted_web={%22Nk3AkgdeccgO4tql%22:{%22_delighted_fst%22:{%22t%22:%221619719861735%22}}}; __qca=P0-2038130458-1619719862321; akv=%7B%7D; _gid=GA1.2.163574397.1620043567; _britepool_bpid_=%7B%22value%22%3A%22e3a4f73f-f626-4fcd-9c56-bed2940808b9%22%2C%22expiryTimeMS%22%3A1683115567110%7D; show-study-streak-modal=%7B%22date%22%3A1620014400%2C%22shouldShowModal%22%3Afalse%7D; __cfruid=2883d09fdc7a70c5e7607d9c85afffd2393cf33f-1620069039; io=VkcCawutbgmI5NQZssWz; app_session_id=e60ca774-802e-47c9-89ed-c9a4bcb59478; __cf_bm=612a9d98534a30f436eabcf06b88f6d1a4f2908f-1620081311-1800-AaZ3m7MYXJAYCDZXN/pB89JdmU76f89cyO/882JhXoHqI3slnI1vSLJMxdoNcIc2GAzSIPt6Zg191qSNXqr+444=; tsp=learn_mode_page; ab.storage.sessionId.6f8c2b67-8bd5-42f6-9c5f-571d9701f693=%7B%22g%22%3A%228bad8016-19c0-2253-f9ba-c8d74e5c475c%22%2C%22e%22%3A1620083342838%2C%22c%22%3A1620079768601%2C%22l%22%3A1620081542838%7D; _dd_s=rum=0&expire=1620083044212"
  },
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
		items.forEach((item, i) => {
			setTimeout(() => {
				scrapeQuiz({params:{quizId:item.link.split("/")[3], quizTitle:item.link.split("/")[4]}}, {send:(_items) => {
					var newItems = _items.map(v => [Object.keys(v)[0], Object.values(v)[0]]);
					
					var relations = newItems.map(v => {
						var sims = [
							similarity(v[0], req.query.q),
							similarity(v[1], req.query.q)
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










