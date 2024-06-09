import {
  Client,
  Wallet,
  AccountSetAsfFlags,
  AccountSetTfFlags,
  convertStringToHex,
  convertHexToString,
} from "xrpl";
import sdk from "@crossmarkio/sdk";

const CURRENCY_CODE = "CCC";

const client = new Client("wss://s.altnet.rippletest.net:51233");
await client.connect();

const cold_wallet = Wallet.fromSeed("sEdVXHxYogo9F3oB2nURQ1rnN86PjKp");
const hot_wallet = Wallet.fromSeed("sEd7j1xLuF79RgEoDmsRapeLnFufYQ8");
const nft_issuer_wallet = hot_wallet;

export async function make_user_trust_us(user_wallet) {
  await createTrustLineUser(user_wallet);
}

export async function user_trusts_us(user_wallet_address) {
  const normal_response = await client.request({
    method: "account_lines",
    account: user_wallet_address,
  });
  console.log(
    normal_response.result.lines.filter(
      (trust) => trust.currency == CURRENCY_CODE
    )
  );
  console.log(
    normal_response.result.lines.filter(
      (trust) => trust.currency == CURRENCY_CODE
    ).length == 2
  );
  return (
    normal_response.result.lines.filter(
      (trust) => trust.currency == CURRENCY_CODE
    ).length == 2
  );
}

export async function do_transaction(settings_tx, wallet, name) {
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
    console.log(cst_result.result);
    throw `Error sending transaction: ${cst_result.toString()}`;
  }
}

export async function do_transaction_user(settings_tx, user_wallet_address) {
  const cst_prepared = {
    ...settings_tx,
    Account: user_wallet_address,
    // LastLedgerSequence: 
  };
  //  client.autofill(

  console.log("oooonooo")
  console.log(cst_prepared)
  let resp = await sdk.async.signAndSubmitAndWait(cst_prepared);
  console.log("RESP")
  console.log(resp)
  if (resp) {
      console.log("DENIED");
  }
}

export async function mint_for_user(user_wallet_address, amount) {
  await do_transaction(
    {
      TransactionType: "Payment",
      Amount: {
        currency: CURRENCY_CODE,
        value: amount.toString(),
        issuer: cold_wallet.address,
      },
      Destination: hot_wallet.address,
    },
    cold_wallet,
    "step1"
  );

  await do_transaction(
    {
      TransactionType: "Payment",
      Amount: {
        currency: CURRENCY_CODE,
        value: amount.toString(),
        issuer: cold_wallet.address,
      },
      Destination: user_wallet_address,
    },
    hot_wallet,
    "step2"
  );
}

export async function createTrustLineUser(target_wallet) {
  console.log("HELLO")
  await do_transaction_user(
    {
      TransactionType: "TrustSet",
      LimitAmount: {
        currency: CURRENCY_CODE,
        issuer: cold_wallet.address,
        value: "10000000000", // Large limit, arbitrarily chosen
      },
    },
    target_wallet
  );
  console.log("goodbye")
}

export async function countTotalGoodCarbon(user_wallet_address) {
  console.log(user_wallet_address);
  const normal_response = await client.request({
    method: "account_lines",
    account: user_wallet_address,
  });
  return normal_response.result.lines
    .filter((trust) => trust.currency == CURRENCY_CODE)
    .map((trust) => parseInt(trust.balance))
    .reduce((partialSum, a) => partialSum + a, 0);
}

export async function mintShameToken(target_wallet_address, carbon) {
  const transactionBlob = {
    TransactionType: "NFTokenMint",
    Account: nft_issuer_wallet.classicAddress,
    URI: convertStringToHex(JSON.stringify({ carbon: carbon })),
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
    Account: target_wallet_address,
    NFTokenSellOffer: sale_offer_id,
  };
  await do_transaction_user(offer_accept_json, target_wallet_address);
}

export async function countTotalBadCarbon(user_wallet_address) {
  const nfts_response = await client.request({
    method: "account_nfts",
    account: user_wallet_address,
  });
  const nfts = nfts_response.result.account_nfts;
  const ans = nfts
    .map((nftoken) => parseInt(JSON.parse(convertHexToString(nftoken.URI)).carbon))
    .reduce((partialSum, a) => partialSum + a, 0);
  return ans;
}
