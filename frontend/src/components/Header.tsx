import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Header.css';
import Nav from 'react-bootstrap/Nav';
import {  QuestionCircle28Regular } from "@fluentui/react-icons";
import { Button } from "@fluentui/react-components";
import myDSP from '../assets/DSPWhite.svg'

const govHarpLogo = "https://upload.wikimedia.org/wikipedia/commons/0/0a/Harp_of_the_Irish_Government.png"
export default class Header extends Component{
  render(){
  return(
    <Navbar fixed="top">
      <Container>
        <Navbar.Brand>
          <img src={myDSP} style={{ width: 200, height: 80 }}/>{' '}
          Circulars Co-pilot</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
        </Navbar.Collapse>
        <Nav className="justify-content-end">
        <Nav.Item>
            <Button icon={<QuestionCircle28Regular />} >
                {"Help"}
            </Button>
        </Nav.Item>
        </Nav>
      </Container>
    </Navbar>
  );
}
}

