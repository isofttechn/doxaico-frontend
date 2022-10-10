import React, { Component } from "react";
import "./scss/wallet.css";
import send from "../../assets/send.png";
import { connect } from "react-redux";
import { connectWallet } from '../../redux/WalletAction';
import axios from 'axios';
import config from "../../config";
import moment from 'moment'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class Wallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      splittedDate: [],
      totalDoxaBalance: 0,
      doxaVestingBalance: 0,
      toknesToTransfer: 0,
      DoxatokensToTransfer: 0,
      limit: 50,
      skip: 0,
      purchases: []
    };
  }

  async componentDidMount() {
    const { web3Modal } = this.props.wallet;
    if (web3Modal.cachedProvider) {
      await this.props.connectWallet();
    }
    this.getLastBuy()
    this.getInvestorDetails();
    this.getPurchaseHistorydata();
  }
  getPurchaseHistorydata = async()=>{
    const { web3,ethICO,address } = this.props.wallet
    const result = await axios.get(process.env.REACT_APP_ETH_apilink, {
      params: {
        module: 'logs',
        action: 'getLogs',
        address: process.env.REACT_APP_ICOEthContractAddress,
        topic0: process.env.REACT_APP_Buy_topic0,
        apikey: process.env.REACT_APP_ETH_apikey
      }
    });
    const resultArray =  result.data.result;
    const reversedList = resultArray.map((e, i, a)=> a[(a.length -1) -i])
    const transactionHistory = [];
    reversedList.forEach((event) => {
      var data1 = web3.eth.abi.decodeLog(
        [
          { "indexed": false, "internalType": "address", "name": "account", "type": "address" },
          { "indexed": false, "internalType": "uint", "name": "buyamount", "type": "uint" },
          { "indexed": false, "internalType": "uint", "name": "tokenamount", "type": "uint" },
          { "indexed": false, "internalType": "uint", "name": "tokentype", "type": "uint" },
        ], event.data)
        if(data1.account == address){
          const transactionHash = event.transactionHash;
          const buyamount = parseFloat(web3.utils.fromWei(data1.buyamount),'ether').toFixed(2);
          const tokenamount = parseFloat(web3.utils.fromWei(data1.tokenamount),'ether').toFixed(2);
          var yourNumber = parseInt(event.timeStamp, 16)*1000;
          const time = (String (new Date(yourNumber))).slice(4,25);
          var symbol="";
          if(data1.tokentype == 0){
            symbol="USDT"
          }else if(data1.tokentype == 1){
            symbol="DAI"
          }else{
            symbol="ETH"
          }
          const transaction = {transactionHash,buyamount,tokenamount,time,symbol};
          transactionHistory.push(transaction);
        }
        this.setState({ purchases: transactionHistory})
      })
  }

  getInvestorDetails = async () => {
    const { web3, address, ethICO } = this.props.wallet;
    const details = await ethICO.methods.getInvestorDetails(address).call();
    const toknesToTransfer = this.calculateAvailableToWithdraw(web3, details);
    const totalDoxaBalance = parseFloat(web3.utils.fromWei(details.totalBalance, 'ether')).toFixed(3);
    const doxaVestingBalance = parseFloat(web3.utils.fromWei(details.vestingBalance, 'ether')).toFixed(3);
    const DoxatokensToTransfer = parseFloat(web3.utils.fromWei(toknesToTransfer, 'ether')).toFixed(3);

    this.setState({
      ...this.state,
      totalDoxaBalance,
      doxaVestingBalance,
      DoxatokensToTransfer
    });
  }

  getLastBuy() {

    let params = {},
      doxaToken = localStorage.getItem("doxa-token"),
      doxaUser = localStorage.getItem("doxa-user"),
      headers = {};


    doxaToken = JSON.parse(doxaToken);
    doxaUser = JSON.parse(doxaUser);

    headers["x-auth-token"] = doxaToken;

    params = {
      userId: doxaUser._id,
      type: "buy",
      limit: 10,
      skip: 0
    }
    axios.get(config.serviceUrl + "/transaction/lastbuy", {
      params: params,
      headers: headers
    }).then(res => {
    
      if (res.data.response) {
        this.setState({ lastBuy: res.data.response }, () => {
          this.calculatedSplits()
        })
      }

    }).catch(err => {
      if (err.response) {
        toast(err.response.data.message)
      } else {
        toast("Please check your internet connection! ")
      }
    })
  }

  calculatedSplits() {
    const { web3, address, ethICO } = this.props.wallet;

    let lastBuy = this.state.lastBuy,
      reminingUnitsToVest = parseInt(lastBuy.reminingUnitsToVest),
      lastVestedTime = new Date(lastBuy.lastVestedTime),
      tokensPerUnit = parseInt(web3.utils.fromWei(lastBuy.tokensPerUnit, 'ether')),
      splittedDate = [],
      days = 14;

    for (let i = 0; i < reminingUnitsToVest; i++) {
      let nextDate = new Date(lastVestedTime.setDate(lastVestedTime.getDate() + days))
      splittedDate.push({
        tokensPerUnit: tokensPerUnit,
        nextDate: nextDate
      })
    }
    this.setState({ splittedDate })
  }

  withdrawTokens = async () => {
    const { web3, address, ethICO } = this.props.wallet;
    const res = await ethICO.methods.withdrawTokens().send({ from: address });
    const details = await ethICO.methods.getInvestorDetails(address).call();
    const toknesToTransfer = this.calculateAvailableToWithdraw(web3, details);
    const doxaVestingBalance = parseFloat(web3.utils.fromWei(details.vestingBalance, 'ether')).toFixed(3);
    const DoxatokensToTransfer = parseFloat(web3.utils.fromWei(toknesToTransfer, 'ether')).toFixed(3);
   
   
    this.setState({
      ...this.state,
      doxaVestingBalance,
      DoxatokensToTransfer
    });

    window.open(window.location.origin + "/home/transaction-history", "_self")
  }

  calculateAvailableToWithdraw = (web3, details) => {
    const reminingUnitsTovest = parseInt(details.reminingUnitsToVest);

    const lastVestedTime = parseInt(details.lastVestedTime);
    const seconds = new Date().getTime() / 1000;
    const timeDifference = seconds - lastVestedTime;
  
    let noOfUnitsCanBeVested = Math.floor(parseInt(timeDifference / (300)));

    if (noOfUnitsCanBeVested >= 0) {
      if (reminingUnitsTovest == 0) {
        noOfUnitsCanBeVested = reminingUnitsTovest;
      }
      else if (noOfUnitsCanBeVested == reminingUnitsTovest) {
        noOfUnitsCanBeVested = reminingUnitsTovest
      }
      else if (noOfUnitsCanBeVested >= reminingUnitsTovest) {
        noOfUnitsCanBeVested = reminingUnitsTovest;
      }
    
      return (web3.utils.toBN(noOfUnitsCanBeVested).mul(web3.utils.toBN(details.tokensPerUnit))).toString();
    }
  }

  render() {
    return (
      <div className="wallet-main">
         <ToastContainer position="bottom-right"/>
        <div className="row-one">
          <button>
            Purchased DOXAZO: <span> {this.state.totalDoxaBalance} DOXAZO</span>
          </button>
          <button>
            Balance DOXAZO: <span> {this.state.doxaVestingBalance} DOXAZO</span>
          </button>
          <button>
            Available to withdraw: <span> {this.state.DoxatokensToTransfer} DOXAZO</span>
          </button>
          <div className="send-btn" onClick={this.withdrawTokens}>
            <img src={send} alt="send-btn" />
          </div>
        </div>
        <div className="wrapper">

          <div className="row-two">
            <p className="table-heading">Token release schedule</p>
            {this.state.splittedDate.length>0 ?this.state.splittedDate.map((data) => (
              <div
                className="list-item"
                style={{
                  backgroundColor:
                    data.availability === "Available"
                      ? "#35353480"
                      : "#28282840",
                }}
              >

                <p
                  style={{
                    color:
                      data.availability === "Available"
                        ? "#a3874d"
                        : "#a3874d80",
                  }}
                >
                  {data.tokensPerUnit} DOXAZO
                </p>
                <p
                  style={{
                    color:
                      data.availability === "Available"
                        ? "#a3874d"
                        : "#a3874d80",
                  }}
                >
                  {moment(data.nextDate).format('LLL')}
                </p>
              </div>
            )):<div><p style={{color: "#EBBE68",margin: "40px",fontSize:"24px"}}>"No transactions to display"</p> </div>}
          </div>
          <div className="row-two">
          <p className="table-heading">Purchase history</p>

            {this.state.purchases.length > 0 ? this.state.purchases.map((data) => (
              <div
                className="list-item list-item-1"
                style={{
                  backgroundColor: "#28282840",
                }}
              >

                <p
                  style={{
                    color: "#a3874d80",
                  }}
                >
                  {data.buyamount} {data.symbol}
                </p>
                <p
                  style={{
                    color: "#a3874d80",
                  }}
                >
                  {data.tokenamount} DOXA
                </p>
                <p
                  style={{
                    color: "#a3874d80",
                  }}
                >
                  {moment(data.time).format('LLL')}
                </p>
              </div>
            )) : <div><p style={{color: "#EBBE68",margin: "40px",fontSize:"24px"}}>"No transactions to display"</p> </div>}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  wallet: state.walletConnect
});

export default connect(mapStateToProps, { connectWallet })(Wallet);
