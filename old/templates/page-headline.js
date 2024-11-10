module.exports = async (req, {name, details, breadcrumbs})=>`
	<div class="smon-page smon-page-headline">
		${breadcrumbs ? `
			<nav id="#breadcrumbs" aria-label="breadcrumb">
				<ol class="breadcrumb">
					${breadcrumbs}
				</ol>
			</nav>
		` : ``}
		<h1 class="smon-page smon-page-name">${name}</h1>
		<h5 class="smon-page smon-page-details">${details}</h5>
	</div>
`;		
