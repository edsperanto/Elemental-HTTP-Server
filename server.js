let fs = require('fs');
let http = require('http');

const PORT = process.env.PORT || 3000;

let resourceMapping = {
	'': './public/index.html',
	'/': './public/index.html',
	'/index.html': './public/index.html',
	'/hydrogen.html': './public/hydrogen.html',
	'/helium.html': './public/helium.html',
	'/css/styles.css': './public/css/styles.css',
	'/404.html': './public/404.html'
}

const server = http.createServer((req, res) => {

	console.log(req.url);
	console.log(req.method);

	req.setEncoding('utf8');

	getHandler(req, res);
	postHandler(req, res);

});

function getHandler(req, res) {
	
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
		req.on('data', (chunk) => {
			urlDecoder(chunk);
		});
	}

	function urlDecoder(chunk) {
		let keyValueArr = chunk.split('&');
		let newElementDataObj = {
			elementName: keyValueArr[0].split('=')[1],
			elementSymbol: keyValueArr[1].split('=')[1],
			elementAtomicNumber: keyValueArr[2].split('=')[1],
			elementDescription: keyValueArr[3].split('=')[1],
		}
		newElementPageGenFrom(newElementDataObj);
	}

	function newElementPageGenFrom(dataObj) {
		let newHTML = fs.writeFile(`./public/${dataObj.elementName}.html`, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements - ${dataObj.elementName}</title>
  <link rel="stylesheet" href="./css/styles.css">
</head>
<body>
  <h1>${dataObj.elementName}</h1>
  <h2>${dataObj.elementSymbol}</h2>
  <h3>${dataObj.elementAtomicNumber}</h3>
  <p>${dataObj.elementDescription.split('+').join(' ')}</p>
  <p><a href="/">back</a></p>
</body>
</html>`, { defaultEncoding: 'utf8' });
		updatePages(dataObj.elementName);
	}

	function updatePages(eleName) {
		resourceMapping[`/${eleName}.html`] = `./public/${eleName}.html`;
		console.log(resourceMapping);
	}

}



server.listen(PORT, () => {
	console.log('Server is listening on port', PORT);
});