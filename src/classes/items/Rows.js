const isColWidth = require('../../functions/isColWidth.js');
const Row        = require('./Row.js');

class Rows extends Row{
	static shortKey       = 'rows'
	static childClassName = 'Row';
	static templateName   = 'rows'
	$isContentRow(){return false};
	$isContentRows(){return true};
	$neadBeRows(){return true};
	$neadBeRow(){return false};
	$neadBeCol(){return false};
	
	normalizeOptions(options){
		if(typeof(options)==='object' && !Array.isArray(options)){
			if(isColWidth(options._width)){
				throw new Error(`Rows options._width=${options.width}. Try options.__width`); 
			}
		} 
		return super.normalizeOptions(options);
	}

}; 
module.exports = Rows;