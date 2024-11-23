module.exports = async (req, {content, classes, width})=>`
	<div class="row ${classes||''}" 
		${width ? (`style="width:${width}${!isNaN(1*width) ? 'px' : ''}"`) :''}>
		${content}	
	</div>
`;