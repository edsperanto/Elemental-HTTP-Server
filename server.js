let fs = require('fs');
let http = require('http');
let resourceMapping = {
	'': './public/index.html',
	'/': './public/index.html',
	'/index.html': './public/index.html',
	'/hydrogen.html': './public/hydrogen.html',
	'/helium.html': './public/helium.html',
	'/css/styles.css': './public/css/styles.css',
	'/404.html': './public/404.html'
}

const PORT = process.env.PORT || 3000;
const pageTemplate = require('./pageTemplate.js');
const server = http.createServer((req, res) => {
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
		let newHTML = fs.writeFile(`./public/${dataObj.elementName}.html`, pageTemplate(dataObj), { defaultEncoding: 'utf8' });
		resourceMapping[`/${dataObj.elementName}.html`] = `./public/${dataObj.elementName}.html`;
		updatePage('add', dataObj.elementName);
	}

}

function updatePage(action, eleName) {
	fs.readFile(`./public/index.html`, 'utf8', (err, content) => {
		let contentArr = content.split('\n');
		if(action === 'add') {
			let olIndex = contentArr.indexOf('  <ol>');
			contentArr.splice(olIndex+1, 0, '    <li>', `      <a href="./${eleName}.html">${eleName}</a>`, '    </li>');
			fs.writeFile('./public/index.html', contentArr.join('\n'), { defaultEncoding: 'utf8' });
		}
	});
}

server.listen(PORT, () => {
	console.log('Server is listening on port', PORT);
});