import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import sdk from "@crossmarkio/sdk";
import { countTotalGoodCarbon, countTotalBadCarbon, user_trusts_us, make_user_trust_us, mintShameToken, mint_for_user } from "./xrp";
import { Application } from '@splinetool/runtime';

function get(name) {
  if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
    return decodeURIComponent(name[1]);
}

type CarbonObject = { carbon: number, description: string, offset: boolean };

function App() {
  const [userWalletAddress, setUserWalletAddress] = useState("");
  const [signTransactionTxblob, setSignTransactionTxblob] = useState("");
  const [submitTransactionResponse, setSubmitTransactionResponse] =
    useState("");
  const canvas = useRef<HTMLCanvasElement>(null)

  const [yourCO2, setYourCO2] = useState(0);
  const [offset, setOffset] = useState(0);
  // const [done, setDone] = useState([{ description: "Flight LHR -> AMS", carbon: 20 }]);
  // const [todo, setTodo] = useState([{ description: "Flight AMS -> LHR", carbon: 20 }, { description: "Groceries", carbon: 5 }]);
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [transactions, setTransactions] = useState<CarbonObject[]>([]);
  const done = transactions.filter((x: CarbonObject) => x.offset);
  const todo = transactions.filter((x: CarbonObject) => !x.offset);
  const [processedAlready, setProcessedAlready] = useState(false);
  function getTotal() {
    let ans = 0;
    selected.forEach((x) => ans += transactions[x].carbon);
    return ans;
  }

  const signIn = async () => {
    // Sign in logic here
    let address = (await sdk.async.signInAndWait()).response.data.address;
    return setUserWalletAddress(address);
  };

  const processTransaction = async (carbon: number) => {
    await mintShameToken(userWalletAddress, carbon);
    setAddLoading(false);
  }

  const processCarbonCredits = async (trans) => {
    console.log("CARBON CREDITS")
    const carbon = getTotal(trans);
    await mint_for_user(userWalletAddress, carbon);
    setLoading(false);
    let mtrans = [...transactions];
    trans.forEach((i) => {
      mtrans[i].offset = true;
    })
    setTransactions(mtrans);
    console.log("Done loading");
  }

  const [flashCO2, setFlashCO2] = useState(false);
  const [flashOffset, setFlashOffset] = useState(false);

  useEffect(() => {
    setFlashCO2(true);
    const timer = setTimeout(() => setFlashCO2(false), 500);
    return () => clearTimeout(timer);
  }, [yourCO2]);

  useEffect(() => {
    setFlashOffset(true);
    const timer = setTimeout(() => setFlashOffset(false), 500);
    return () => clearTimeout(timer);
  }, [offset]);

  useEffect(() => {
    console.log("TESTING")
    console.log(canvas.current)
    if (canvas.current) {
      console.log("CANVASSSSSS")
      const spline = new Application(canvas.current);
      console.log("HEEEEEEEEEEEEEEEEEE")

      // Load the Spline scene and then set the variable based on the URL parameter
      spline.load('https://prod.spline.design/ZG6rk6K21nQwSlSD/scene.splinecode')
        .then(() => {
          console.log("HELLLLO")
          spline.setVariable('number', 400);
        });
    }
  }, [canvas]);

  useEffect(() => {
    const trans = localStorage.getItem("transactions")
    setTransactions(trans ? JSON.parse(trans) : [])
  }, []);
  useEffect(() => localStorage.setItem("transactions", JSON.stringify(transactions)), [transactions]);
  useEffect(() => { signIn(); }, []);
  useEffect(() => {
    (async () => {
      if (userWalletAddress != "") {
        if (!(await user_trusts_us(userWalletAddress))) {
          await make_user_trust_us(userWalletAddress);
          console.log("after")
          console.log(await user_trusts_us(userWalletAddress));
        } else {
          console.log("User trusts us!")
        }
        const tgc = await countTotalGoodCarbon(userWalletAddress);
        const tbc = await countTotalBadCarbon(userWalletAddress);
        setOffset(tgc);
        setYourCO2(tbc);
        const carbon = get("carbon");
        const description = get("description");
        if (carbon && description && !processedAlready) {
          // console.log(processedAlready)
          setProcessedAlready(true)
          setAddLoading(true);
          setTransactions(trans => trans.concat([{ carbon: parseInt(carbon), description: description, offset: false }]))
          await mintShameToken(userWalletAddress, carbon);
          setAddLoading(false);
        }
      }
    })()
  }, [userWalletAddress, done])

  if (userWalletAddress === "") {
    return (<div className="font-mono flex flex-col items-center justify-center min-h-screen bg-[#F6F4F0] dark:bg-gray-900">
    <div className="flex flex-col w-11/12 sm:w-3/5 items-center bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Welcome</h1>
      <p className="text-2xl text-gray-600 dark:text-gray-300 mb-6">You need to log in</p>
      <button className="mt-4 py-2 px-4 bg-[#597766] text-white rounded-lg hover:bg-[#475d50] focus:ring-2 focus:ring-[#CC9F00] focus:outline-none dark:bg-[#475d50] dark:hover:bg-[#3b4e41]">
        Log In
      </button>
    </div>
  </div>
);
} else {
return (
  <div className="font-mono flex flex-col items-center justify-center min-h-screen bg-[#F6F4F0] dark:bg-gray-900">
    <div className="flex flex-col w-11/12 sm:w-3/5 items-center bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Offset</h1>
      <div className="text-center mb-6">
      <h2 className={`text-2xl text-gray-600 dark:text-gray-300 transition-colors duration-500 ${flashCO2 ? 'bg-green-200' : ''}`}>
              Total CO2: {yourCO2}kg CO2 equiv.
            </h2>
            <h2 className={`text-2xl text-gray-600 dark:text-gray-300 transition-colors duration-500 ${flashOffset ? 'bg-green-200' : ''}`}>
              Total Offset: {offset}kg CO2 equiv.
            </h2>
      </div>
      {addLoading && (
        <div className="text-gray-600 dark:text-gray-300">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-dashed rounded-full animate-spin border-[#CC9F00] dark:border-[#CC9F00] inline"></div>
            <p className="ml-2"> Generating emissions token ({get("carbon")} kg) for {get("description")}...</p>
          </div>
        </div>
      )}
      <div className="h-1/4 my-10 w-full bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <canvas id="canvas3d" ref={canvas}></canvas>
      </div>
      <div className="w-full text-center">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div className="col-span-full">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6 underline">Recent purchases</h1>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md">
            <h2 className="text-2xl text-gray-700 dark:text-gray-300 mb-4">Done</h2>
            {done.map((x, _) => (
              <div className="pb-3" key={x.description}>
                <p className="inline-block pr-3 rounded-md p-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200">{x.description}</p>
              </div>
            ))}
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md">
            <h2 className="text-2xl text-gray-700 dark:text-gray-300 mb-4">Todo</h2>
            {todo.map((x, i) => {
              let style;
              if (selected.includes(i)) {
                style = "inline-block pr-3 rounded-md p-1 bg-[#CC9F00] dark:bg-[#CC9F00] text-gray-700 dark:text-gray-200";
              } else {
                style = "inline-block pr-3 rounded-md p-1 bg-gray-200 dark:bg-gray-500 text-gray-700 dark:text-gray-200";
              }
              return (
                <div className="pb-3" key={x.description} onClick={() => {
                  let nselected = [...selected];
                  if (selected.includes(i)) {
                    nselected = nselected.filter((x) => x != i);
                  } else {
                    nselected.push(i);
                  }
                  setSelected(nselected);
                }}>
                  <p className={style}>{`${x.description} (${x.carbon}kg)`}</p>
                </div>
              );
            })}
            {!loading ? (
              <button onClick={() => { setLoading(true); processCarbonCredits(selected); }} className="mt-4 py-2 px-4 bg-[#597766] text-white rounded-lg hover:bg-[#475d50] focus:ring-2 focus:ring-[#CC9F00] focus:outline-none dark:bg-[#475d50] dark:hover:bg-[#3b4e41]">
                Buy All
              </button>
            ) : (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-4 border-dashed rounded-full animate-spin border-[#CC9F00] dark:border-[#CC9F00]"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
    
  }
}

/*
    <div>
      <img
        alt="Crossmark logo"
        className="logo"
        src="./titleblock.png"
        style={{ position: "absolute", top: 0, left: 0, height: 50 }}
      />
      <div className="wrapper font-mono">
        <h1>EarthPay</h1>
      </div>

      <main className="main font-mono">
        <div>
          <div className="content">
            <button onClick={signIn} className="rounded-button">
              Sign In and Wait
            </button>
            <div style={{ paddingLeft: "10rem", paddingTop: "5rem" }}></div>
            <textarea
              style={{ width: "75%", height: "10rem", color: "black" }}
              className="rounded-md"
              id="response1"
              readOnly
              value={`Address: ${signInResponse}`}
            ></textarea>
          </div>
          <div className="divider"></div>
          <div className="content">
            <button onClick={getUserSession} className="rounded-button">
              Get Session
            </button>
            <div style={{ paddingLeft: "11rem", paddingTop: "5rem" }}></div>
            <textarea
              style={{ width: "75%", height: "10rem", color: "black" }}
              className="rounded-md"

              id="response2"
              readOnly
              value={`Current User ID: ${sessionUserResponse}`}
            ></textarea>
          </div>
          <div className="divider"></div>
          <div className="content">
            <button onClick={signTransaction} className="rounded-button">
              Sign Transaction
            </button>
            <div style={{ paddingLeft: "10rem", paddingTop: "5rem" }}></div>
            <textarea
              style={{ width: "75%", height: "10rem", color: "black" }}
              className="rounded-md"

              id="response3"
              value={`TxBlob: ${signTransactionTxblob}`}
            ></textarea>
          </div>
          <div className="divider"></div>
          <div className="content">
            <button onClick={submitTransaction} className="rounded-button">
              Submit Transaction
            </button>
            <div style={{ paddingLeft: "10rem", paddingTop: "5rem" }}></div>
            <textarea
              style={{ width: "75%", height: "10rem", color: "black" }}
              className="rounded-md"

              id="response4"
              value={`Hash: ${submitTransactionResponse}`}
            ></textarea>
          </div>
          <div className="divider"></div>
        </div>
      </main>
    </div>


*/
export default App;
