module.exports = async (req, {content, style, type, classes})=>`
	<${style||'ul'} ${type ? `type="${type}"`:``} class="${classes||''}">
		${content}
	</${style||'ul'}>
`;