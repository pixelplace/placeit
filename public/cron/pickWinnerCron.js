#!/usr/bin/env nodejs
var dotenv = require('dotenv');
var CronJob = require('cron').CronJob;
var fs = require('fs');
const TronWeb = require('tronweb');

dotenv.load();
fs.createReadStream('.sample-env').pipe(fs.createWriteStream('.env'));

//following cron will run every 24 hours GMT Time
new CronJob('0 0 0 * * *', function() {

//creating async function which does all the process
async function pickWinnerCalling() {

const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider('https://api.shasta.trongrid.io');
const solidityNode = new HttpProvider('https://api.shasta.trongrid.io');
const eventServer = 'https://api.shasta.trongrid.io/';
const privateKey = process.env.PRIVATE_KEY;

const tronWeb = new TronWeb(
    fullNode,
    solidityNode,
    eventServer,
    privateKey
);

let contractInstance = await tronWeb.contract().at("TK4uzqUmoatZDP7QsDLuwdrHwzoFxEPAEw");

let result  = await contractInstance.pickWinner().send();

//writing log entry in the file for future reference
let logEntry = new Date() +" -- " + result + "\n";
fs.appendFileSync("execution-log.txt", logEntry);

console.log(logEntry); 
};

//calling pickWinnerCalling function
pickWinnerCalling();

}, null, true, 'Europe/London');
