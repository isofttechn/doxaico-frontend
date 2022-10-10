import React, { Component } from "react";
import "./scss/trans.css";
import send from "../../assets/send.png";
import axios from 'axios';
import config from "../../config";
import moment from 'moment'
import { connect } from "react-redux";
import { connectWallet } from '../../redux/WalletAction';

class TransactionHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
    };
  }

  async componentDidMount() {
    const { web3Modal } = this.props.wallet;
    if (web3Modal.cachedProvider) {
      await this.props.connectWallet();
      this.getTransactiondata()
    }
  }

  getTransactiondata=async()=>{
    const { web3,address } = this.props.wallet;
    try{
    const result = await axios.get(process.env.REACT_APP_ETH_apilink, {
      params: {
        module: 'logs',
        action: 'getLogs',
        address: process.env.REACT_APP_ICOEthContractAddress,
        topic0: process.env.REACT_APP_Withdraw_topic0,
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
          { "indexed": false, "internalType": "uint", "name": "amount", "type": "uint" },
        ], event.data)
       
        if(data1.account == address){
          const transactionHash = event.transactionHash;
          const amount = parseFloat(web3.utils.fromWei(data1.amount),'ether').toFixed(2);
          var yourNumber = parseInt(event.timeStamp, 16)*1000;
          const time = (String (new Date(yourNumber))).slice(4,25);
          const transaction = {transactionHash,amount,time};
          transactionHistory.push(transaction);
        }
        this.setState({ transactions: transactionHistory })
      })
    }catch(e){
      console.log("Error",e)
    }
  }

  openTestNet(url) {
    window.open("https://rinkeby.etherscan.io/tx/" + url, "_blank")
  }
  render() {
    return (
      <div className="th-main">
        <div className="row-one">
        </div>
        <div className="row-two">
        
          {this.state.transactions.length>0 ? this.state.transactions.map((data) => (
            <div className="list-item">
              <p>{data.amount} DOXAZO</p>
              <p className="pc" onClick={() => this.openTestNet(data.transactionHash)}>{data.transactionHash}</p>
              <p className="pe">{moment(data.time).format('LLL')}</p>
            </div>
          )) :  <div className="list-item"><p className="pee" style={{fontSize:"24px",color:"#EBBE68"}}> "No transactions to display"</p></div> }
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  wallet: state.walletConnect
});

export default connect(mapStateToProps, { connectWallet })(TransactionHistory);
