const isColWidth = require('../functions/isColWidth.js');
module.exports = async (req, {content, classes, width})=>{
	let cWidth = '', sWidth = '';	
	if(isColWidth(width)){
		cWidth = 'col-md-'+width;
	} else if(width) {
		sWidth = `style="${width}${isNaN(1*width)?'':'px'}"`  
	}
	return `
		<div class="col ${classes||''} ${cWidth}" ${sWidth}>
			${content}	
		</div>	
	`;
};