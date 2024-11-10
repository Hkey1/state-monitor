module.exports = async (req, {content, classes})=>((!content) ? `` :
	`<span class="badge ${classes??`text-bg-secondary`}">${content}</span>`
);