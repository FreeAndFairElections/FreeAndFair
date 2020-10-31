import { Dispatch } from '../../actions/Actions';
import AppScreen from '../../types/AppScreen';

type NavBarProps = {
  dispatch: Dispatch;
  screen: AppScreen;
  userDataSet: boolean;
};
export default NavBarProps;

