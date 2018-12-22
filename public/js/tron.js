var TRON={
    CONTRACT_ADDRESS:"TTUwQrSG4V8GK75AyrBJknCcdGCULBCaU2",
    contractInstance:"",
    init:async function(){
        var contractInfo=await window.tronWeb.trx.getContract(this.CONTRACT_ADDRESS);
        this.contractInstance=window.tronWeb.contract(contractInfo.abi.entrys,contractInfo.contract_address);
    },
    createNewCommunicty:async function(name){
        await this.contractInstance.createNewCommunicty(StringToBytes(name)).send({callValue:1000000000});
    },

}
var timeOutID=setTimeout(tryInstall,100)
function tryInstall(){
    if(window.tronWeb&&window.tronWeb && window.tronWeb.ready){
        clearTimeout(timeOutID);
        TRON.init();
    }
    else{
        timeOutID=setTimeout(tryInstall,100)
    }
}
async function upDateGameStatus(){
    let listCommunity=(await TRON.contractInstance.viewTotalCommunities().call()).map(e=>tronWeb.toUtf8(e));
    let communitiesTable="";

    listCommunity.forEach((item,key)=>{
        communitiesTable+= "<tr><td scope='row'>" +
          key +
          `</td><td><i class='fa fa-trophy' style='color: red;'></i>&nbsp;` +
          item +
          '</td><td>0</td><td>0</td></tr>'
    })
    $('#communities').html(communitiesTable);

}
setInterval(upDateGameStatus,100)

