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

async function mint_for_user(
  cold_wallet,
  hot_wallet,
  user_wallet,
  client,
  name,
  amount
) {
  const sourceDest = [
    [cold_wallet, hot_wallet],
    [hot_wallet, user_wallet],
  ];
  for (const [i, [source, dest]] of sourceDest.entries()) {
    await do_transaction(
      {
        TransactionType: "Payment",
        Amount: {
          currency: CURRENCY_CODE,
          value: amount.toString(),
          issuer: cold_wallet.address,
        },
        Destination: dest.address,
      },
      source,
      client,
      name + i.toString()
    );
  }
}

async function createTrustLine(target_wallet, cold_wallet, client) {
  await do_transaction(
    {
      TransactionType: "TrustSet",
      LimitAmount: {
        currency: CURRENCY_CODE,
        issuer: cold_wallet.address,
        value: "10000000000", // Large limit, arbitrarily chosen
      },
    },
    target_wallet,
    client,
    "trust lines"
  );
}

// Wrap code in an async function so we can use await
async function main() {
  // Define the network client

  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  const cold_wallet = xrpl.Wallet.fromSeed("sEdVXHxYogo9F3oB2nURQ1rnN86PjKp");
  const hot_wallet = xrpl.Wallet.fromSeed("sEd7j1xLuF79RgEoDmsRapeLnFufYQ8");
  const user_wallet = xrpl.Wallet.fromSeed("sEdTCbAQLZ2c1AB7tSswWDpUASEEsA7");

  console.log(cold_wallet.address);
  console.log(hot_wallet.address);

  await do_transaction(
    {
      TransactionType: "AccountSet",
      TransferRate: 0,
      TickSize: 5,
      Domain: "636C696D617465636F696E3132332E636F6D", // "example.com"
      SetFlag: xrpl.AccountSetAsfFlags.asfDefaultRipple,
      // Using tf flags, we can enable more flags in one transaction
      Flags: xrpl.AccountSetTfFlags.tfDisallowXRP,
    },
    cold_wallet,
    client,
    "cold wallet setup"
  );

  await do_transaction(
    {
      TransactionType: "AccountSet",
      Domain: "6578616D706C652E636F6D", // "example.com"
      // enable Require Auth so we can't use trust lines that users
      // make to the hot address, even by accident:
      SetFlag: xrpl.AccountSetAsfFlags.asfRequireAuth,
      Flags: xrpl.AccountSetTfFlags.tfDisallowXRP,
    },
    hot_wallet,
    client,
    "hot wallet setup"
  );


  await createTrustLine(hot_wallet, cold_wallet, client);
  await createTrustLine(user_wallet, hot_wallet, client);

  await mint_for_user(
    cold_wallet,
    hot_wallet,
    user_wallet,
    client,
    "first transaction",
    67
  );

  // Disconnect when done (If you omit this, Node.js won't end the process)
  await client.disconnect();
}

main();
