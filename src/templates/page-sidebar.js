module.exports = async (req, {isActive, isParent, name, url, childs, badge, fullName, details, tooltip},item)=>`
	<li class="smon-page smon-page-sidebar ${isActive ? 'active': ''} ${isParent ? 'parent': ''} ">
		<a 
			href="${url}" 
			class="smon-page smon-page-link nav-link ${isActive ? 'active': 'link-dark'} ${isParent ? 'parent': ''}"
			${await item.template('tooltip-attr', req, {fullName, details, tooltip})}
			>${name}${badge ? ` ${await item.template('badge', req, {content: badge})}`:``}</a>
		${childs}
	</li>
`