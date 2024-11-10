module.exports = async (req, {isActive, isParent, name, url, childs})=>`
	<li class="smon-page smon-page-sidebar ${isActive ? 'active': ''} ${isParent ? 'parent': ''} ">
		<a href="${url}" class="smon-page smon-page-link nav-link ${isActive ? 'active': 'link-dark'} ${isParent ? 'parent': ''}">${name}</a>
		${childs}
	</li>
`
