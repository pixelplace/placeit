$(document).ready(() => {
	
	  $("#btn_leave").click(async function() {
		  var result = await TRON.maxNumbers();
		  console.log(result);

});
	
});
