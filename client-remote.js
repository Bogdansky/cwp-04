const net = require('net');
const fs = require('fs');
const port = 8124;

const client = new net.Socket();

client.setEncoding('utf8');

client.connect(port, function() {
    console.log('Connected');
    client.write('REMOTE');
});

let enumerator = 0;
const requests = [
    'copy e:\\file.txt E:\\Учёба\\ПСКП\\fil.txt',
    'encode e:\\file.txt e:\\encode.txt asd123',
    'decode e:\\encode.txt e:\\decode.txt asd123'
];

client.on('data',(data) => {
    console.log(data);
    if (data==='DEC'){
        client.destroy();
    }
    else if(data.indexOf('Incorrect') !== -1){
        client.destroy();
    }
    else{
        if (enumerator >= 3) {
            client.destroy();
        }
        else {
            client.write(requests[enumerator++]);
        }
    }
});

client.on('close',() => {
    console.log('Connection closed');
});

client.on('error', () =>{
    client.destroy();
    console.log("Unexpected error");
});