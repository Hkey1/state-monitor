module.exports = async (req, {url, isActive, content, before})=>`
	${before}
	${isActive ? `
		<li class="breadcrumb-item active" aria-current="page">${content}</li>
	` :`
		<li class="breadcrumb-item"><a href="${url}">${content}</a></li>
	`}
`;