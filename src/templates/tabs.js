module.exports = async (req, {heads, content, style})=>`
	<div class="smon-tabs">
		<ul class="nav nav-${style} smon-tabs-header" role="tablist">
			${heads}
		</ul>
		<div class="tab-content">
			${content}
		</div>
	</div>
`;