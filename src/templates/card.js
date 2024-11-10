module.exports = async (req, {header, width, body})=>{
	//width = isNaN(1*width) ? width : 1*width;
	let cWidth = '';
	let sWidth = '';
	if(!isNaN(1*width)){
		if(1*width > 0 && width<=12){
			cWidth = 'col-sm-'+width;
		} else {
			sWidth = 'width: '+width+'px;';
		}
	} else {
		sWidth = 'width: '+width+';';
	}

	return `<div class="sMon-card card ${cWidth}" style="${sWidth}">
		<div class="card-body">
			${header}
			${body}
		</div>
	</div>`
}; 





