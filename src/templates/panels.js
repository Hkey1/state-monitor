module.exports = async (req, {content, neadBeRow, id})=>`
	<div id="${id}" class="sMon-panels accordion ${neadBeRow?`row`:``}">
		${content}
	</div>
`;