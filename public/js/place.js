$(document).ready(() => {
	
	  $("#btn_leave").click(async function() {
		  var result = await TRON.total();
		  console.log(result);

});
	
});
