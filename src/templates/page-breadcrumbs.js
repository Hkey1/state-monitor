module.exports = async (req, {url, isActive, name, fullName, before, details, badge}, item)=>`
	${before}
	${isActive 
		? `<li class="breadcrumb-item active" aria-current="page">${name}</li>`
		: `<li class="breadcrumb-item">
			<a href="${url}" title="${fullName ? `${fullName}. `: ``}${details ? `${details}. `: ``}" >
				${name}
			</a>
		</li>`
	}
`;