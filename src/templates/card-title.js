module.exports = async (req, {name, count})=>`
	<span class="sMon-card-title ${count!==undefined ? 'sMon-card-title-withCount' : ''}">
		<span class="sMon-card-name sMon-card-title-name">${name}</span>
		${count!==undefined ? `
			<span class="sMon-card-count sMon-card-title-count">${count}</span>
		` : ''}
	</span>
`; 