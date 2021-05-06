var inputBox = document.createElement("input");
inputBox.placeholder = "Query";
document.body.append(inputBox);

var reqBtn = document.createElement("button");
reqBtn.textContent = "Search";
document.body.append(reqBtn);

var resBody = document.createElement("div");
document.body.append(resBody);






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




var submit = () => {
	resBody.innerHTML = "";
	var c = document.createElement("center");
	c.textContent = "Searching...";
	resBody.append(c);
	var q = inputBox.value;
	q.split("\'");
	q.join("");
	fetch(`/execute?q=${q}`).then(r => r.json())
	.then(items => {
		resBody.innerHTML = "";
		items.forEach(v => {
			var el = document.createElement("span");
			el.innerHTML = v;
			resBody.append(el);
		});
	});
	/*fetch(`/quizSearch?q=${inputBox.value}`, {method:"GET"}).then(r => r.json())
	.then(items => {
		resBody.innerHTML = "";
		items.forEach((item, i) => {
			// var el = document.createElement("a");
			// el.textContent = item.title;
			// el.href = item.link;
			// resBody.append(el);
			setTimeout(() => {
				fetch(`/scrapeQuiz/${item.link.split("/")[3]}/${item.link.split("/")[4]}`).then(r => r.json())
				.then(_items => {
					var newItems = _items.map(v => [Object.keys(v)[0], Object.values(v)[0]]);
					
					var relations = newItems.map(v => {
						var sims = [
							similarity(v[0], inputBox.value),
							similarity(v[1], inputBox.value)
						];
						
						if (sims[0] > sims[1]) {
							return [sims[0], v[1]];
						} else {
							return [sims[1], v[0]];
						}
					});
					
					relations.forEach(v => {
						if (v[0] > 0.7) {
							var el = document.createElement("div");
							el.textContent = v[1];
							resBody.append(el);
						}
					});
				});
			},500*i);
		});
	});*/
}




inputBox.addEventListener("keydown", (e) => {
	if (e.key == "Enter") submit();
});

reqBtn.addEventListener("click", submit);
