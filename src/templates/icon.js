const isUrl = require('../functions/isUrl.js');
module.exports = async (req, {content})=>{
	if(!content){
		return ''
	} else if(isUrl(content)){
		if(content.endsWith('.svg')){
			return `
				<svg class="sMon-icon sMon-icon-svg-url">       
					<image xlink:href="${content}" />    
				</svg>
			`;
		} else return (`
			<i class="sMon-icon">       
				<img href="${content}" />    
			</i>
		`)		
	} else if(content.includes('<')){
		return `<i class="sMon-icon"> ${content}</i>`;
	} else return (`
		<i class="bi bi-${content}"></i>
	`)
};

