const lib          = require('./lib.js');
const functions    = require('./functions/index.js');

lib.init();

const classes      = {...lib.base, ...functions.requireAll(__dirname+'/classes/')};
module.exports = {
	lib,
	functions,
	classes,
	templates    : lib.templates,
	addClass     : lib.addClass.bind(lib),
	...functions,
	...classes,
};