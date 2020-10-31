import { Component } from 'react';
import { StyleSheet } from 'react-native';
import AppState from "../../types/AppState";
import P from './NavBarProps';
import { NavControl } from './ShowNav';

class NavBar extends Component<P> implements NavControl {
  render() {
    return this.props.children
  }

  openNav() { }
  closeNav() { }
}
export default NavBar

const styles = StyleSheet.create({
})