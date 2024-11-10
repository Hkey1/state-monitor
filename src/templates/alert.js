module.exports = async (req, {content, type})=>`
	<div class="smon-alert alert alert-${type||'danger'}">
		${content}
	</div>
`;