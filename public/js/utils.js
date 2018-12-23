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