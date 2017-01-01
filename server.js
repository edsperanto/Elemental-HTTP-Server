let fs = require('fs');
let http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {

	console.log(req.url);
	console.log(req.method);

	req.setEncoding('utf8');

	getHandler(req, res);
	postHandler(req, res);

});

function getHandler(req, res) {
	
	let resourceMapping = {
		'': './public/index.html',
		'/': './public/index.html',
		'/index.html': './public/index.html',
		'/hydrogen.html': './public/hydrogen.html',
		'/helium.html': './public/helium.html',
		'/css/styles.css': './public/css/styles.css',
		'/404.html': './public/404.html'
	}

	fs.readFile(resourceMapping[req.url] || resourceMapping['/404.html'], (err, content) => {
		if(req.url.indexOf('css') > -1) {
			res.setHeader('Content-Type', 'text/css');
		}else{
			res.setHeader('Content-Type', 'text/html');
		}
		if(err) { res.statusCode = 404; }
		res.write(content);
		res.end();
	});

}

function postHandler(req, res) {

	if(req.url === '/elements' && req.method === 'POST') {
		checkValidPost();
	}

	function checkValidPost() {
		req.on('data', (chunk) => {
			console.log(chunk);
		});
	}

}

server.listen(PORT, () => {
	console.log('Server is listening on port', PORT);
});