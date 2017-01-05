const fs = require('fs');
const http = require('http');
const qs = require('querystring');
const PORT = process.env.PORT || 3000;
const indexReset = require('./indexReset.js');
const pageTemplate = require('./pageTemplate.js');

// reset and update index.html every run
fs.writeFile('./public/index.html', indexReset, 'utf8', () => {
	if(process.env.REPOP === undefined) { // allow for resetting index
		fs.readdir('./public', (err, files) => {
			let filesToIgnore = ['.keep', '404.html', 'css', 'helium.html', 'hydrogen.html', 'index.html'];
			for(let i = 0; i < filesToIgnore.length; i++) {
				files.splice(files.indexOf(filesToIgnore[i]), 1);
			}
			for(let i = 0; i < files.length; i++) {
				let eleName = files[i].split('.html')[0];
				eleName = eleName[0].toUpperCase() + eleName.substr(1);
				files[i] = eleName;
			}
			updatePage('add', files);
		});
	}
});

let server = http.createServer((req, res) => {
	req.setEncoding('utf8');
	switch(req.method) {
		case 'GET':
			getHandler(req, res);
			break;
		case 'POST':
			postHandler(req, res);
			break;
		case 'PUT':
			putHandler(req, res);
			break;
		case 'DELETE':
			delHandler(req, res);
			break;
		default:
			res.setHeader('Content-Type', 'text/plain');
			res.write('Invalid HTTP request');
			res.end();
			break;
	}
});

function getHandler(req, res) {
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

function postHandler(req, res) {
	if(req.url === '/elements') {
		req.on('data', (chunk) => { 
			let dataObj = qs.parse(chunk);
			fs.writeFile(`./public/${dataObj.elementName.toLowerCase()}.html`, pageTemplate(dataObj), 'utf8');
			updatePage('add', [dataObj.elementName]);
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.write('{ "success": true }');
			res.end();
		});
	}
}

function putHandler(req, res) {
	// add code for PUT requests
}

function delHandler(req, res) {
	// add code for DELETE requests
}

function updatePage(action, eleNamesArr) {
	fs.readFile(`./public/index.html`, 'utf8', (err, content) => {
		let contentArr = content.split('\n');
		let olIndex = contentArr.indexOf('  <ol>');
		let currNum = Number(contentArr[olIndex-1].split('These are ')[1].split('</h3>')[0]);
		if(action === 'add') {
			for(let i = 0; i < eleNamesArr.length; i++) {
				contentArr[olIndex - 1] = `  <h3>These are ${++currNum}</h3>`;
				contentArr.splice(olIndex + 1, 0, '    <li>', `      <a href="./${eleNamesArr[i].toLowerCase()}.html">${eleNamesArr[i]}</a>`, '    </li>');
			}
			fs.writeFile('./public/index.html', contentArr.join('\n'), 'utf8');
		}else if(action === 'remove') {
			contentArr[olIndex - 1] = `  <h3>These are ${--currNum}</h3>`;
			// add code to remove <li> element
			fs.writeFile('./public/index.html', contentArr.join('\n'), 'utf8');
		}
	});
}

server.listen(PORT, () => {
	console.log('Server is listening on port', PORT);
});