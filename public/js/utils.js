function StringToBytes(string,byteSize=32){
    let inputByte32= new Uint8Array(byteSize)
    inputByte32.set((new TextEncoder()).encode(string))
    return inputByte32;
}
function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

// function convertCoord(hexString) {
//     let x= parseInt(hexString.substr(2, 4), 16);
//     let y=parseInt(hexString.substr(4, 2), 16);
    
//      return {x,y};
// }

function convertCoord(hexString) {
    let x = parseInt(hexString.substr(2, 2)+hexString.substr(0,2), 16);
    let y =parseInt(hexString.substr(6,2)+hexString.substr(4,2), 16);
    return {x,y};
}

function convertColor(hexString) {
    let r= parseInt(hexString.substr(0, 2), 16);
    let g=parseInt(hexString.substr(4, 2), 16);
    let b= parseInt(hexString.substr(8, 2), 16);
    return {r,g,b};
}
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function getColor(color) {
    if (color[0] == '#') {
      if (color.length == 7) {
        return parseInt(color.substr(1, 6), 16)
      } else if (color.length == 4) {
        color = color[1] + color[1] + color[2] + color[2] + color[3] + color[3]
        val = parseInt(color, 16)
        return val
      }
    } else if (color.startsWith('rgb')) {
      rgbVal = color.substr(4).split(',')
      return (
        (parseInt(rgbVal[0]) << 16) +
        (parseInt(rgbVal[1]) << 8) +
        parseInt(rgbVal[2])
      )
    }
  }
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
//function convertHex4BytesToCoord(inputString){

//}
if( typeof helper == 'undefined' ) {
  var helper = { } ;
}

function hasWhiteSpace(s) {
  return /\s/g.test(s);
}


helper.arr = {

  multisort: function(arr, columns, order_by) {
        if(typeof columns == 'undefined') {
            columns = []
            for(x=0;x<arr[0].length;x++) {
                columns.push(x);
            }
        }

        if(typeof order_by == 'undefined') {
            order_by = []
            for(x=0;x<arr[0].length;x++) {
                order_by.push('ASC');
            }
        }

        function multisort_recursive(a,b,columns,order_by,index) {  
            var direction = order_by[index] == 'DESC' ? 1 : 0;

            var is_numeric = !isNaN(a[columns[index]]-b[columns[index]]);

            var x = is_numeric ? a[columns[index]] : a[columns[index]].toLowerCase();
            var y = is_numeric ? b[columns[index]] : b[columns[index]].toLowerCase();

            if(!is_numeric) {
                x = helper.string.to_ascii(a[columns[index]].toLowerCase(),-1),
                y = helper.string.to_ascii(b[columns[index]].toLowerCase(),-1);
            }

            if(x < y) {
                    return direction == 0 ? -1 : 1;
            }

            if(x == y)  {
                return columns.length-1 > index ? multisort_recursive(a,b,columns,order_by,index+1) : 0;
            }

            return direction == 0 ? 1 : -1;
        }

        return arr.sort(function (a,b) {
            return multisort_recursive(a,b,columns,order_by,0);
        });
    }
}
