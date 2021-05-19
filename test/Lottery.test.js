const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require("../compile");

let accounts, lottery;
beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery", () => {
  it("address", () => {
    assert.ok(lottery.options.address);
  });

  it("entry of three players", async () => {
    await lottery.methods
      .entry()
      .send({ from: accounts[1], value: web3.utils.toWei("1", "ether") });
    await lottery.methods
      .entry()
      .send({ from: accounts[2], value: web3.utils.toWei("1", "ether") });
    await lottery.methods
      .entry()
      .send({ from: accounts[3], value: web3.utils.toWei("1", "ether") });
    console.log(
      "Balance in contract",
      await lottery.methods.etherPool().call()
    );
    console.log("players", await lottery.methods.getPlayers().call());
  });

  it("small amount", async () => {
    try {
      await lottery.methods.entry().send({
        from: accounts[3],
        value: web3.utils.toWei("0.01", "ether"),
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("pick winner", async () => {
    let initBal1 = await web3.eth.getBalance(accounts[1]);
    let initBal2 = await web3.eth.getBalance(accounts[2]);
    let initBal3 = await web3.eth.getBalance(accounts[3]);
    try {
      await lottery.methods.pickWinner().send({ from: accounts[0] });
      assert(false);
    } catch (err) {
      assert(err);
    }
    //? to check balance of the accounts of players after picking winner

    let finalBal1 = await web3.eth.getBalance(accounts[1]);
    let finalBal2 = await web3.eth.getBalance(accounts[2]);
    let finalBal3 = await web3.eth.getBalance(accounts[3]);

    let diff1 = initBal1 - finalBal1;
    let diff2 = initBal2 - finalBal2;
    let diff3 = initBal3 - finalBal3;
    console.log(diff1, diff2, diff3);
    // assert(diff1 > web3.utils.toWei("1.8", "ether"));
    // assert(diff2 > web3.utils.toWei("1.8", "ether"));
    // assert(diff3 > web3.utils.toWei("1.8", "ether"));

    assert.equal(await lottery.methods.etherPool().call(), "0");
    assert.equal(await lottery.methods.getPlayers().call(), 0);
  });
});
