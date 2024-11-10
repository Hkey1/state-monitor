module.exports = async (req, {pages, content})=>`
	<ul class="smon-pages smon-page-childs smon-page-sidebar-childs nav nav-pills flex-column mb-auto">
		${content}		
	</ul>
`;