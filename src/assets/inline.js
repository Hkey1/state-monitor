$(function () {
  setTimeout(()=>{
	  $('.pie-segment').each((i,el)=>{
		$(el).mouseenter(()=>{
			//console.log("$(this).attr('data-pie-segment-id')", $(this).attr('data-pie-segment-id'));
			//console.log('alt', $(event.target).attr('class'));
			//console.log('el', $(el).attr('class'));
			
			$('.pie-segment-'+$(el).attr('data-pie-segment-id'))
				.addClass('pie-segment-hover')
		})
		.mouseleave(()=>{
			$('.pie-segment-'+$(el).attr('data-pie-segment-id'))
				.removeClass('pie-segment-hover')
		})
	 });
  }, 100);
});