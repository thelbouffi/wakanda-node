var check = function(req, res){	var result;	var myWorker = new NodeWorker( './node-worker.js', 'my-worker' );	var query = req.urlQuery;	query = query.substr(5);		myWorker.port.postMessage(query);		myWorker.port.onmessage = function(event){		result = event.data;	}		wait(3000)		if(result === true)			return 'The result is ' + result +', your visa credit card is valid';			if(result === false) 		return 'The result is ' + result +', your visa credit card is not valid';}