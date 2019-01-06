var TRON={
    //CONTRACT_ADDRESS:"TTBn7ERdRz8WwyAqVLXKCP48UF55Sd9LFg",

    CONTRACT_ADDRESS:"TS4nUaioCcTAcPSfNiDyMizgfsKG3VhwZk",
    //CONTRACT_ADDRESS:"TVrtszSXqrbV7TKfa9bFKekucHsPgAb7jF",
    //CONTRACT_ADDRESS:"TQpVtBmX3kpaWudFuupVsrxXEwJfTh66gp",
    contractInstance:"",
    ListCommunity:[],
    init:async function(){
        var contractInfo=await window.tronWeb.trx.getContract(this.CONTRACT_ADDRESS);
        this.contractInstance=window.tronWeb.contract(contractInfo.abi.entrys,contractInfo.contract_address);
        //this.hookPixelPurchased();
    },
    createNewCommunicty:async function(name){
        return await this.contractInstance.createNewCommunicty(StringToBytes(name)).send({callValue:1000000000});
    },
    buyTokens:async function(value){
       //console.log(await this.contractInstance.buyTokens().send({callValue:100000000}));
       //let buyPrice = await this.contractInstance.buyPrice().call();
       //console.log(buyPrice._hex);
        let buyPrice = 100000
        let callValue = parseInt(value)/10
        callValue = callValue * 1000000
        return await this.contractInstance.buyTokens().send({callValue:callValue});
    },    
    buyPixels:async function(pixelsData){
        let buyPositions=[];
        let buyColors=[];
        pixelsData.forEach(item=>{
            buyPositions.push(convertXY2Hex(item.x,item.y));
            buyColors.push(getColor(item.color));
        })
        //let buyPrice=10000000*buyColors.length;
        let buyPrice=10000000*buyColors.length;
        console.log(buyPositions);console.log(buyColors);
        return await this.contractInstance.buyPixels(buyPositions,buyColors).send({callValue:buyPrice});
    },
    joinCommunity:async function(name){
       return await this.contractInstance.joinCommunity(StringToBytes(name)).send({callValue:100000000});
    },
    leaveCommunity:async function(){
       return await this.contractInstance.leaveCommunity().send({callValue:1000000});
    },
    usertoCommunity:async function(){
        //console.log(await this.contractInstance.usertoCommunity(tronWeb.defaultAddress.hex).call());
        //return hex2a((await this.contractInstance.usertoCommunity(tronWeb.defaultAddress.hex).call()).slice(2));
        return (await this.contractInstance.usertoCommunity(tronWeb.defaultAddress.hex).call()).slice(2);
    },
    userTotalPixels:async function(){
        return (await this.contractInstance.userTotalPixels(tronWeb.defaultAddress.hex).call());
    },    
    viewTotalPixelsInCommunity:async function(){
        //console.log(await this.contractInstance.viewTotalPixelsInCommunity(StringToBytes($('#currentCommunity').val())).call());
        return (await this.contractInstance.viewTotalPixelsInCommunity(StringToBytes($('#currentCommunity').val())).call());
    },
    viewTotalUsersInCommunity:async function(){
        return (await this.contractInstance.viewTotalUsersInCommunity(StringToBytes($('#currentCommunity').val())).call());
    },
    balanceOf:async function(){
        return (await this.contractInstance.balanceOf(tronWeb.defaultAddress.hex).call()/100000000);
    },
    communityPoolVolume:async function(){
        return (await this.contractInstance.communityPoolVolume().call()).toString()/1000000;
    },
    checkWinnerCommunity:async function(){
        return hex2a((await this.contractInstance.checkWinnerCommunity().call()).substr(2));
    },
    viewCommunityExist:async function(community){
        return (await this.contractInstance.viewCommunityExist(StringToBytes(community)).call());
    },
    viewPixelOwner:async function(pixelXY){
        return (await this.contractInstance.viewPixelOwner(pixelXY).call());
    },
    viewALLPixelDimensions:async function(){
        return (await this.contractInstance.viewALLPixelDimensions().call());
    },
    viewALLPixelColors:async function(){
        return (await this.contractInstance.viewALLPixelColors().call());
    },
    hookPixelPurchased:async function(){
        await this.contractInstance.PixelPurchased().watch(
            (err, result) => {
              if (err) throw console.error("Failed to bind event listener:", err);
              let coordition = convertCoord(result.pixelPositionArray);
              let color=convertColor(result.colorArray);
              console.log(coordition);
              console.log(color);

            })
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
