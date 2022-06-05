import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const getElement = (id) => document.getElementById(id);

// getting contract and waalet/provider plus signer/deployer
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner(); //gets the connected account
const fundMeContract = new ethers.Contract(contractAddress, abi, signer);
// end

const connectButton = getElement("connectButton");
const fundButton = getElement("fundButton");
const ethBalanceBtn = getElement("ethBalanceBtn");
const ethBalanceCont = getElement("ethBalanceCont");
const wihdrawFunds = getElement("wihdrawFunds");

const connect = async () => {
  console.log(ethAmount);
  if (typeof window.ethereum === "undefined") {
    console.log("No metamask");
    document.getElementById("connectButton").innerHTML =
      "Please Install Metamask";
  } else {
    console.log("metamask detected. Keep going");

    await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    console.log("Connected");

    document.getElementById("connectButton").innerHTML = "Wallet Connected";
  }
};

const fund = async () => {
  const ethAmount = getElement("fundAmount").value;
  if (typeof window.ethereum !== "undefined") {
    console.log(`funding the contract with ${ethAmount}`);

    try {
      const transactionRes = await fundMeContract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });

      await listenForTransactionMined(transactionRes, provider);

      await getBalance();

      console.log("Done mining");
    } catch (error) {
      console.log(error);
    }
  }
};

const listenForTransactionMined = function (transactionRes, provider) {
  console.log(`Mining transaction at ${transactionRes.hash}`);

  return new Promise((resolve, reject) => {
    provider.once(transactionRes.hash, (transactionReceipt) => {
      console.log(
        `Mining at ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
};

const withdraw = async () => {
  if (typeof window.ethereum !== "undefined") {
    console.log(`Withdrawing funds`);

    try {
      const transactionRes = await fundMeContract.withdraw();

      await listenForTransactionMined(transactionRes, provider);

      await getBalance();

      console.log("Done withdrawing");
    } catch (error) {
      console.log(error);
    }
  }
};

const getBalance = async () => {
  const balanceInWei = (await provider.getBalance(contractAddress)).toString();
  ethBalanceCont.innerHTML = ethers.utils.formatEther(balanceInWei) + " ETH";
};

connectButton.onclick = connect;
fundButton.onclick = fund;
ethBalanceBtn.onclick = getBalance;
wihdrawFunds.onclick = withdraw;
