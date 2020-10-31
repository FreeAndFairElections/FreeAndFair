import React, { Component, FunctionComponent, RefObject, useRef } from 'react';
import { DrawerLayoutAndroid, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Divider, Drawer, Paragraph, Portal } from 'react-native-paper';
import { Action, Dispatch } from '../../actions/Actions';
import AppState from "../../types/AppState";
import AppScreen from "../../types/AppScreen";
import { NavControl } from './ShowNav';
import P from './NavBarProps'

type S = {
  drawer: RefObject<DrawerLayoutAndroid>
  confirmDeleteVisible: boolean
}

class NavBar
  extends Component<P, S>
  implements NavControl {
  constructor(props: P) {
    super(props)
    this.state = {
      drawer: React.createRef<DrawerLayoutAndroid>(),
      confirmDeleteVisible: false,
    }
  }
  render() {
    return (
      <DrawerLayoutAndroid
        ref={this.state.drawer}
        style={styles.drawer}
        drawerWidth={300}
        renderNavigationView={() => this.renderNavigation(this.props, this.state.drawer)}
      >
        {this.props.children}
      </DrawerLayoutAndroid>
    )
  }

  renderNavigation(p: P, drawer: RefObject<DrawerLayoutAndroid>) {
    return (
      <ScrollView>
        <Drawer.Section title="Actions" >
          <Drawer.Item
            label="Home"
            active={p.screen === AppScreen.Home}
            onPress={() => {
              drawer.current?.closeDrawer()
              p.dispatch({ type: Action.GoHome })
            }}
          />
        </Drawer.Section>
        <Drawer.Section title="Danger" >
          <Drawer.Item
            label="Clear user data"
            active={false}
            onPress={() => {
              drawer.current?.closeDrawer()
              if (p.userDataSet)
                this.setState({ confirmDeleteVisible: true })
            }}
          />
        </Drawer.Section>

        <Portal>
          <Dialog
            visible={this.state.confirmDeleteVisible}
            onDismiss={() => this.setState({ confirmDeleteVisible: false })}
          >
            <Dialog.Title>Confirm?</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Are you sure you want to clear your user data?</Paragraph>
            </Dialog.Content>
            <Dialog.Actions
              style={{ justifyContent: "space-around" }}
            >
              <Button
                mode="outlined"
                onPress={() => this.setState({ confirmDeleteVisible: false })}
              >
                Cancel
                </Button>
              <Button
                color="#ff4040"
                mode="contained"
                onPress={() => {
                  this.setState({ confirmDeleteVisible: false })
                  p.dispatch({ type: Action.SaveUserData, payload: undefined })
                  p.dispatch({ type: Action.SnackbarMessage, message: "Cleared user data" })
                }}

              >
                Delete
                </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    )
  }

  openNav() {
    this.state.drawer.current?.openDrawer()
  }
  closeNav() {
    this.state.drawer.current?.closeDrawer()
  }
}
export default NavBar

const styles = StyleSheet.create({
  drawer: {}
})