module.exports = async (req, {details, name, fullName, icon, badge, h, classes}, item)=>{
	const tag  = isNaN(1*h) ? h   : 'h'+h; 
	const tag2 = isNaN(1*h) ? 'i' : 'h6'; 
	return `
		<${tag} class="sMon-paragraph-title ${classes||''}">${''
			+(await item.template('icon', req, {content: icon}))	
			+(fullName||name) 
			+(await item.template('badge', req, {content: badge}))
		}</${tag}>${details ? 
			`<${tag2} class="card-subtitle mb-2 text-body-secondary sMon-card-details">${details}</${tag2}>`
		:``}`;
};
