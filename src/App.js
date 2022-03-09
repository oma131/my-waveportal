import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json"

const App = () => {
  document.body.style = 'background: black;';

  const [currentAccount, setCurrentAccount] = useState("");
  
  const [allWaves, setAllWaves] = useState([]);

  const [tweetValue, setTweetValue] = React.useState("")
  const contractAddress = "0x86Dd3813A3B7B90c135f2e4c5c2cD2B249bA2674";

  const contractABI = abi.abi;

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          }
        });
        
        setAllWaves(wavesCleaned);
      } else {
        console.log("No ethereum object!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message
        },
      ]);
    };

    if(window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer =  provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }
    return() => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave)
      }
    };
  }, );
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);

      } else {
        console.log("No authorized account found")
      }
      
      getAllWaves();
    } catch (error) {
      console.log(error);
    }
    
  }

  
  const connectWallet = async () => {
    
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {

    try {
      const { ethereum} = window;
      
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waveTxn = await wavePortalContract.wave(tweetValue, { gasLimit:300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined --", waveTxn.hash);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrive total wave count...", count.toNumber() );
      } else {
        console.log("Ethereum object does not exist!");
      }
    } catch (error) {
      console.log(error);
    }

  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, );

  return (
    <div className="mainContainer">
        <nav>
          <div className="header">
          <span role="img" aria-label="heart">💗</span>
          O<span role="img" aria-label="unicorn">🦄</span>
          M<span role="img" aria-label="white-flower">🌼</span>
          A<span role="img" aria-label="pink-flower">🌸</span>
          </div>

          {!currentAccount && (
            <button className="clickButton" onClick={connectWallet}>
              <span role="img" aria-label="point-left">👉🏽</span>Connect Wallet<span role="img" aria-label="point-right">👈🏽</span>
            </button>
          )}
          {currentAccount && (
            <button className="connectedButton" onClick={connectWallet}>
              Wallet Connected!
            </button>
          )}
        </nav>
      <div className="dataContainer">
        <div className="bio">
          <h1>Hi Friend<span role="img" aria-label="flower">🌺</span></h1>
          I am OMA I'm a Frontend developer, technical writer & Web3 Enthusiast. 
          I spread love and light. Connect your Ethereum wallet and recieve a Rinkeby eth!
        </div>

        {/*
        * If there is no currentAccount render this button
        */}
        
        {currentAccount ? (<textarea name="tweetArea"
          placeholder="type your tweet"
          type="text"
          id="tweet"
          value={tweetValue}
          onChange={e => setTweetValue(e.target.value)} />) : null
        }

        <button className="waveButton" onClick={wave}>
          <span role="img" aria-label="wave">👋🏽</span>Wave at Me
        </button>

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ 
              backgroundColor: "transparent", fontSize: "14px", 
              border: "1px solid #01FFF4", color: "white",  
              borderRadius: "5px", marginTop: "16px", padding: "8px" }}>

              <div role="img">Address: {wave.address}</div>
              <div role="img">Location: {wave.timestamp.toString()}</div>
              <div role="img">Message: {wave.message}</div>
            </div>)
        })}

      </div>
    </div>
  );
}

export default App