const fs    = require('node:fs');//.promises
const cache = {};
 
module.exports = function requireAll(path){
	return cache[path] ||= Object.fromEntries(
		fs.readdirSync(path, { withFileTypes: true })
		.filter(file=>(!file.isDirectory()) && file.name!=='index.js') 
		.map(file => [
			file.name.substring(0, file.name.lastIndexOf('.')),
			require(path+'/'+file.name)	
		])
	);
};