import React, { Component } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { NavLink, Outlet } from "react-router-dom";
import headerLogo from "../../assets/header-logo.png";
import Logout from "../../assets/logout.png";
import axios from "axios";
import config from "../../config";
import "./scss/main.css";
import { connect } from "react-redux";
import { connectWallet } from '../../redux/WalletAction';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authenticated: false,
      user: {

      }
    }
  }
  async componentDidMount() {
    const { web3Modal } = this.props.wallet
    if (web3Modal.cachedProvider) {
      await this.props.connectWallet();
      this.isAuthenticated()
    }
  }


  isAuthenticated() {


    let doxaUser = localStorage.getItem("doxa-user"),
      doxaToken = localStorage.getItem("doxa-token"),
      headers = {};


    if (doxaUser && doxaToken) {


      doxaUser = JSON.parse(doxaUser);
      doxaToken = JSON.parse(doxaToken);

  
      if (doxaUser.walletAddress !== this.props.wallet.address) {
        toast('Switch to the registered wallet address login!');
        return;
      }
      headers["x-auth-token"] = doxaToken

      axios.get(config.serviceUrl + "/auth/users/" + doxaUser._id, {
        headers: headers
      }, {
        headers: headers
      }).then(res => {
        localStorage.setItem("doxa-user", JSON.stringify(res.data.response))
        this.setState({ user: res.data.response, authenticated: true })
      }).catch(err => {
        let locationPathName = window.location.href.split("/");
        if (locationPathName.includes("home")) {
          window.open(window.location.origin + "/", "_self")
        }
      })
    } else {
      let locationPathName = window.location.href.split("/");
      if (locationPathName.includes("home")) {
        window.open(window.location.origin + "/", "_self")
      }
    }
  }

  logout() {
    let logout = window.confirm("Do you really want to log out?");

    if(!logout)
    {
      return;
    }
    localStorage.removeItem("doxa-user")
    localStorage.removeItem("doxa-token")
    window.open(window.location.origin + "/", "_self")
  }
  render() {
    return (
      <div className="h-100">
        <ToastContainer position="bottom-right"/>
        {this.state.authenticated &&
          <React.Fragment>
            <Container fluid className="header-container">
              <Row className="h-100 row-h">
                <Col xl={6} md={6} xs={6} className="p-0 logo-container">
                  <NavLink to="/home/buy-doxa">
                    <img src={headerLogo} className="header-logo" />
                  </NavLink>
                </Col>

                {/* nav */}

                <Col xl={6} md={6} xs={6} className="p-0">
                  <div className="nav">
                    {this.state.user.userType == "user" &&
                      <React.Fragment>
                        <NavLink to="/home/buy-doxa" className="nav-items desk-nav">
                          Buy DOXAZO
                              </NavLink>
                        <NavLink to="/home/wallet" className="nav-items desk-nav">
                          Wallet
                              </NavLink>
                        <NavLink
                          to="/home/transaction-history"
                          className="nav-items desk-nav"
                        >
                          Transaction History
                              </NavLink>
                              <div className="profile-nav">
                          <p className="nav-items desk-nav username">{this.state.user.userName}</p>
                          <img onClick={() => { this.logout() }} className="nav-logo" src={Logout}></img>
                        </div>
                          
                      </React.Fragment>
                    }
                    {this.state.user.userType == "admin" &&
                      <React.Fragment>
                        <div></div>
                        <div></div>
                        <div className="profile-nav">
                          <p className="nav-items desk-nav username">{this.state.user.userName}</p>
                          <img onClick={() => { this.logout() }} className="nav-logo" src={Logout}></img>
                        </div>
                      </React.Fragment>
                    }
                  </div>
                </Col>
              </Row>
              {/* mobile header */}
              {this.state.user.userType == "user" &&

                <div className="mob-nav">

                  <NavLink to="/home/buy-doxa" className="nav-items">
                    Buy DOXAZO
          </NavLink>
                  <NavLink to="/home/wallet" className="nav-items">
                    Wallet
          </NavLink>
                  <NavLink to="/home/transaction-history" className="nav-items">
                    Transaction History
          </NavLink>
                </div>
              }
            </Container>

            <div className="main-container">
              <Outlet />
            </div>
          </React.Fragment>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  wallet: state.walletConnect
});

export default connect(mapStateToProps, { connectWallet })(Main);
