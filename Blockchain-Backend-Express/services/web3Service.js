import fs from "fs";
import path from "path";
import Web3 from "web3";
import solc from "solc";
import chalk from "chalk";

import {
  CONTRACT_ADDRESS_TRANSACTION,
  CONTRACT_ADDRESS_TRANSACTION_DETAIL,
  CONTRACT_ADDRESS_WALLET_TRANSACTION,
  CONTRACT_ADDRESS_TOKEN,
  PRIVATE_KEY,
  API_URL,
  WALLET_ADDRESS,
} from "../config/smartContractConfig.js";
import {
  deployTransactionContract,
  deployTransactionDetailContract,
  deployTokenContract,
  deployTransactionWalletContract,
} from "../controllers/web3Controller.js";
import { consoleForDevelop } from "../config/app.js";

const web3 = new Web3(API_URL);

// code for deploy
const __dirname = path.resolve();
const buildPath = path.resolve(__dirname, "smart_contracts", "build");

export const compileContracts = async () => {
  try {
    const __dirname = path.resolve();
    const buildPath = path.resolve(__dirname, "smart_contracts", "build");

    // Ensure build folder exists
    if (!fs.existsSync(buildPath)) {
      fs.mkdirSync(buildPath);
    }

    // List of contracts to compile
    const contracts = [
      {
        name: "TransactionContract",
        filename: "TransactionContract.sol",
        abiFileName: "TransactionContractABI.json",
        bytecodeFileName: "TransactionContractBytecode.txt",
        deployFunction: deployTransactionContract,
      },
      {
        name: "TransactionDetailContract",
        filename: "TransactionDetailContract.sol",
        abiFileName: "TransactionDetailContractABI.json",
        bytecodeFileName: "TransactionDetailContractBytecode.txt",
        deployFunction: deployTransactionDetailContract,
      },
      {
        name: "TokenContract",
        filename: "TokenContract.sol",
        abiFileName: "TokenContractABI.json",
        bytecodeFileName: "TokenContractBytecode.txt",
        deployFunction: deployTokenContract,
      },
      {
        name: "TransactionWalletContract",
        filename: "TransactionWalletContract.sol",
        abiFileName: "TransactionWalletContractABI.json",
        bytecodeFileName: "TransactionWalletContractBytecode.txt",
        deployFunction: deployTransactionWalletContract,
      },
      // Add more contracts as needed
    ];

    // Compile each contract
    for (const contract of contracts) {
      const abiPath = path.resolve(buildPath, contract.abiFileName);
      const bytecodePath = path.resolve(buildPath, contract.bytecodeFileName);

      if (!fs.existsSync(abiPath) || !fs.existsSync(bytecodePath)) {
        const contractPath = path.resolve(
          __dirname,
          "smart_contracts",
          contract.filename
        );
        const source = fs.readFileSync(contractPath, "utf8");

        const input = {
          language: "Solidity",
          sources: {
            [contract.filename]: {
              content: source,
            },
          },
          settings: {
            outputSelection: {
              "*": {
                "*": ["abi", "evm.bytecode"],
              },
            },
          },
        };

        const output = JSON.parse(solc.compile(JSON.stringify(input)));
        
        // Debugging: Print the entire output object
        console.log(`Output for ${contract.filename}:`, JSON.stringify(output, null, 2));

        if (output.errors) {
          output.errors.forEach((err) => {
            console.error(err.formattedMessage);
          });
          throw new Error(`Compilation failed for ${contract.name}`);
        }

        const compiledContract = output.contracts[contract.filename][contract.name];
        
        // Check if compiledContract is undefined
        if (!compiledContract) {
          throw new Error(`Compiled contract for ${contract.name} not found. Check the contract name and filename.`);
        }

        // Write ABI to file
        fs.writeFileSync(
          abiPath,
          JSON.stringify(compiledContract.abi, null, 2)
        );

        // Write bytecode to file
        fs.writeFileSync(bytecodePath, compiledContract.evm.bytecode.object);

        console.log(
          chalk.green(
            `ABI and bytecode for ${contract.name} successfully saved in the build folder inside smart_contracts.`
          )
        );

        console.log(
          chalk.green(`Deploying ${contract.name} smart contract...`)
        );
        try {
          const response = await contract.deployFunction();
          // console.log(`response deploy smart contract`, response);
          console.log(
            chalk.green(
              `${contract.name} deployed successfully at address: ${response}`
            )
          );
        } catch (deployError) {
          console.error(`Error deploying ${contract.name}:`, deployError);
        }
      } else {
        console.log(
          `${contract.name} ABI and bytecode files already exist. Skipping compilation.`
        );
      }
    }
  } catch (error) {
    console.error("Error compiling contracts:", error);
  }
};

const getBytecode = (contractName) => {
  const bytecodePath = path.resolve(
    __dirname,
    "smart_contracts",
    "build",
    `${contractName}Bytecode.txt`
  );
  // console.log("Bytecode path:", bytecodePath);
  const bytecode = "0x" + fs.readFileSync(bytecodePath, "utf8").trim();
  return bytecode;
};

export const deploySmartContract = async (contractName) => {
  // consoleForDevelop(
  //   `Deploy Smart Contract Process [Web3 Service] - ${contractName}`
  // );
  try {
    const bytecode = getBytecode(contractName);

    const gas = await web3.eth.estimateGas({ data: bytecode });
    const gasPrice = await web3.eth.getGasPrice();

    const newContractInstance = await web3.eth.sendTransaction({
      data: bytecode,
      gas: gas,
      gasPrice: gasPrice,
      from: WALLET_ADDRESS,
    });

    return newContractInstance.contractAddress;
  } catch (error) {
    console.error(`Error deploying smart contract ${contractName}:`, error);
    throw error;
  }
};
// end code for deploy

