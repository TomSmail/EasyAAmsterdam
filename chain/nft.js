import xrpl from "xrpl";

// async function do_transaction(settings_tx, wallet, client, name) {
//   const cst_prepared = await client.autofill({
//     ...settings_tx,
//     Account: wallet.address,
//   });
//   const cst_signed = wallet.sign(cst_prepared);
//   console.log(`Sending ${name} transaction...`);
//   const cst_result = await client.submitAndWait(cst_signed.tx_blob);
//   if (cst_result.result.meta.TransactionResult == "tesSUCCESS") {
//     console.log(
//       `Transaction succeeded: https://testnet.xrpl.org/transactions/${cst_signed.hash}`
//     );
//   } else {
//     throw `Error sending transaction: ${cst_result.toString()}`;
//   }
//

async function mintShameToken(
  client,
  nft_issuer_wallet,
  target_wallet,
  carbon
) {
  const transactionBlob = {
    TransactionType: "NFTokenMint",
    Account: nft_issuer_wallet.classicAddress,
    URI: xrpl.convertStringToHex(JSON.stringify({ carbon: carbon })),
    Flags: 0,
    NFTokenTaxon: 0,
  };
  const tx = await client.submitAndWait(transactionBlob, {
    wallet: nft_issuer_wallet,
  });
  const nft_token_id = tx.result.meta.nftoken_id;
  const nft_transfer_json = {
    TransactionType: "NFTokenCreateOffer",
    Account: nft_issuer_wallet.classicAddress,
    NFTokenID: nft_token_id,
    Amount: "0",
    Flags: 1,
  };
  const tx2 = await client.submitAndWait(nft_transfer_json, {
    wallet: nft_issuer_wallet,
  });
  const sale_offer_id = tx2.result.meta.offer_id;
  const offer_accept_json = {
    TransactionType: "NFTokenAcceptOffer",
    Account: target_wallet.classicAddress,
    NFTokenSellOffer: sale_offer_id,
  };
  await client.submitAndWait(offer_accept_json, {
    wallet: target_wallet,
  });
}

async function countTotalBadCarbon(client, target_wallet) {
  const nfts_response = await client.request({
    method: "account_nfts",
    account: target_wallet.classicAddress,
  });
  const nfts = nfts_response.result.account_nfts;
  const ans = nfts
    .map((nftoken) => JSON.parse(xrpl.convertHexToString(nftoken.URI)).carbon)
    .reduce((partialSum, a) => partialSum + a, 0);
  return ans;
}

async function main() {
  // Define the network client

  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  const nft_wallet = xrpl.Wallet.fromSeed("sEdVXHxYogo9F3oB2nURQ1rnN86PjKp");
  const user_wallet = xrpl.Wallet.fromSeed("sEdTCbAQLZ2c1AB7tSswWDpUASEEsA7");

  await countTotalBadCarbon(client, user_wallet);
  //   await mintShameToken(client, nft_wallet, user_wallet, 10);
  await client.disconnect();
}

main();
