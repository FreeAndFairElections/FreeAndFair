import { Component } from 'react';
import { StyleSheet } from 'react-native';
import { Dispatch } from '../../actions/Actions';
import AppState from "../../types/AppState";
import { NavControl } from './ShowNav';

type P = {
  dispatch: Dispatch,
  appState: AppState,
}

class NavBar extends Component<P> implements NavControl {
  render() {
    return this.props.children
  }

  showNav() { }
  closeNav() { }
}
export default NavBar

const styles = StyleSheet.create({
})