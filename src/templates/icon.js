module.exports = async (req, {content})=>{
	if(!content){
		return ''
	} else if(content.includes('<')){
		return `<i class="sMon-icon"> ${content}</i>`;
	} else return`
		<i class="bi bi-${content}"></i>
	`
};

