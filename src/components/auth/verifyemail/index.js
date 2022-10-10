import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import "../scss/login.css";
import config from "../../../config";
import { Link } from "react-router-dom";
import logo from "../../../assets/login-signup.png";
import miniLogo from "../../../assets/logo.png";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default class VerifyEmail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            success: ""
        };
    }

    componentDidMount(){
        let token = window.location.pathname.split("/")[2];

        axios.get(config.serviceUrl+"/auth/verify/"+token).then(res => {
            this.setState({message: "Verified Successfully!", success: true})
        }).catch(err => {
            if(err.response)
                this.setState({message: err.response.data.message, success:false})
            else
                toast("Please check your internet connection! ")
        })
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

                                <h3 className="verify-message">{this.state.message}</h3>
                                <Link className="nav-link" to={"/"}>
                                   Continue ?  <span> {"Login"} </span>
                                </Link>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}
