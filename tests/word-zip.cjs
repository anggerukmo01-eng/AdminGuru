const zlib=require('node:zlib');
module.exports=function unzip(buffer){
  let end=buffer.length-22;while(end>=0&&buffer.readUInt32LE(end)!==0x06054b50)end--;if(end<0)throw Error('Not a ZIP DOCX');
  const count=buffer.readUInt16LE(end+10);let cursor=buffer.readUInt32LE(end+16);const entries={};
  for(let i=0;i<count;i++){
    if(buffer.readUInt32LE(cursor)!==0x02014b50)throw Error('Invalid ZIP directory');
    const method=buffer.readUInt16LE(cursor+10),size=buffer.readUInt32LE(cursor+20),rawSize=buffer.readUInt32LE(cursor+24),nameLength=buffer.readUInt16LE(cursor+28),extraLength=buffer.readUInt16LE(cursor+30),commentLength=buffer.readUInt16LE(cursor+32),offset=buffer.readUInt32LE(cursor+42),name=buffer.subarray(cursor+46,cursor+46+nameLength).toString();
    const start=offset+30+buffer.readUInt16LE(offset+26)+buffer.readUInt16LE(offset+28),raw=buffer.subarray(start,start+size),data=method===8?zlib.inflateRawSync(raw):raw;
    if(data.length!==rawSize)throw Error('Invalid uncompressed size');entries[name]=data;cursor+=46+nameLength+extraLength+commentLength;
  }return entries;
};
