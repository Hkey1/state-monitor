const assert        = require('node:assert');
const mustBe        = require('hkey-must-be');
const tag           = require('./tag.js');
const calcPieColors = require('./calcPieColors.js');

module.exports = function calcPieHTML(data, opts={}){
	const colors           = calcPieColors(data);
	let {width, hideNot, classes} = opts;
	
	width ||= '100%';
	width  = isNaN(1*width) ? width : width+'px'; 
	
	const radius = 100;
	
	
	let sum = 0;
	data.forEach(row=>sum+=1*row.count);
	
	let startAngle=0, endAngle;
	
	const res = [];
	return (''
	+`<svg class="pie-svg ${classes||''}" style="width:${width}" viewBox="0 0 ${2*radius} ${2*radius}" xmlns="http://www.w3.org/2000/svg">`
		+data.map((row,i)=>{
			const color   = (hideNot!==undefined && hideNot!==i && hideNot!==row.name) ? '#D3D3D3': row.color || colors[i]; 
			const angle = row.count * 2 * Math.PI / sum;
			endAngle    = startAngle + angle;
			const cur   = (''
				+tag('line', {
					...(row.lineAttrs || {}),
					x1: radius, 
					y1: radius, 
					x2: (Math.cos(endAngle)*radius+radius), 
					y2: (Math.sin(endAngle)*radius+radius), 
					stroke: color,
					'class' : row.lineClass, 
				})
				+tag('path', `<title>${row.name||i}: ${row.count} ≈ ${Math.round(row.count*100/sum)}%</title>`, {
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


