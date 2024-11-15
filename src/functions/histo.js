const assert        = require('node:assert');
const mustBe        = require('hkey-must-be');
const tag           = require('./tag.js');
const calcPieColors = require('./calcPieColors.js');

module.exports = function histo(data, opts={}){
	let {width, hideNot, classes, ratio} = opts;
		
	width ||= '100%';
	width   = isNaN(1*width) ? width : width+'px'; 
	ratio ||= 2
	const h = 100;
	const w = 100*ratio;
	
	const n    = data.length;
	const step = w/n;
	const max  = Math.max(...data.map(row=>row.count));
	const sum  = data.reduce((s,row)=>s+1*row.count, 0);
	const h0   = 3; 
	
	let start  = 0; 

	return `
		<svg class="histo-svg ${classes||''}" style="width:${width}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">		
		${data.map((row,i)=>{
			const x     = start;
			const ch    = h0 + (h-h0)*row.count/max;
			const color = (hideNot!==undefined && hideNot!==i && hideNot!==row.name) ? '#D3D3D3': (row.color || 'black'); 			
			start += step;
			return tag('rect', `<title>${row.name||i}: ${row.count} ≈ ${Math.round(row.count*100/sum)}%</title>`, {
				...(row.pathAttrs || {}),			
				x,
				y       : h-ch,	
				width   : 0.9*step,
				height  : ch,
				fill    : color,		
			}) 
		}).join('')}</svg>
	`;
};

