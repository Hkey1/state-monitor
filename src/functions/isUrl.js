module.exports = function(url){
	if(typeof(url) !== 'string'){
		return false;
	} else return ( false
		|| url.startsWith('https://') 
		|| url.startsWith('http://') 
		|| url.startsWith('://') 
		|| (url.startsWith('//') && !url.contains(' ') && !url.contains('\n') && !url.contains('\t') && !url.trim().length>5)
	);	
};