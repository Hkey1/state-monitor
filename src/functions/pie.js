const assert        = require('node:assert');
const mustBe        = require('hkey-must-be');
const tag           = require('./tag.js');
const calcPieColors = require('./calcPieColors.js');

module.exports = function pie(data, opts={}){
	const colors           = calcPieColors(data);
	let {width, hideNot, classes} = opts;
	
	width ||= '100%';
	width  = isNaN(1*width) ? width : width+'px'; 
	
	const radius = 100;
	const sum  = data.reduce((s,row)=>s+1*row.count, 0);
	const pi2  = 2 * Math.PI;
	
	let startAngle=0.75*pi2;	
	return (''
	+`<svg class="pie-svg ${classes||''}" style="width:${width}" viewBox="0 0 ${2*radius} ${2*radius}" xmlns="http://www.w3.org/2000/svg">`
		+data.map((row,i)=>{
			const color  = (hideNot!==undefined && hideNot!==i && hideNot!==row.name) ? '#D3D3D3': row.color || colors[i]; 
			const angle  = row.count * pi2 / sum;
			let endAngle = startAngle + angle;
			endAngle     = endAngle > pi2 ? endAngle - pi2: endAngle;
			endAngle     = endAngle < 0   ? pi2 - endAngle: endAngle;			

			const cur   = (
				tag('path', `<title>${row.name||i}: ${row.count} ≈ ${Math.round(row.count*100/sum)}%</title>`, {
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
					fill    : color,
				})
			);
			startAngle = endAngle
			return cur;
		}).join('')
	+'</svg>');
}


