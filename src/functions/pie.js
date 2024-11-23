const assert        = require('node:assert');
const mustBe        = require('hkey-must-be');
const tag           = require('./tag.js');
const calcPieColors = require('./calcPieColors.js');

module.exports = function pie(data, opts={}){
	const colors           = calcPieColors(data);
	let {width, hideNot, classes} = opts;
	
	width ||= '100%';
	width  = isNaN(1*width) ? width : width+'px'; 
	
	const radius    = 100;
	const voidColor = '#D3D3D3';
	const sum       = data.reduce((s,row)=>s+1*row.count, 0);
	const pi2       = 2 * Math.PI;
	let startAngle  = 0.75*pi2;	

	function calcColor(row, i){
		return (!row || (hideNot!==undefined && hideNot!==i && hideNot!==row.name)) ? voidColor : row.color || colors[i];		
	}
	function calcTitle(row, i){
		return row ? `<title>${row.name||i}: ${row.count} ≈ ${Math.round(row.count*100/sum)}%</title>` : '';
	}
	
		
	const cRows = data.filter(row=>1*row.count);
	if(cRows.length<=1) {
		const row = cRows[0];
		content   = tag('circle', calcTitle(row, 0), {
			...((row ? row.pathAttrs : {})|| {}),
			cx   : radius,
			cy   : radius,
			r    : radius,
			fill : calcColor(row, 0),
		})
	} else {
		content = data.map((row,i)=>{
			const angle  = row.count * pi2 / sum;
			let endAngle = startAngle + angle;
			endAngle     = endAngle > pi2 ? endAngle - pi2: endAngle;
			endAngle     = endAngle < 0   ? pi2 - endAngle: endAngle;			

			const cur   = (
				tag('path', calcTitle(row, i), {
					...(row.pathAttrs || {}),
					d:( 
						"M "+(radius)+","+(radius)+" "+
						"L "+(Math.cos(startAngle)*radius+radius)+","+
							 (Math.sin(startAngle)*radius+radius)+" "+
						"A "+(radius)+","+(radius)+
							 " 0 "+(angle<Math.PI?"0":"1")+" 1 "+
							 (Math.cos(endAngle)*radius+radius)+","+
							 (Math.sin(endAngle)*radius+radius)+" "+
						"Z"
					),
					fill    : calcColor(row, i),
				})
			);
			startAngle = endAngle
			return cur;
		}).join('')
	}
	
	return `
		<svg class="pie-svg ${classes||''}" style="width:${width}" viewBox="0 0 ${2*radius} ${2*radius}" xmlns="http://www.w3.org/2000/svg">
			${content}
		</svg>`;
}


