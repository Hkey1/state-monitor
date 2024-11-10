module.exports = async (req, {fullName, details, tooltip}, item)=>tooltip||fullName||details ? `
	title="${(await item.template('tooltip-text', req, {fullName, details, tooltip})).replaceAll('"',"'")}"
`:``;