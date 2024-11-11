module.exports = async (req, {isActive, childs, url, width, details, name, badge, icon}, item)=>`
	<div id="sidebar" 
	  class="smon-sidebar d-flex flex-column flex-shrink-0 p-3 bg-light" 
	  style="width: ${width};">
		<div class="smon-server-link-div">
			<a href="${url}" 
			  class="smon-server-link d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none ${isActive ? 'active':''}">
				<span class="fs-4 smon-server-name">
					${await item.template('icon', req, {content: icon})}
					${name}
					${await item.template('badge', req, {content: badge})}
				</span>
			</a>
		</div>
		<div class="server-details-div">
			<span class="fs-6 smon-server-details">${details}</span>
		</div>
		<hr />
		${childs}
	</div>
`;
