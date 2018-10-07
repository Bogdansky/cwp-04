const net = require('net');
const fs = require('fs');
const cr = require('crypto');
const port = 8124;

let sid = 0;

const server = net.createServer((client) => {

    client.count = 0;
    client.needs = '';
    client.start = false;
    client.id = Date.now()+ ++sid;
    let streamer = fs.createWriteStream(`logs\\${client.id}.log`);

    console.log(`Client ${client.id} connected`);
    streamer.write(`Client ${client.id} connected`);
    client.setEncoding('utf8');

    client.on('data', (data) => {
        streamer.write(data+"\n");
        if (!client.start){
            if (client.count > process.env.COUNT) {
                client.end('Number of customers exceeded!');
            }
            client.start = true;
            client.count = sid++;
            if (data === 'QA') {
                client.needs = 'questions';
                streamer.write("Server: ACK\n");
                client.write("ACK");
            }
            else if (data === 'FILES'){
                client.needs = 'files';
                streamer.write("Server: ACK\n");
                client.write("ACK");
            }
            else if (data === 'REMOTE'){
                client.needs = 'remote';
                streamer.write("Server: ACK\n");
                client.write("ACK");
            }
            else {
                streamer.write("Server: DEC\n");
                client.write("DEC");
                client.end();
            }
        }
        else{
            if (client.needs === 'questions'){
                let answer = ['Yes','No'][Math.random() < 0.5 ? 0 : 1];
                console.log(data + '\n' + answer);
                client.write(answer);
            }
            else if (client.needs === 'files'){
                let file = data.split('^|^');
                let fd = fs.openSync(`${process.env.DIRECTORY}\\${file[0]}`, 'w');
                fs.write(fd, file[1], (err, written) => {
                    if (err) throw err;
                    fs.close(fd, (err) => {
                        client.write('Taked!');
                    });
                });
            }
            else if (client.needs === 'remote'){
                console.log(data);
                if (data === 'Request is over'){
                    client.end();
                }
                let command = data.split(' ');
                if (command[0].toLowerCase() === 'copy'){
                    client.write(copy(command));
                }
                else if (command[0].toLowerCase() === 'encode'){
                    client.write(encode(command));
                }
                else if (command[0].toLowerCase() === 'decode'){
                    client.write(decode(command));
                }
                else{
                    client.write('Incorrect command');
                }
            }
        }
    });

    client.on('end', () => {
        console.log('Client disconnected');
        streamer.write(`Client ${client.id} disconnected\n`);
        streamer.end();
        client.start = client.needs = client.needs & 0;
        sid--;
    });

    client.on('error', (error) => {
        console.log(error.message);
        streamer.end();
        sid--;
        server.close();
    });
});

server.listen(port, () => {
    console.log(`Server listening on localhost:${port}`);
});


function copy(command){
    if (command.length !== 3){
        return 'Incorrect copy request';
    }
    if (fs.existsSync(command[1])){
        let rs = fs.createReadStream(command[1]);
        let ws = fs.createWriteStream(command[2]);
        rs.pipe(ws);
        return 'Completed!';
    } 
    else{
        return 'Incorrect address of file what being copied';
    }
}   

function encode(command){
    if (command.length !== 4){
        return 'Incorrect encode request';
    }
    if (fs.existsSync(command[1])){
        let rs = fs.createReadStream(command[1]),
        ws = fs.createWriteStream(command[2]),
        crs = cr.createCipher('aes192', command[3]);
        rs.pipe(crs).pipe(ws);
        return 'Completed!';
    } 
    else{
        return 'Incorrect address of file what being encoded';
    }
}

function decode(command){
    if (command.length !== 4){
        return 'Incorrect decode request';
    }
    if (fs.existsSync(command[1])){
        let rs = fs.createReadStream(command[1]),
        ws = fs.createWriteStream(command[2]),
        crs = cr.createDecipher('aes192', command[3]);
        rs.pipe(crs).pipe(ws);
        return 'Completed!';
    } 
    else{
        return 'Incorrect address of file what being decoded';
    }
}