import React, { Component } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import logo from "../../../assets/login-signup.png";
import miniLogo from "../../../assets/logo.png";
import account from "../../../assets/signup-user.png";
import eyeIcon from "../../../assets/eye.png";
import pwIcon from "../../../assets/password.png";
import emailIcon from "../../../assets/email.png";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import "../scss/login.css";
import {
  Link
} from 'react-router-dom';
import config from '../../../config';
import axios from "axios";
import { connect } from "react-redux";
import { connectWallet } from '../../../redux/WalletAction';

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPasswordShow: false,
      checked: true
    };
  }

  inputHandler(name, value){
    this.setState({[name]: value})
  }


   register =async () => {
    
    try{
     await this.props.connectWallet();
     const walletInformation = this.props.wallet
     
     if(!walletInformation || !walletInformation.connected)
     {
       return toast("Wallet not connected")
     }
      let form = {
        userName: this.state.userName, 
        password: this.state.password,
        email: this.state.email,
        walletAddress: walletInformation.address
      }
  

      if(!form.userName || !form.email || !form.password || !form.walletAddress)
      {
        return toast("Fill all the fields.")
      }
  
      axios.post(config.serviceUrl+"/auth/signup", form).then(res => {
        if(res.data.success)
        {
          toast("Verification link sent to your mail id. Please verify.")
        }
      }).catch(err => {
        if(err.response){
          toast(err.response.data.message)
        }else{
          toast("Please check your internet connection! ")
        }
      })
    }catch(err){
      console.log(err)
      if (err.message) {
        toast(err.message)
      } else {
        toast("Something went wrong!")
      }
    }

   
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
                <h3>Welcome to DOXAZO ICO !!</h3>
                <div className="input-container">
                  <img src={account} className="left-icon" />
                  <input value={this.state.userName} onChange={(e) => {this.inputHandler("userName", e.target.value)}} placeholder="name" />
                </div>
                <div className="input-container">
                  <img src={emailIcon} className="left-icon" />
                  <input value={this.state.email} onChange={(e) => {this.inputHandler("email", e.target.value)}} placeholder="email" type="email" />
                </div>
                <div className="input-container">
                  <img src={pwIcon} className="left-icon" />
                  <input
                     value={this.state.password}
                    placeholder="password"
                    type={this.state.isPasswordShow ? "text" : "password"}
                    onChange={(e) => {this.inputHandler("password", e.target.value)}}
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
                <div className="below-container radio-container">
                  <Form>
                    <Form.Check
                      inline
                      checked={true}
                      type="checkbox"
                      id="Remember me"
                      className="chk"
                    />
                  </Form>
                  <p className="radio-label">I have read <a href="https://blockchaintechs.io/" target="_blank">terms &amp; conditions</a></p>
                  </div>
              <Link to={''} className="auth-btn" onClick={this.register}>
                    Connect Wallet &amp; Register
                </Link>
                <Link className="nav-link" to="/">
                  Already have an account? <span> LOGIN</span>
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

export default connect(mapStateToProps, { connectWallet })(Signup);
