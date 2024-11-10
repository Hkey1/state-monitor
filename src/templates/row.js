module.exports = async (req, {content, classes})=>`
	<div class="row ${classes||''}">
		${content}	
	</div>
`;