module.exports = async (req, {fullName, details, tooltip}, item)=>{
	tooltip  = tooltip  ? tooltip.trim()  : tooltip;
	fullName = fullName ? fullName.trim() : fullName;
	details  = details  ? details.trim()  : details;
	if(tooltip){
		return tooltip;
	} else if(!fullName && !details){
		return '';
	} if(!fullName){
		return details;
	} else if(!details){
		return fullName;
	} 
	const last = fullName[fullName.length-1]; 
	return ((last!=='.' && last!=='?' && last!==':' && last!==';' && last!=='!' && last!=='|' && last!==',' && last!=='\n') 
		? `${fullName}. ${details}`
		: `${fullName} ${details}`
	)
};