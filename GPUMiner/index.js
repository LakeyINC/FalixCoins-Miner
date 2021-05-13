const args = process.argv.slice(2);
const shelljs = require('shelljs');
const axios = require('axios');
const fs = require('fs');
const util = require("util");
const exec = util.promisify(require('shelljs').exec);
const falixBTCaddress = '363aRNYAsVG39kaE5oMVZq87d6pKHhBKGj'
let os = process.platform;
const userID = args[0]
let gpuLimit = args[1];
if (!gpuLimit) return console.error("Please specify GPU limit")
if (!userID) return console.error('Please enter a user ID.')
if (isNaN(gpuLimit)) {
    console.log('Invalid GPU limit');
    process.exit();
};
if (gpuLimit > 100) {
    console.log('GPU limit must be between 1-100%.');
    process.exit();
};

async function rewardUser() {
    const res = await axios.get('https://api2.nicehash.com/main/api/v2/mining/external/363aRNYAsVG39kaE5oMVZq87d6pKHhBKGj/rigs/activeWorkers?size=5000')
    const results = await res.data.workers.find(worker => {
        return worker.rigName == userID.slice(0, 15) && worker.algorithm.enumName === 'DAGGERHASHIMOTO'
    })
    const hashrate = results.speedAccepted
    let coins;
    if (hashrate <= 0.5) {
        console.log('Hashrate is lower than 0.5 MH/s even after 15 minutes, exiting...')
        process.exit()
    }
    if (hashrate > 0.5 && hashrate <= 1) {
        coins = 0.1
    }
    if (hashrate > 1 && hashrate <= 5) {
        coins = 1
    }
    if (hashrate > 5 && hashrate <= 10) {
        coins = 1.5
    }
    if (hashrate > 10 && hashrate <= 20) {
        coins = 2
    }
    if (hashrate > 20 && hashrate <= 30) {
        coins = 2.5
    }
    if (hashrate > 30 && hashrate <= 50) {
        coins = 3
    }
    if (hashrate > 50 && hashrate <= 100) {
        coins = 3.5
    }
    await axios.post('No API URL for you', {
        userID: userID,
        coins: coins,
    }, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "AuthKeyIsNotMeantForYou"
        }
    })
    console.log(`Just earnt ${coins} FalixCoins.`)
}
if (os === 'win32') {
    if (!fs.existsSync('./PhoenixMiner.exe')) {
        shelljs.echo('PhoenixMiner not found, Downloading PhoenixMiner')
        shelljs.exec('curl.exe --output PhoenixMiner.exe --url https://cdn.discordapp.com/attachments/837563712091979827/839870754954018847/PhoenixMiner.exe')
    }
    shelljs.echo('Starting Miner/PhoenixMiner')
    exec(`PhoenixMiner.exe -pool daggerhashimoto.eu.nicehash.com:3353 -pool2 daggerhashimoto.usa.nicehash.com:3353 -wal 33gEVX69oJrn53saXrzkVms72sLqZw8QC4.001 -proto 4 -gpow ${gpuLimit}`)
    setInterval(rewardUser, 900000)
}
if (os === 'linux') {
    if (!fs.existsSync('./PhoenixMiner')) {
        shelljs.echo('PhoenixMiner not found, Downloading PhoenixMiner')
        shelljs.exec('curl --output PhoenixMiner --url https://cdn.discordapp.com/attachments/611166184804450304/839871022961786941/PhoenixMiner')
        shelljs.exec('chmod u+x ./PhoenixMiner')
    }
    shelljs.echo('Starting Miner/PhoenixMiner')
    shelljs.exec('chmod u+x ./PhoenixMiner')
    exec(`./PhoenixMiner -pool daggerhashimoto.eu.nicehash.com:3353 -pool2 daggerhashimoto.usa.nicehash.com:3353 -wal ${falixBTCaddress}.${userID} -proto 4 -gpow ${gpuLimit}`)
    setInterval(rewardUser, 900000)
}
if (os === 'darwin') return console.log("MacOS support coming soon")
 
