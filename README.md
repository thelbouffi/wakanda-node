How I simply integrate a Node module into Wakanda!
===================


Thanks to the new feature **NodeWorker** developed by **Wakanda** teams, it becomes now possible to have full benefit of any **Node package module** into a **Wakanda** application.


----------


npm into wakanda
-------------

Let’s think about a situation where we need to use a **Node** module in a **Wakanda** backend project. 

For example, in my **Wakanda** application I need to check the code of a visa credit card passed into a url as a query string to check if it is valid or not.
To check the visa code, we will use a node package module called **visa-validation**, this **npm** is able to check the credit card number validity, the expiration date and also the cvv validity.

#### Create the request handler

After creating a backend project, we will create a requesthandler that will call the function responsible for creating the node worker. Into **bootstrap.js** we will add this line of code:

```javascript
httpServer.addRequestHandler('/verify-visa', 'handler.js', 'check');
```


#### Create a handler

Then we will need to add a file called **handler.js** that will contain the function ```check()``` which will be responsible for creating a **nodeWoker** where we will require the **visa-validation module**.
```javascript
var check = function(req, res){
	var myWorker = new NodeWorker( './node-worker.js', 'my-worker');
	var result;
	var query = req.urlQuery;
	var query = query.substr(5);
	myWorker.port.postMessage(query);
	myWorker.port.onmessage = function(event){
		result = event.data;	
	}
	wait(1000);
	if(result === true)	
		return 'The result is ' + result +', your visa credit card is valid'
	if(result === false) 
		return 'The result is ' + result +', your visa credit card is not valid'
}

```


#### Create the node worker of visa validation

We will need to install the node module into the backend folder. So in our terminal we will have to insert those commands
> cd backend<br>
> npm install visa-validation --save

And here is the code defining how the **Node module** will be required into the file **node-worker.js**.
```javascript
var visaCard = requireNode('visa-validation');

onconnect = function(connectEvent) {

    var workerPort = connectEvent.ports[0];
    
    workerPort.onmessage = function(event){
    	var validation = visaCard.isValidCardNumber(event.data);
    	workerPort.postMessage( validation );
		close();
    }
}
```

#### How it works?
![Alt text](/assets/nodeWorkerProcess.png?raw=true "node worker")

When the request handler is called through the browser via this link:
```
http://127.0.0.1:8081/verify-visa?code=4916396764746993
```
That means that the function ```check(req, res)``` contained into **handler.js** is called automatically and it will instantiate the node worker present on the **node-worker.js**.
```
var myWorker = new NodeWorker( './node-worker.js', 'my-worker');
```
Then it will get the parameter on the query string, so it can post it to the node worker.
```
myWorker.port.postMessage(query);
```

On the other side, when the **node worker** is created it waits for an event from the **handler**. When it receives the message that it is waiting for, it posts a response containing the result of the **visa-validation node module** and finally closes the **node worker**.
```javascript
workerPort.onmessage = function(event){
    	var validation = visaCard.isValidCardNumber(event.data);
    	workerPort.postMessage( validation );
		close();
   }
```
We should also not forget to add a ```wait()``` in **handler.js** so it can be able to receive the response from the **node worker** before its context is killed. At the end, the ```check()``` function will return the **node worker** response as a result, so it can display it on the browser.
