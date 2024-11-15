module.exports = async (req, {name, fullName, details, breadcrumbs, badge, icon, h}, item)=>`
	<div class="smon-page smon-page-headline">
		${breadcrumbs ? `
			<nav id="#breadcrumbs" aria-label="breadcrumb">
				<ol class="breadcrumb">
					${breadcrumbs}
				</ol>
			</nav>
		` : ``}
		<hr />
		${await item.template('paragraph-title', req, {details, name, fullName, icon, badge, h})}
		<hr />
	</div>
`;		
