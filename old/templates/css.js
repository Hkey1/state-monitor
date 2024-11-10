const fs        = require('node:fs').promises;
const {dirname} = require('node:path');

let cache = undefined;
module.exports = async (req, data)=>{
	return (cache ||= await fs.readFile(dirname(__dirname)+'/assets/inline.css', 'utf8'));
};