module.exports = async (req, {content, classes, styles, width})=>`
	<div class="container ${classes||''}" 
		style="margin-left: 0; ${styles||''}
		${width ? (`width:${width}${!isNaN(1*width) ? 'px' : ''}`) :''}
	">
		${content}	
	</div>
`;