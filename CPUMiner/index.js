const args = process.argv.slice(2);
const shelljs = require('shelljs');
const axios = require('axios');
const fs = require('fs');
const util = require("util");
const exec = util.promisify(require('shelljs').exec);
const falixBTCaddress = '363aRNYAsVG39kaE5oMVZq87d6pKHhBKGj'
let os = process.platform;
const userID = args[0]
let cpuThreads = args[1];
if (!cpuThreads) return console.error("Please specify amount of CPU threads.")
if (!userID) return console.error('Please enter a user ID.')
if (isNaN(cpuThreads)) {
    console.log('Invalid limit');
    process.exit();
};
if (cpuThreads > 32) {
    console.log('CPU threads must be between 1 and 32.');
    process.exit();
};

async function rewardUser() {
    const res = await axios.get('https://api2.nicehash.com/main/api/v2/mining/external/363aRNYAsVG39kaE5oMVZq87d6pKHhBKGj/rigs/activeWorkers?size=5000')
    const results = await res.data.workers.find(worker => {
        return worker.rigName == userID.slice(0, 15) && worker.algorithm.enumName === 'RANDOMXMONERO'
    })
    const hashrate = results.speedAccepted
    let coins;
    if (hashrate <= 0.01) {
        console.log('Hashrate is lower than 10 H/s even after 15 minutes, exiting...')
        process.exit()
    }
    if (hashrate > 0.02 && hashrate <= 0.09) {
        coins = 0.1
    }
    if (hashrate > 0.1 && hashrate <= 0.9) {
        coins = 1
    }
    if (hashrate > 1 && hashrate <= 1.5) {
        coins = 1.5
    }
    if (hashrate > 1.5 && hashrate <= 2) {
        coins = 2
    }
    if (hashrate > 2 && hashrate <= 3) {
        coins = 2.5
    }
    if (hashrate > 3 && hashrate <= 10) {
        coins = 3
    }
    if (hashrate > 10 && hashrate <= 100) {
        coins = 3.5
    }
    await axios.post('FalixCoins API URL', {
        userID: userID,
        coins: coins,
    }, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "AuthKey"
        }
    })
    console.log(`Just earnt ${coins} FalixCoins.`)
}
if (os === 'win32') {
    if (!fs.existsSync('./xmrig.exe')) {
        shelljs.echo('XMrig not found, Downloading XMrig')
        shelljs.exec('curl.exe --output xmrig.exe --url https://cdn.discordapp.com/attachments/837563712091979827/839870720623378472/xmrig.exe')
    }
    shelljs.echo('Starting Miner/XMrig')
    exec(`xmrig.exe --donate-level=1 -o stratum+tcp://randomxmonero.eu-north.nicehash.com:3380 -u ${falixBTCaddress}.${userID} -k --nicehash -t ${cpuThreads} -a randomx --coin=monero`)
    setInterval(rewardUser, 900000)
}
if (os === 'linux') {
    if (!fs.existsSync('./xmrig')) {
        shelljs.echo('XMrig not found, Downloading XMrig')
        shelljs.exec('curl --output xmrig --url https://cdn.discordapp.com/attachments/837563712091979827/839870742736666665/xmrig')
        shelljs.exec('chmod u+x ./xmrig')
    }
    shelljs.echo('Starting Miner/XMrig')
    shelljs.exec('chmod u+x ./xmrig')
    exec(`./xmrig --donate-level=1 -o stratum+tcp://randomxmonero.eu-north.nicehash.com:3380 -u ${falixBTCaddress}.${userID} -k --nicehash -t ${cpuThreads} -a randomx --coin=monero`)
    setInterval(rewardUser, 900000)
}
if (os === 'darwin') {
    let type = require('os').arch()
    if (!fs.existsSync('./xmrig')) {
        shelljs.echo('XMrig not found, Downloading XMrig')
        if (type == 'arm64') {
            console.log('Found M1 chipset, downloading XMrig for arm64')
            shelljs.exec('curl --output xmrig --url https://cdn.discordapp.com/attachments/837563712091979827/840320045627473970/xmrig')
        } else {
            shelljs.exec('curl --output xmrig --url https://cdn.discordapp.com/attachments/837563712091979827/840320958119411722/xmrig')
        }
        shelljs.exec('chmod u+x ./xmrig')
    }
    shelljs.echo('Starting Miner/XMrig')
    shelljs.exec('chmod u+x ./xmrig')
    exec(`./xmrig --donate-level=1 -o stratum+tcp://randomxmonero.eu-north.nicehash.com:3380 -u ${falixBTCaddress}.${userID} -k --nicehash -t ${cpuThreads} -a randomx --coin=monero`)
    setInterval(rewardUser, 900000)
}
 
