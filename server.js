const fs = require('fs');
const http = require('http');
const qs = require('querystring');
const PORT = process.env.PORT || 3000;
const indexReset = require('./indexReset.js');
const pageTemplate = require('./pageTemplate.js');

// reset index.html every run
fs.writeFile('./public/index.html', indexReset, { defaultEncoding: 'utf8' });

let resourceMapping = {
	'': './public/index.html',
	'/': './public/index.html',
	'/index.html': './public/index.html',
	'/hydrogen.html': './public/hydrogen.html',
	'/helium.html': './public/helium.html',
	'/css/styles.css': './public/css/styles.css',
	'/404.html': './public/404.html'
}

let server = http.createServer((req, res) => {
	req.setEncoding('utf8');
	getHandler(req, res);
	postHandler(req, res);
});

function getHandler(req, res) {
	if(req.method === 'GET') {
		fs.readFile(resourceMapping[req.url] || resourceMapping['/404.html'], (err, content) => {
			res.setHeader('Content-Type', (req.url.indexOf('css') > -1) ? ('text/css') : ('text/html'));
			if(err) { res.statusCode = 404; }
			res.write(content);
			res.end();
		});
	}
}

function postHandler(req, res) {
	if(req.url === '/elements' && req.method === 'POST') {
		req.on('data', (chunk) => { 
			let dataObj = qs.parse(chunk);
			let newHTML = fs.writeFile(`./public/${dataObj.elementName}.html`, pageTemplate(dataObj), { defaultEncoding: 'utf8' });
			resourceMapping[`/${dataObj.elementName}.html`] = `./public/${dataObj.elementName}.html`;
			updatePage('add', dataObj.elementName);
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.write('{ "success": true }');
			res.end();
		});
	}
}

function updatePage(action, eleName) {
	fs.readFile(`./public/index.html`, 'utf8', (err, content) => {
		let contentArr = content.split('\n');
		let olIndex = contentArr.indexOf('  <ol>');
		let currNum = Number(contentArr[olIndex-1].split('These are ')[1].split('</h3>')[0]);
		if(action === 'add') {
			contentArr[olIndex - 1] = `  <h3>These are ${currNum + 1}</h3>`;
			contentArr.splice(olIndex + 1, 0, '    <li>', `      <a href="./${eleName}.html">${eleName}</a>`, '    </li>');
			fs.writeFile('./public/index.html', contentArr.join('\n'), { defaultEncoding: 'utf8' });
		}else if(action === 'remove') {

		}
	});
}

server.listen(PORT, () => {
	console.log('Server is listening on port', PORT);
});