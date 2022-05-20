fs = require('fs');
logPath = '';
storedDate = undefined;
start();

function start() {
    storedDate = new Date();
    logPath = __dirname + `./../logs/${storedDate.getFullYear()}_${format(storedDate.getMonth()+1)}_${format(storedDate.getDate())}.log`;
    fs.appendFile(logPath, '\n#########################################################################################################\n\n', function (err) {
        if (err) {
            console.log(err);
        }
    })
}

function log(message) {
    
    console.log(message);
    
    d = new Date();
    if (d.getDate() != storedDate.getDate()) {
        start();
        
    }
    
    fs.appendFile(logPath, dateString() + message + '\n', function (err) {
        if (err) {
            console.log(err);
        }
    })
}

module.exports = {
    start,
    log,
}

function dateString() {
    date = new Date();
    return `[${format(date.getHours())}.${format(date.getMinutes())}.${format(date.getSeconds())}] `
}

function format(string) {
    string = '0' + string;
    return string.slice(-2);
}