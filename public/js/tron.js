var TRON={
    CONTRACT_ADDRESS:"TUhKFyGMi28AXgtgRK9arucSC2mz3XDFgx",
    contractInstance:"",
    ListCommunity:[],
    init:async function(){
        var contractInfo=await window.tronWeb.trx.getContract(this.CONTRACT_ADDRESS);
        this.contractInstance=window.tronWeb.contract(contractInfo.abi.entrys,contractInfo.contract_address);
        //this.hookPixelPurchased();
    },
    maxNumbers:async function(){
        //console.log(await this.contractInstance.maxNumbers().call()).toNumber();
        var ned = hex2a((await this.contractInstance.maxNumbers().call()).substr(2));
        console.log(ned);
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

