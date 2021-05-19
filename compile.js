const path = require("path");
const fs = require("fs");
const solc = require("solc");
const LottPath = path.resolve(__dirname, "contracts", "Lottery.sol");
const source = fs.readFileSync(LottPath, "utf8");
module.exports = solc.compile(source, 1).contracts[":Lottery"];
