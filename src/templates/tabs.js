module.exports = async (req, {head, content})=>`
	<div class="smon-tabs">
		${head}
		<div class="tab-content">
			${content}
		</div>
	</div>
`;