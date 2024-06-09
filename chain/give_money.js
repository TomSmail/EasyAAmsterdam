import xrpl from "xrpl";
const CURRENCY_CODE = "CCC";

async function do_transaction(settings_tx, wallet, client, name) {
  const cst_prepared = await client.autofill({
    ...settings_tx,
    Account: wallet.address,
  });
  const cst_signed = wallet.sign(cst_prepared);
  console.log(`Sending ${name} transaction...`);
  const cst_result = await client.submitAndWait(cst_signed.tx_blob);
  if (cst_result.result.meta.TransactionResult == "tesSUCCESS") {
    console.log(
      `Transaction succeeded: https://testnet.xrpl.org/transactions/${cst_signed.hash}`
    );
  } else {
    throw `Error sending transaction: ${cst_result.toString()}`;
  }
}

// Wrap code in an async function so we can use await
async function main() {
  // Define the network client

  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  const cold_wallet = xrpl.Wallet.fromSeed("sEdTCbAQLZ2c1AB7tSswWDpUASEEsA7");


  await do_transaction(
    {
      TransactionType: "Payment",
      Account: cold_wallet.address,
      Amount: "50000000",
      Destination: "ransdawCWvNbESVkjnt32vvLXk1GaKKU7G"
    },cold_wallet,
    client,
    "try to give me money"
  );

  // Disconnect when done (If you omit this, Node.js won't end the process)
  await client.disconnect();
}

main();
