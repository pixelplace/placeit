function StringToBytes(string,byteSize=32){
    let inputByte32= new Uint8Array(byteSize)
    inputByte32.set((new TextEncoder()).encode(string))
    return inputByte32;
}