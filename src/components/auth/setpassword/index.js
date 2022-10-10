import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
import account from "../../../assets/signup-user.png";
import axios from "axios";
import "../scss/login.css";
import config from "../../../config";
import { Link } from "react-router-dom";
import logo from "../../../assets/login-signup.png";
import miniLogo from "../../../assets/logo.png";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default class SetPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sendOtp: false
        };
    }

    resetPassword() {
        if(!this.state.firstPassword || !this.state.secondPassword){
            toast("Enter password")
            return
        }

        if(this.state.firstPassword !== this.state.secondPassword)
        {
            toast("Password is not matching")
            return
        }

        let token = window.location.pathname.split("/")[2],
            form = {
                password: this.state.firstPassword
            }

        if(!token)
        {
            toast("please contact support")
            return
        }

        axios.post(config.serviceUrl + "/auth/reset/"+token, form).then(res => {
            toast("Password has been changed")
            window.open(window.location.origin + "/", "_self")
        }).catch(err => {
            if(err.response){
                toast(err.response.data.message)
            }else{
                toast("Please check your internet connection! ")
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
                                <img src={logo} className="mob-logo" />

                                <h3>Reset Password</h3>
                                <div className="input-container">
                                        <img src={account} className="left-icon" />
                                        <input placeholder="Enter password"
                                            type={this.state.showFirstPassword ? "text" : "password"}
                                            onChange={(e) => { this.inputHandler("firstPassword", e.target.value) }}
                                            value={this.state.firstPassword}
                                        />
                                </div>
                                <div className="input-container">
                                        <img src={account} className="left-icon" />
                                        <input placeholder="Retype password"
                                            type={this.state.showSecondPassword ? "text" : "password"}
                                            onChange={(e) => { this.inputHandler("secondPassword", e.target.value) }}
                                            value={this.state.secondPassword}
                                        />
                                </div>
                                <Link onClick={() => { this.resetPassword() }} className="auth-btn" to={""}>
                                    {" "}
                                    Save
                                </Link>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}
