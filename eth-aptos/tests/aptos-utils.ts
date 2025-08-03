import { AptosAccount, AptosClient, TxnBuilderTypes, BCS } from "aptos";
import * as dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const NODE = "https://fullnode.testnet.aptoslabs.com/v1";
// console.log(process.env.PRIVKEY, process.env.ADDR);
// Use the SAME private key you used with the CLI
const account = AptosAccount.fromAptosAccountObject({
  privateKeyHex: process.env.PRIVKEY as string,
  address: process.env.ADDR as string,
});

console.log(account.address())

const client = new AptosClient(NODE);

async function signAndSubmit(payload: any) {
  console.log("payload", payload);
  const rawTxn = await client.generateTransaction(account.address(), payload);
  console.log("rawTxn", rawTxn.payload);
  const bcsTxn = AptosClient.generateBCSTransaction(account, rawTxn);
  const pending = await client.submitSignedBCSTransaction(bcsTxn);
  console.log("pending", pending);
  await client.waitForTransaction(pending.hash);
  console.log("✓ Txn:", `https://explorer.aptoslabs.com/txn/${pending.hash}?network=testnet`);
}

// Function to build and submit the transaction
async function createOrderTransaction() {
  try {
    // Build the entry function payload
    const payload = {
      function: "0xf3b387e70e971c321d06adc2c8a6721d010b2827508deae8cf1a24fa74817ac9::fusion_swap::create_order",
      type_arguments: [], // Assuming no type args; adjust if needed based on module
      arguments: [
        "0x1", // address
        "0x1", // address
        "1000000", // u128 (as string to avoid BigInt issues)
        "950000", // u128
        "1000000", // u128
        "1735689600", // u64
        "100", // u64
        "50", // u64
        "25", // u64
        "25", // u64
        "1000000", // u128
        "950000", // u128
        "1735689600", // u64
        "3600", // u64
        "100000", // u128
        "1000000", // u128
        // hex (vector<u8>): Convert hex string to Uint8Array
        Uint8Array.from(Buffer.from("fcf730b6d95236ecd3c9fc2d92d7b6b2bb061514961aec041d6c7a7192f592e4", "hex")),
        "300", // u64
        "600", // u64
        "900" // u64
      ]
    };

    await signAndSubmit(payload);

  } catch (error) {
    console.error("Error building/submitting transaction:", error);
  }
}

// Run the function
createOrderTransaction();
