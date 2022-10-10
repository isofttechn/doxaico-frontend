import { Component } from "react";
import "./scss/account.css";
import axios from 'axios';
import config from "../../config";
import moment from 'moment'
import { connect } from "react-redux";
import { connectWallet } from '../../redux/WalletAction';
import ReactPaginate from 'react-paginate';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
      paginationNumbers: 0,
      totalDoxaBalance: "",
      totalETHBalance: "",
      icoPercentage: "",
      search: "",
      limit: 20,
      skip: 0,
      numberToArray: [],
      totalTransactions: 0,
      pageCount: 0,
      pageNumber: 0
    };
  }


  async componentDidMount() {
    const { web3Modal } = this.props.wallet;
    await this.props.connectWallet();
    this.getDoxaTransactions();
    this.getTotalTransactionsCount();
  }

  getTotalTransactionsCount(){
    const headers = {};
    let doxaToken = localStorage.getItem("doxa-token"),
      doxaUser = localStorage.getItem("doxa-user");

    if (!doxaToken || !doxaUser) {
      window.open(window.location.origin + "/", "_self")
      return
    }

    doxaToken = JSON.parse(doxaToken);

    headers["x-auth-token"] = doxaToken

    axios.get(config.serviceUrl + "/transaction/totaltokens", {
      params: {
        type: "buy",
      },
      headers: headers 
    }).then(res => {
      let response = res.data.response;
      this.setState({ totalTransactions: response, pageCount: Math.ceil(response/this.state.limit)}, ()=>{
      })
      }).catch(err => {
        console.log(err.response)
      if (err.response) {
        toast(err.response.data.message)
      } else {
      
        toast("Please check your internet connection! ")
      }
    })
  }

  async getDoxaTransactions() {
    const { web3, ethICO } = this.props.wallet;
    let totalDoxaBalance = await ethICO.methods.contractBalance().call(),
      totalETHBalance = await ethICO.methods.getContractETHBalance().call(),
      icoPercentage; 
    totalDoxaBalance = await web3.utils.fromWei(totalDoxaBalance, 'ether')
    totalETHBalance = await web3.utils.fromWei(totalETHBalance, 'ether')

    totalDoxaBalance = parseInt(totalDoxaBalance)
    icoPercentage = ((totalDoxaBalance / 3000000000) * 100).toFixed(2);
    this.setState({ totalDoxaBalance, totalETHBalance, icoPercentage })
    this.getTransactions()
  }

  getTransactions() {
    const { web3, ICO } = this.props.wallet,
      headers = {};
    let doxaToken = localStorage.getItem("doxa-token"),
      doxaUser = localStorage.getItem("doxa-user");

    if (!doxaToken || !doxaUser) {
      window.open(window.location.origin + "/", "_self")
      return
    }

    doxaToken = JSON.parse(doxaToken);

    headers["x-auth-token"] = doxaToken

    axios.get(config.serviceUrl + "/transaction/token", {
      params: {
        type: "buy",
        limit: this.state.limit,
        userId: doxaUser._id,
        skip: this.state.skip,
        search: this.state.search
      },
      headers: headers
    }).then(res => {
      let response = res.data.response;
      response.map(data => {
        data.ethQuantity = web3.utils.fromWei(data.ethQuantity, 'ether')
      })
      this.setState({ transactions: response })

    }).catch(err => {
      if (err.response) {
        toast(err.response.data.message)
      } else {
        toast("Please check your internet connection! ")
      }
    })
  }

  openTestNet(url) {
    window.open("https://testnet.bscscan.com/tx/" + url, "_blank")
  }

  handleSearch(e) {
    if (e.key === 'Enter') {
      console.log('do validate');
    }
    this.setState({ search: e.target.value, forcePage:1 } )
  }

  search(e) {
    if (e.key === 'Enter') {
      this.setState({skip: 0, pageNumber: 0 }, () => {
        this.getTransactions()
      })
    }
  }

  handlePageClick = (e) => {
    this.setState({skip : e.selected * this.state.limit, pageNumber: e.selected}, () => {
      this.getTransactions()
    })
  }

  render() {
    return (
      <div className="acc-main">
        <ToastContainer position="bottom-right"/>
        <div className="row-one">
          <div className="tile tile-1">
            <p className="t-title">{this.state.totalDoxaBalance} Doxa</p>
            <p>Contract balance</p>
          </div>
          <div className="tile tile-1">
            <p className="t-title">{this.state.totalETHBalance} ETH</p>
            <p>Admin Wallet</p>
          </div>
          <div className="tile tile-1">
            <p className="t-title">{this.state.icoPercentage}%</p>
            <p>ICO target</p>
          </div>
        </div>

        {/* search-bar */}
        <div className="search-container">
          <input type="text" value={this.state.search} onChange={(e) => this.handleSearch(e)} onKeyDown={(e) => this.search(e)} placeholder="Search.." />
        </div>

        {/* table  */}
        <div className="table-container">
          <div className="table-header">
            <p>No</p>
            <p>From</p>
            <p>Transaction Hash</p>
            <p>User Name</p>
            <p>ETH</p>
            <p>DOXAZO</p>
            <p>Transaction Time</p>
          </div>

          <div className="table-lists">
            {this.state.transactions.map((data, index) => (
              <div className="table-content">
                <p>{index + 1}</p>
                <p>{data.fromAddress.substr(0, 20) + "..."} </p>
                <p onClick={() => this.openTestNet(data.transactionHash)}>{data.transactionHash.substr(0, 20) + "..."} </p>
                <p>{data.userName}</p>
                <p>{data.ethQuantity}</p>
                <p>{data.doxaQuantity}</p>
                <p>{moment(data.createdAt).format('LLL')}</p>
              </div>
            ))}
          </div>

        </div>
        <div className="pagination-container">
            <ReactPaginate
                  forcePage={this.state.pageNumber}
                  previousLabel={null}
                  nextLabel={null}
                  breakLabel={"..."}
                  breakClassName={"break-me"}
                  pageCount={this.state.pageCount+ 20}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  onPageChange={this.handlePageClick}
                  containerClassName={"pagination"}
                  subContainerClassName={"pages pagination"}
                  activeClassName={"active"}/>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  wallet: state.walletConnect
});

export default connect(mapStateToProps, { connectWallet })(Account);

