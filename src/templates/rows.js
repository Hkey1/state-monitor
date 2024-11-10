module.exports = async (req, {content, classes, styles})=>`
	<div class="container ${classes||''}" style="margin-left: 0; ${styles||''}">
		${content}	
	</div>
`;