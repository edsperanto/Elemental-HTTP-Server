const fs = require('fs');
const http = require('http');
const qs = require('querystring');
const PORT = process.env.PORT || 3000;
const pageTemplate = require('./pageTemplate.js');

let server = http.createServer((req, res) => {
	req.setEncoding('utf8');
	getHandler(req, res);
	postHandler(req, res);
});

function getHandler(req, res) {
	if(req.method === 'GET') {
		fs.readFile(`./public${(req.url === '/') ? ('/index.html') : (req.url)}`, (err, content) => {
			res.setHeader('Content-Type', (req.url.indexOf('css') > -1) ? ('text/css') : ('text/html'));
			if(err) { 
				res.statusCode = 404; 
				fs.readFile('./public/404.html', (_, errPage) => {
					res.write(errPage);
					res.end();
				});
			}else{
				res.statusCode = 200;
				res.write(content);
				res.end();
			}
		});
	}
}

function postHandler(req, res) {
	if(req.url === '/elements' && req.method === 'POST') {
		req.on('data', (chunk) => { 
			let dataObj = qs.parse(chunk);
			let newHTML = fs.writeFile(`./public/${dataObj.elementName.toLowerCase()}.html`, pageTemplate(dataObj), { defaultEncoding: 'utf8' });
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