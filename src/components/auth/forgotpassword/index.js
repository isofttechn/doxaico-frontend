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

export default class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sendOtp: false
        };
    }

    sendOtp() {
        let form = {
            email: this.state.email,
        }

        if (!form.email) {
            return toast("Email is mandatory")
        }
        
        axios.post(config.serviceUrl + "/auth/forgot", this.state).then(res => {
           toast(res.data.message)
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

                                <h3>Forgot Password ?</h3>
                                <h2>We will send you the link to registered email to reset your password</h2>
                                <div className="input-container">
                                    {!this.state.sendOtp ? <React.Fragment>
                                        <img src={account} className="left-icon" />
                                        <input placeholder="email"
                                            type={"email"}
                                            onChange={(e) => { this.inputHandler("email", e.target.value) }}
                                            value={this.state.email}
                                        />
                                    </React.Fragment> : <React.Fragment>
                                        <img src={account} className="left-icon" />
                                        <input placeholder="otp"
                                            type={"text"}
                                            onChange={(e) => { this.inputHandler("otp", e.target.value) }}
                                            value={this.state.otp}
                                        /></React.Fragment>}

                                </div>
                                <Link onClick={() => { this.sendOtp() }} className="auth-btn" to={""}>
                                    {" "}
                                    Reset
                                </Link>
                                <Link className="nav-link" to="/">
                                    Back to login? <span> Login </span>
                                </Link>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}
