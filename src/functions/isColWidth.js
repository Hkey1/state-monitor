module.exports = function isColWidth(width){
	width *= 1;
	return (!isNaN(width) && width<=12 && width>0 && Math.round(width)===width);
}