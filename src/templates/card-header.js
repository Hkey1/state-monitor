module.exports = async (req, {title, details})=>`
	<div class="row sMon-card-header">
		<h5 class="card-title sMon-card-title">${title}</h5>
		${details ? 
			`<h6 class="card-subtitle mb-2 text-body-secondary sMon-card-details">${details}</h6>`
		:``}
		<hr />
	</div>
`; 