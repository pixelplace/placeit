var TRON={
    CONTRACT_ADDRESS:"TUhKFyGMi28AXgtgRK9arucSC2mz3XDFgx",
    contractInstance:"",
    ListCommunity:[],
    init:async function(){
        var contractInfo=await window.tronWeb.trx.getContract(this.CONTRACT_ADDRESS);
        this.contractInstance=window.tronWeb.contract(contractInfo.abi.entrys,contractInfo.contract_address);
        //this.hookPixelPurchased();
    },
    getCandy:async function(id){
        console.log(await this.contractInstance.getCandy(123).call());
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

let newCommunitiesSeleted="";
async function upDateGameStatus(){
    TRON.ListCommunity=(await TRON.contractInstance.viewTotalCommunities().call()).map(e=>hex2a(e.slice(2)));
    
    let communitiesTable="";
    let communitiesSeleted="";
    let userComRank = 0;
    let communityArray = [];
    //TRON.ListCommunity.forEach((item,key)=>{
        for (const item of TRON.ListCommunity) {
        let totalUsers = await TRON.contractInstance.viewTotalUsersInCommunity(StringToBytes(item)).call();
        let totalPixels = await TRON.contractInstance.viewTotalPixelsInCommunity(StringToBytes(item)).call();
        totalPixels = tronWeb.toDecimal(totalPixels);
        communityArray.push({"item" : item,"totalUsers" : totalUsers,"totalPixels":totalPixels});
        // communitiesTable+= "<tr><td scope='row'>" +
        //   i +
        //   `</td><td><i class='fa fa-trophy' style='color: red;'></i>&nbsp;` +
        //   item +
        //   `</td><td>` +
        //    totalUsers +            
        //   '</td><td>' + 
        //   totalPixels +
        //   '</td></tr>';
        //   communitiesSeleted+=`<option value="${item}">${item}</option>`
        //   i++;
    }
    communityArray = helper.arr.multisort(communityArray, ['totalPixels'], ['DESC']);
    let i =1;
    let trophy = '';
    let userCommunity = hex2a(await TRON.usertoCommunity());
    let topCommunity = '';
    for (const item of communityArray){
        if(i==1){
            topCommunity = item.item;
            trophy = "</td><td><i class='fa fa-trophy' style='color: red;'></i>&nbsp;"
        }else{
            trophy = "</td><td>&nbsp;"
        }
        if(userCommunity==item.item){
            userComRank = i;
        }
        communitiesTable+= "<tr><td scope='row'>" +
          i +
          trophy +
          item.item +
          `</td><td>` +
           item.totalUsers +            
          '</td><td>' + 
          item.totalPixels +
          '</td></tr>';
          communitiesSeleted+=`<option value="${item.item}">${item.item}</option>`
          i++;
    }
    $('#topCommunity').val(topCommunity);
    $('#userCommunityRank').val(userComRank);
    $('#communities').html(communitiesTable);
    let currentSelect="";
    if(newCommunitiesSeleted!=communitiesSeleted){
        $('#listCommunity').html(communitiesSeleted);
        newCommunitiesSeleted=communitiesSeleted;
        console.log(await TRON.checkWinnerCommunity());
    }
    //$('#currentCommunity').val(await hex2a(TRON.usertoCommunity()));
    $('#CommunityPixels').val(await TRON.viewTotalPixelsInCommunity());
    $('#UserPixels').val(await TRON.userTotalPixels());
    $('#CommunityUsers').val(await TRON.viewTotalUsersInCommunity());
    $('#UserTokens').html(await TRON.balanceOf());
    $('#pool_value_dividend').val(await TRON.communityPoolVolume());
    let pool_value = await TRON.communityPoolVolume()
    $('#pool_value').html(pool_value);
    let dividend = (await TRON.communityPoolVolume()*70)/100;
    let share = (((await TRON.userTotalPixels())/(await TRON.viewTotalPixelsInCommunity()))*100).toFixed(2);
    $('#pool_dividend').val(dividend);
    $('#UserShare').val(share);
    $('#possible_income').val(parseInt((dividend * share)/100));
}
setInterval(upDateGameStatus,1000)
