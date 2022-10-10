import React, { Component } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Account from "../account";
import ForgotPassword from "../auth/forgotpassword";
import Login from "../auth/login";
import Signup from "../auth/signup";
import BuyDoxa from "../buyDoxa";
import Main from "../main/main";
import TransactionHistory from "../transactionHistory";
import Wallet from "../wallet";
import SetPassword from "../auth/setpassword";
import VerifyEmail from "../auth/verifyemail";
import axios from "axios";
import config from "../../config";


export default class MainLayout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authenticated: true,
      user: { userType: 'user'}
    }
  }
  componentDidMount() {
    this.isAuthenticated()
  }

  isAuthenticated() {
    let doxaUser = localStorage.getItem("doxa-user"),
      doxaToken = localStorage.getItem("doxa-token"),
      headers = {};


    if (doxaUser && doxaToken) {
      doxaUser = JSON.parse(doxaUser);
      doxaToken = JSON.parse(doxaToken);

      headers["x-auth-token"] = doxaToken
      axios.get(config.serviceUrl + "/auth/users/" + doxaUser._id, this.state, {
        headers: headers
      }).then(res => {

        localStorage.setItem("doxa-user", JSON.stringify(res.data.response))
          this.setState({ user: res.data.response, authenticated: true })
      }).catch(err => {
        let locationPathName = window.location.href.split("/");
        if(locationPathName.includes("home"))
        {
          window.open(window.location.origin + "/", "_self")
        }
      })
    }else{
      let locationPathName = window.location.href.split("/");
      if(locationPathName.includes("home"))
      {
        window.open(window.location.origin + "/", "_self")
      }
    }
  }
  render() {
    return (
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route exact path="/signup" element={<Signup />} />
        <Route exact path="/forgotpassword" element={<ForgotPassword />} />
        <Route exact path="/forgotpassword/:token" element={<SetPassword />} />
        <Route exact path="/verifyemail/:token" element={<VerifyEmail />} />
        {this.state.authenticated &&
          <Route exact path="/home" element={<Main />}>
            {this.state.user.userType == "user" &&
              <React.Fragment>
                <Route path="/home/buy-doxa" element={<BuyDoxa />} />
                <Route path="/home/wallet" element={<Wallet />} />
                <Route
                  path="/home/transaction-history"
                  element={<TransactionHistory />}
                />
              </React.Fragment>
            }
            {this.state.user.userType == "admin" &&
              <Route path="/home/account" element={<Account />} />
            }

          </Route>
        }
      
      </Routes>
    );
  }
}
