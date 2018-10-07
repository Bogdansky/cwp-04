const net = require('net');
const fs = require('fs');
const port = 8124;

const client = new net.Socket();

let questions = {};
let answers = "";

client.setEncoding('utf8');

client.connect(port, function() {
    console.log('Connected');
    questions = JSON.parse(fs.readFileSync('qa.json'));
    questions.sort( (a,b) => {
        return Math.random() - 0.5;
    });
    client.write('QA');
});

let enumerator = 0;
client.on('data',(data) => {
    if (data==='DEC'){
        client.destroy();
    }
    else{
        let message = "";
        console.log(enumerator);
        if(enumerator===questions.length){
            console.log(...answers);
            client.destroy();
        }
        else {
            if (enumerator>0){
                message = data===questions[enumerator-1].answer ? "Right\n" : "Wrong\n";
                answers+=questions[enumerator-1].question+": "+message;
            }
            client.write(questions[enumerator].question);
            enumerator++;
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