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
    'hello'/*'encode e:\\file.txt e:\\encode.txt'*/,
    'bye'
];

client.on('data',(data) => {
    console.log(data);
    if (data==='DEC'){
        client.destroy();
    }
    else if(data.indexOf('Incorrect') !== -1){
        client.end('Bye');
    }
    else{
        if (enumerator >= 3) {
            client.end('Request is over');
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