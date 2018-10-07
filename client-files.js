const fs = require('fs');
const net = require('net');
//const buf = require('buffer').Buffer;
const port = 8124;
const over = 'File transfer is over!';

let directories = process.argv[2] !== null ? process.argv.slice(2) : null;
directories = valid(directories);

console.log(directories);
const client = new net.Socket();
let i = 0;

client.connect(port, () => {    
    client.write(directories ? 'FILES':'NON');
    client.setEncoding('utf8');
});
let files = {};
client.on('data', (data) => {
    console.log(data);
    if (data === 'DEC') client.destroy();
    else{
        if ( !directories || directories.length === 0){
            client.end(over);
        }
        if (i == 0){  
            files = removeDirs(directories[0], fs.readdirSync(directories[0]));
        }
        if (i < files.length){
            fs.readFile(`${directories[0]}\\${files[i]}`, (err, info) => {
                if (err) throw err;
                console.log(info);   
                client.write(`${files[i]}^|^${info}`);
                console.log(files[i++]);
            });
        }
        else{
            directories.shift();
            i = 0;
        }
    }
});

client.on('end', () => {
    client.destroy();
});

client.on('error', (error) => {
    console.log(error.message);
    client.destroy();
});

function valid(directories){
    let valid = directories.every((directory) => {
        return fs.existsSync(directory);
    });
    return valid === true ? directories : null;
}

function removeDirs(directory, files) {
    if (!files) return null;
    for (file of files){
        if (fs.statSync(`${directory}\\${file}`).isDirectory())
        files.splice(files.indexOf(file), 1);
    }
    return files;
}