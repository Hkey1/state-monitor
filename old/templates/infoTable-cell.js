module.exports = async (req, {content, isSubHeader, isKey})=>{
	const tag = isKey || isSubHeader ? 'th' : 'td'; 		
	return `
		<${tag} class="sMon-infoTable-cell">
			${content}
		</${tag}>
	`;
}