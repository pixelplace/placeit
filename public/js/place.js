$(document).ready(() => {
	
	  $("#btn_leave").click(async function() {
		  var result = await TRON.getCandy();
		  console.log(result);

});
	
});