const validateUseFor = (useFor) => {
  let abiPath;
  if (useFor === "wallet") {
    abiPath = path.resolve(buildPath, "TransactionWalletContractABI.json");
    return [JSON.parse(fs.readFileSync(abiPath)), CONTRACT_ADDRESS_WALLET_TRANSACTION];
    }
  if (useFor === "transaction") {
    abiPath = path.resolve(buildPath, "TransactionContractABI.json");
    // console.log(JSON.parse(fs.readFileSync(abiPath)));
    return [JSON.parse(fs.readFileSync(abiPath)), CONTRACT_ADDRESS_TRANSACTION];
  }
  if (useFor === "transactionDetail") {
    abiPath = path.resolve(buildPath, "TransactionDetailContractABI.json");
    return [
      JSON.parse(fs.readFileSync(abiPath)),
      CONTRACT_ADDRESS_TRANSACTION_DETAIL,
    ];
  }
  if (useFor === "token") {
    abiPath = path.resolve(buildPath, "TokenContractABI.json");
    return [JSON.parse(fs.readFileSync(abiPath)), CONTRACT_ADDRESS_TOKEN];
  }
  throw new Error("Invalid useFor value");
};

// export const createContractInstance = async (useFor) => {
//   consoleForDevelop("Create Contract Instance Process [Web3 Service]");
//   const [abiUsed, contractAddressUsed] = validateUseFor(useFor);
//   const contract = new web3.eth.Contract(abiUsed, contractAddressUsed);
//   return contract;
// };

export const createContractInstance = async (useFor) => {
  consoleForDevelop("Create Contract Instance Process [Web3 Service]");
  const [abiUsed, contractAddressUsed] = validateUseFor(useFor);
  console.log("Creating contract instance with ABI:", abiUsed, "and address:", contractAddressUsed);
  const contract = new web3.eth.Contract(abiUsed, contractAddressUsed);
  return contract;
};

// export const sendRawTx = async (arrayParams, method, useFor) => {
//   consoleForDevelop("Send Raw Transaction Process [SendRawTx Web3 Service]");
//   try {
//     const [abiUsed, contractAddressUsed] = validateUseFor(useFor);
//     const nonce = await web3.eth.getTransactionCount(WALLET_ADDRESS);
//     let gasPrice = await web3.eth.getGasPrice();
//     // if (useFor === "transactionDetail") {
//     //   gasPrice = gasPrice.toString() * 2;
//     // }
//     // if (useFor === "token") {
//     //   gasPrice = gasPrice.toString() * 3;
//     // }
//     const gasLimit = 10000000;
//     const contract = new web3.eth.Contract(abiUsed, contractAddressUsed);
//     const data = contract.methods[method](...arrayParams).encodeABI();

//     // Set transactionPollingTimeout here (example: 60000 ms = 1 minute)
//     // web3.eth.transactionPollingTimeout = 60000;

//     const rawTx = {
//       nonce: web3.utils.toHex(nonce),
//       gasPrice: web3.utils.toHex(gasPrice),
//       gasLimit: web3.utils.toHex(gasLimit),
//       to: contractAddressUsed,
//       value: "0x00",
//       data: data,
//     };

//     const signedTx = await web3.eth.accounts.signTransaction(
//       rawTx,
//       PRIVATE_KEY
//     );

//     const sentTx = await web3.eth.sendSignedTransaction(
//       signedTx.rawTransaction
//     );
//     return sentTx;
//   } catch (error) {
//     console.error("Error sending raw transaction:", error);
//     throw error;
//   }
// };

export const sendRawTx = async (arrayParams, method, useFor) => {
  consoleForDevelop("Send Raw Transaction Process [SendRawTx Web3 Service]");
  try {
    
    const [abiUsed, contractAddressUsed] = validateUseFor(useFor);
    const nonce = await web3.eth.getTransactionCount(WALLET_ADDRESS);
    let gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 10000000;
    const contract = new web3.eth.Contract(abiUsed, contractAddressUsed);

    // Debugging: Print available methods
    console.log("Available methods:", contract.methods);

    const data = contract.methods[method](...arrayParams).encodeABI();

    const rawTx = {
      nonce: web3.utils.toHex(nonce),
      gasPrice: web3.utils.toHex(gasPrice),
      gasLimit: web3.utils.toHex(gasLimit),
      to: contractAddressUsed,
      value: "0x00",
      data: data,
    };

    const signedTx = await web3.eth.accounts.signTransaction(
      rawTx,
      PRIVATE_KEY
    );

    const sentTx = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    return sentTx;
  } catch (error) {
    console.error("Error sending raw transaction:", error);
    throw error;
  }
};

// get all transaction with event TransactionAdded
export const getAllTransactionInSmartContract = async (useFor, event) => {
  const contract = await createContractInstance(useFor);
  const events = await contract.getPastEvents(event, {
    fromBlock: 0,
    toBlock: "latest",
  });

  const response = events.map((event) => {
    const returnValues = event.returnValues;
    return {
      transaction: {
        code: returnValues.transactionCode,
        campaignId: returnValues.campaignId.toString(),
        fromToUserId: returnValues.fromToUserId.toString(),
        orderType: returnValues.orderType,
        paymentStatus: returnValues.paymentStatus,
        status: returnValues.status,
        quantity: returnValues.quantity.toString(),
        totalPrice: returnValues.totalPrice.toString(),
      },
      blockNumber: event.blockNumber.toString(),
      transactionHash: event.transactionHash,
      address: event.address,
      blockHash: event.blockHash,
    };
  });

  return response;
};
