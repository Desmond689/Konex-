/**
 * KONEX entry — gesture-handler MUST be the first import
 * or the app crashes on open (especially Android release/APK).
 */
import 'react-native-gesture-handler';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
