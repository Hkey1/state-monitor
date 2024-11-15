module.exports = async (req, {content, id, classes})=>`
	<div id="${id}" class="sMon-panels accordion ${classes||''}">
		${content}
	</div>
`;