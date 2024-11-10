module.exports = async (req, {name, count})=>`
	<span class="sMon-tab-title ${count!==undefined ? 'sMon-tab-title-withCount' : ''}">
		<span class="sMon-tab-name sMon-tab-title-name">${name}</span>
		${count!==undefined ? `
			<span class="sMon-tab-count sMon-tab-title-count">${count}</span>
		` : ''}
	</span>
`; 