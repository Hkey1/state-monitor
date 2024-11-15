module.exports = async (req, {content, style, type, classes})=>{
	const flush    = style.toLowerCase().includes('flush');
	const numbered = style.toLowerCase().includes('numbered');
	return `<ul ${type ? `type="${type}"`:``} 
		class="
			list-group 
			${numbered ? 'list-group-numbered' : ''} 
			${flush    ? 'list-group-flush'    : ''} 
			${classes||''}
		">
		${content}
	</ul>`
};