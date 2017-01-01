function pageTemplate(dataObj) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements - ${dataObj.elementName}</title>
  <link rel="stylesheet" href="./css/styles.css">
</head>
<body>
  <h1>${dataObj.elementName}</h1>
  <h2>${dataObj.elementSymbol}</h2>
  <h3>Atomic number ${dataObj.elementAtomicNumber}</h3>
  <p>${dataObj.elementDescription.split('+').join(' ')}</p>
  <p><a href="/">back</a></p>
</body>
</html>`
}

module.exports = pageTemplate;