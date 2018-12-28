var TRON={
    CONTRACT_ADDRESS:"TJHfHUk2YxXXiAspfx2kfAPZaAQasSmaZ2",
    contractInstance:"",
    ListCommunity:[],
    init:async function(){
        var contractInfo=await window.tronWeb.trx.getContract(this.CONTRACT_ADDRESS);
        this.contractInstance=window.tronWeb.contract(contractInfo.abi.entrys,contractInfo.contract_address);
    },
    createNewCommunicty:async function(name){
        await this.contractInstance.createNewCommunicty(StringToBytes(name)).send({callValue:1000000000});
    },
    buyTokens:async function(){
        await this.contractInstance.buyTokens().send({callValue:1000000000});
    },     
    transfer:async function(value){
        await this.contractInstance.transfer(tronWeb.defaultAddress.hex,StringToBytes(value)).send({callValue:1000000000});
    },
    buyPixels:async function(pixelsData){
        let buyPositions=[];
        let buyColors=[];
        pixelsData.forEach(item=>{
            let tempPosition=new Uint16Array(2);
            tempPosition.set([item.x,item.y]);
            let position= new Uint8Array(tempPosition.buffer);
            buyPositions.push(position);
            let tempColor=new Uint16Array(3);
            let num=getColor(item.color);
            let b = num & 0xFF;
            let g = (num & 0xFF00) >>> 8;
            let r = (num & 0xFF0000) >>> 16;
            tempColor.set([r,g,b]);
            let color=new Uint8Array(tempColor.buffer);
            buyColors.push(color);
        })
        let buyPrice=10000000*buyColors.length;
        console.log(buyPositions);console.log(buyColors);
        await this.contractInstance.buyPixels(buyPositions,buyColors).send({callValue:buyPrice});
    },
    joinCommunity:async function(name){
        await this.contractInstance.joinCommunity(StringToBytes(name)).send({callValue:100000000});
    },
    leaveCommunity:async function(){
        await this.contractInstance.leaveCommunity().send({callValue:1000000});
    },
    usertoCommunity:async function(){
        //console.log(await this.contractInstance.usertoCommunity(tronWeb.defaultAddress.hex).call());
        return hex2a((await this.contractInstance.usertoCommunity(tronWeb.defaultAddress.hex).call()).slice(2));
    },
    userTotalPixels:async function(){
        return (await this.contractInstance.userTotalPixels(tronWeb.defaultAddress.hex).call());
    },    
    viewTotalPixelsInCommunity:async function(){
        //console.log(await this.contractInstance.viewTotalPixelsInCommunity(StringToBytes(TRON.usertoCommunity())).call());
        return (await this.contractInstance.viewTotalPixelsInCommunity(StringToBytes($('#currentCommunity').val())).call());
    },
    viewTotalUsersInCommunity:async function(){
        return (await this.contractInstance.viewTotalUsersInCommunity(StringToBytes($('#currentCommunity').val())).call());
    },
    balanceOf:async function(){
        return (await this.contractInstance.balanceOf(tronWeb.defaultAddress.hex).call());
    },
    communityPoolVolume:async function(){
        return (await this.contractInstance.communityPoolVolume().call()).toString()/1000000;
    },
    checkWinnerCommunity:async function(){
        return tronWeb.address.fromHex((await this.contractInstance.checkWinnerCommunity().call()).toString());
    }      
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
let newCommunitiesSeleted="";
async function upDateGameStatus(){
    TRON.ListCommunity=(await TRON.contractInstance.viewTotalCommunities().call()).map(e=>hex2a(e.slice(2)));
    let communitiesTable="";
    let communitiesSeleted="";
    TRON.ListCommunity.forEach((item,key)=>{
        communitiesTable+= "<tr><td scope='row'>" +
          key +
          `</td><td><i class='fa fa-trophy' style='color: red;'></i>&nbsp;` +
          item +
          `</td><td>` +
           item +            
          '</td><td>0</td></tr>';
          communitiesSeleted+=`<option value="${item}">${item}</option>`
    })
    $('#communities').html(communitiesTable);
    let currentSelect="";
    if(newCommunitiesSeleted!=communitiesSeleted){
        $('#listCommunity').html(communitiesSeleted);
        newCommunitiesSeleted=communitiesSeleted;
        //console.log(await TRON.checkWinnerCommunity());
    }
    $('#currentCommunity').val(await TRON.usertoCommunity());
    $('#CommunityPixels').val(await TRON.viewTotalPixelsInCommunity());
    $('#UserPixels').val(await TRON.userTotalPixels());
    $('#CommunityUsers').val(await TRON.viewTotalUsersInCommunity());
    $('#UserTokens').val(await TRON.balanceOf());
    $('#pool_value_dividend').html(await TRON.communityPoolVolume());
    $('#pool_value').html(await TRON.communityPoolVolume());
    let dividend = (await TRON.communityPoolVolume()*70)/100;
    let share = ((await TRON.userTotalPixels())/(await TRON.viewTotalPixelsInCommunity()))*100;
    console.log(share);
    $('#pool_dividend').html(dividend);
    $('#UserShare').val(share);
}
setInterval(upDateGameStatus,1000)

