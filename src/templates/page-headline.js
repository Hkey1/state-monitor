module.exports = async (req, {name, fullName, details, breadcrumbs, badge, icon}, item)=>`
	<div class="smon-page smon-page-headline">
		${breadcrumbs ? `
			<nav id="#breadcrumbs" aria-label="breadcrumb">
				<ol class="breadcrumb">
					${breadcrumbs}
				</ol>
			</nav>
		` : ``}
		<hr />
		<h2 class="smon-page smon-page-name">
			${await item.template('icon', req, {content: icon})}	
			${fullName||name} 
			${await item.template('badge', req, {content: badge})}</h2>
		${details ? `<h5 class="smon-page smon-page-details">${details}</h5>`: ``}
		<hr />
	</div>
`;		
