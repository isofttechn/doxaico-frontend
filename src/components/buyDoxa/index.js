import React, { Component } from "react";
import transfer from "../../assets/transfer.png";
import buy1 from "../../assets/doxa-7.png";
import buy2 from "../../assets/doxa-10.png";
import buy3 from "../../assets/doxa-12.png";
import buyLoader from "../../assets/doxa-ico-loader.gif";
import { connect } from "react-redux";
import { connectWallet, addNetwork } from "../../redux/WalletAction";
import miniLogo from "../../assets/logo.png";
import axios from "axios";
import config from "../../config";
import "./scss/bs.css";
import Select from "react-select";
import { useDispatch } from "react-redux";
import select1 from "../../assets/doxa-ethereum.png";
import select2 from "../../assets/doxa-usdt.png";
import select3 from "../../assets/doxa-dai.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class BuyDoxa extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputValue: "0",
      doxaValue: 0,
      selectedOption: "eth",
      paymentOptions: [
        {
          label: (
            <div>
              <img src={select1} height="30px" width="30px" />
              <p>ETH</p>{" "}
            </div>
          ),
          value: "eth",
        },
        {
          label: (
            <div>
              <img src={select2} height="30px" width="30px" />
              <p>USTD</p>
            </div>
          ),
          value: "usdt",
        },
        {
          label: (
            <div>
              <img src={select3} height="30px" width="30px" />
              <p>DAI</p>
            </div>
          ),
          value: "dai",
        },
      ],
      labelValue: "ETH",
    };
  }

  componentDidMount() {
    const { web3Modal } = this.props.wallet;

    if (web3Modal.cachedProvider) {
      this.props.connectWallet();
    }
  }

  connectToWallet = async () => {
    await this.props.connectWallet();
  };

  handleChange = (selectedOption) => {
    this.setState({ selectedOption: selectedOption.value });
    this.setState({ labelValue: selectedOption.value.toUpperCase() });
  };

  buyToken = async () => {
    let inputValue = parseFloat(this.state.inputValue);

    if (this.state.selectedOption == "eth") {
      if (!(inputValue >= 0.001 && inputValue <= 1)) {
        toast("ETH should be between 0.001 and 1");
        return;
      }
    } else {
      if (!(inputValue >= 40 && inputValue <= 3800)) {
        toast("USDT/DAI should be between 40 and 3800");
        return;
      }
    }
    var buyValue = "";
    const { web3, ethICO, usdt, dai, address } = this.props.wallet;
    const value = this.state.inputValue.toString();
    if (this.state.selectedOption == "eth") {
      buyValue = web3.utils.toWei(value, "ether");
    } else {
      buyValue = web3.utils.toWei(value, "ether");
    }
    let tokenPrice = 0;
    if (this.state.selectedOption == "eth") {
      tokenPrice = web3.utils.toWei("0.00000003", "ether");
    } else if (this.state.selectedOption == "usdt") {
      tokenPrice = await ethICO.methods.usdttokenRate().call();
    } else {
      tokenPrice = await ethICO.methods.daitokenRate().call();
    }

    let form = {},
      doxaToken = localStorage.getItem("doxa-token"),
      doxaUser = localStorage.getItem("doxa-user"),
      headers = {};
    if (!doxaToken || !doxaUser) {
      window.open(window.location.origin + "/", "_self");
      return;
    }

    doxaToken = JSON.parse(doxaToken);
    doxaUser = JSON.parse(doxaUser);

    try {
      this.setState({ loading: true });
      let tokenPrice = 0;
      var totalTokens = 0;
      if (this.state.selectedOption == "eth") {
        tokenPrice = web3.utils.toWei("0.00000003", "ether");
        totalTokens = web3.utils
          .toBN(buyValue)
          .div(web3.utils.toBN(tokenPrice))
          .toString();
      } else if (this.state.selectedOption == "usdt") {
        tokenPrice = await ethICO.methods.usdttokenRate().call();
        totalTokens = Number(value) * Number(tokenPrice);
      } else {
        tokenPrice = await ethICO.methods.daitokenRate().call();
        totalTokens = Number(value) * Number(tokenPrice);
      }

      const icoContractAddress = process.env.REACT_APP_ICOEthContractAddress;
      let res;
      if (this.state.selectedOption === "eth") {
        res = await ethICO.methods
          .buy()
          .send({ from: address, value: buyValue });
      } else if (this.state.selectedOption === "usdt") {
        const allowance = await usdt.methods
          .allowance(address, icoContractAddress)
          .call();
        if (Number(allowance) > Number(buyValue)) {
          res = await ethICO.methods
            .payUsingTokens(0, buyValue)
            .send({ from: address });
        } else {
          const tokenAmount = web3.utils.toWei(
            "100000000000000000000000000",
            "ether"
          );
          const approveRes = await usdt.methods
            .approve(icoContractAddress, tokenAmount)
            .send({ from: address });
          res = await ethICO.methods
            .payUsingTokens(0, buyValue)
            .send({ from: address });
        }
      } else {
        const daiallowance = await dai.methods
          .allowance(address, icoContractAddress)
          .call();
        if (Number(daiallowance) > Number(buyValue)) {
          res = await ethICO.methods
            .payUsingTokens(1, buyValue)
            .send({ from: address });
        } else {
          const tokenAmount = web3.utils.toWei(
            "100000000000000000000000000",
            "ether"
          );
          const approveRes = await dai.methods
            .approve(icoContractAddress, tokenAmount)
            .send({ from: address });
          res = await ethICO.methods
            .payUsingTokens(1, buyValue)
            .send({ from: address });
        }
      }

      headers["x-auth-token"] = doxaToken;

      form.transactionHash = res.transactionHash;
      form.fromAddress = address;
      form.userId = doxaUser._id;
      form.userName = doxaUser.userName;
      form.type = `buy-${this.state.selectedOption}`;
      let details;
      if (this.state.selectedOption === "eth") {
        details = await ethICO.methods.getInvestorDetails(address).call();
      } else {
        details = await ethICO.methods.getInvestorDetails(address).call();
      }

      form.lastVestedTime = new Date(parseInt(details.lastVestedTime) * 1000);

      form.reminingUnitsToVest = details.reminingUnitsToVest;
      form.tokensPerUnit = details.tokensPerUnit;
      form.totalBalance = details.totalBalance;
      form.totalPaid = details.totalPaid;
      form.ethQuantity = buyValue;
      form.doxaQuantity = totalTokens;

      axios
        .post(config.serviceUrl + "/transaction/buy", form, {
          headers: headers,
        })
        .then((res, err) => {
          this.setState({ loading: false });

          window.open(window.location.origin + "/home/wallet", "_self");
        });
    } catch (err) {
      this.setState({ loading: false });
      console.log("error", err);
      if (err.message) {
        toast(err.message);
      } else {
        toast("Something went wrong!");
      }
    }
  };

  updateInputValue = async (e) => {
    const { ethICO } = this.props.wallet;
    let div = 0;
    if (this.state.selectedOption == "eth") {
      div = 0.00000003;
    } else if (this.state.selectedOption == "usdt") {
      div = await ethICO.methods.usdttokenRate().call();
    } else {
      div = await ethICO.methods.daitokenRate().call();
    }

    let totalTokens;
    if (e != "") {
      if (this.state.selectedOption == "eth") {
        totalTokens = (parseFloat(e) / div).toFixed(3);
      } else {
        totalTokens = (parseFloat(e) * div).toFixed(3);
      }
    }
    this.setState({
      inputValue: e,
      doxaValue: totalTokens,
    });
  };

  render() {
    const customStyles = {
      control: (base, state) => ({
        ...base,
        background: "#DFB35B",
        borderRadius: state.isFocused ? "3px 3px 0 0" : 3,
        borderColor: state.isFocused ? "#DFB35B" : "#DFB35B",
        boxShadow: state.isFocused ? null : null,
        "&:hover": {
          borderColor: state.isFocused ? "#DFB35B" : "#DFB35B",
        },
      }),
      menu: (base) => ({
        ...base,
        borderRadius: 0,
        marginTop: 0,
      }),
      menuList: (base) => ({
        ...base,
        padding: 0,
      }),
    };
    return (
      <div className="bs-container h-100">
        <ToastContainer position="bottom-right" />
        <div className="bs-main">
          <h2>BUY DOXAZO</h2>
          <div className="bs-input">
            <div className="inpt-cont center mb-3">
              <label>Enter {this.state.labelValue} </label>
              <input
                type="number"
                value={this.state.inputValue}
                onChange={(e) => this.updateInputValue(e.target.value)}
              />
            </div>
            <div className="select-cont">
              <Select
                styles={customStyles}
                defaultValue={this.state.paymentOptions[0]}
                value={this.state.selectedOption.value}
                onChange={this.handleChange}
                options={this.state.paymentOptions}
              />
            </div>
          </div>
          {/* image */}
          <img src={transfer} className="transfer" alt="transfer" />
          <div className="bs-input">
            <div className="inpt-cont center">
              <p>{this.state.doxaValue}</p>
            </div>
            <div className="img-cont">
              <img src={miniLogo} alt="eth" />
              <p>DOXAZO</p>
            </div>
          </div>
          {/* btn */}
          <button
            className="bs-btn"
            disabled={this.state.loading}
            onClick={() =>
              this.props.wallet.connected
                ? this.buyToken()
                : this.connectToWallet()
            }
          >
            {this.props.wallet.connected ? (
              this.state.loading ? (
                <span>
                  Processing <img src={buyLoader}></img>
                </span>
              ) : (
                "Buy"
              )
            ) : (
              "Connect Wallet"
            )}
          </button>
        </div>

        {/* instruction */}
        <div className="ins-cont">
          <div className="list list1">
            <img src={buy1} alt="bulletin" />
            <div>
              <p>1 DOXAZO = 0.00001 ETH</p>
              <p>1 ETH = 1860000 DOXAZO</p>
            </div>
          </div>
          <div className="list list2">
            <div>
              <p>Minimum purchase - 0.1 ETH (18600 DOXAZO)</p>
              <p>Maximum purchase - 10 ETH (18600000 DOXAZO)</p>
            </div>
            <img src={buy2} alt="bulletin" />
          </div>
          <div className="list list1">
            <img src={buy3} alt="bulletin" />
            <div>
              <p>Use only registered wallet</p>
              <p>10% token released every fortnight</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  wallet: state.walletConnect,
});

export default connect(mapStateToProps, { connectWallet })(BuyDoxa);
