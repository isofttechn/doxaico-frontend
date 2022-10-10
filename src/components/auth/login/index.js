import React, { Component } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import logo from "../../../assets/login-signup.png";
import miniLogo from "../../../assets/logo.png";
import account from "../../../assets/signup-user.png";
import eyeIcon from "../../../assets/eye.png";
import pwIcon from "../../../assets/password.png";
import axios from "axios";
import "../scss/login.css";
import config from "../../../config";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { connectWallet } from '../../../redux/WalletAction';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPasswordShow: false,
      email: "",
      password: "",
    };
  }

  login = async (type) => {
    let form;
    
    if(type == "email")
    {
      form = {
        email: this.state.email,
        password: this.state.password
      }

      if (!form.email) {
        return toast("Email is mandatory.")
      }

      if(!form.password)
      {
        return toast("Password is mandatory.")
      }
    }
    
    if(type == "wallet")
    {
      await this.props.connectWallet();
      const walletInformation = this.props.wallet
   
      if(!walletInformation)
      {
        return toast("Wallet connection issue.")
      }
      if(!walletInformation.connected)
      {
        return toast("Wallet not connnected.")
      }

      form = {
        walletAddress: walletInformation.address,
      }
    }

    axios.post(config.serviceUrl + "/auth/login", form).then(res => {
      if (res.data.success) {

        localStorage.setItem("doxa-token", JSON.stringify(res.data.response.token))
        localStorage.setItem("doxa-user", JSON.stringify(res.data.response.user))

        let redirectTo = ""
        if(res.data.response.user.userType == "admin")
        {
          redirectTo = "/home/account"
        }else{
          redirectTo = "/home/buy-doxa"
        }

        window.open(window.location.origin +  redirectTo   , "_self")
      
      }
    }).catch(err => {
      if(err.response){
        toast(err.response.data.message)
    }else{
      toast("Try again")
    }
    })
  }

  inputHandler(name, value) {
    this.setState({ [name]: value })
  }
  render() {
    return (
      <Container fluid>
        <ToastContainer position="bottom-right"/>
        <Row>
          <Col xl={6} className="p-0 desk-comp">
            <div className="lhs login-content">
              <img src={logo} />
            </div>
          </Col>
          <Col xl={6} className="p-0">
            <div className="rhs login-content">
              <div className="rhs-container">
                <img src={miniLogo} className="top-logo desk-logo" />
                <img src={logo} className=" mob-logo" />

                <h3>Welcome to Doxazo ICO !!</h3>
                <div className="input-container">
                  <img src={account} className="left-icon" />
                  <input placeholder="email"
                    type={"email"}
                    onChange={(e) => { this.inputHandler("email", e.target.value) }}
                    value={this.state.email}
                  />
                </div>
                <div className="input-container">
                  <img src={pwIcon} className="left-icon" />
                  <input
                    onChange={(e) => { this.inputHandler("password", e.target.value) }}
                    placeholder="password"
                    value={this.state.password}
                    type={this.state.isPasswordShow ? "text" : "password"}
                  />
                  <img
                    src={eyeIcon}
                    className="eye-icon"
                    onClick={() =>
                      this.setState({
                        isPasswordShow: !this.state.isPasswordShow,
                      })
                    }
                  />
                </div>
                <div className="below-container">
                  <Form>
                    <Form.Check
                      inline
                      type="checkbox"
                      id="Remember me"
                      label="Remember me"
                      className="chk"
                    />
                  </Form>
                  <br />
                  <Link to={"/forgotpassword"}>
                    {" "}
                    <p>Forgot password?</p>
                  </Link>
                </div>
                <Link onClick={() => this.login("email")} className="auth-btn" to={""}>
                  {" "}
                  Login
                </Link>
                <p className="or">or</p>
                <Link onClick={() => this.login("wallet")} className="auth-btn" to={""}>Connect Wallet to Login</Link>
                <Link className="nav-link" to="/signup">
                  New to DOXAZO Token? <span style={{fontWeight:"600"}}> Create Account</span>
                </Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    );
    
  }
}


const mapStateToProps = state => ({
  wallet: state.walletConnect
});

export default connect(mapStateToProps, { connectWallet })(Login);
