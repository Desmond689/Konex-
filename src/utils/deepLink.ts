import { NavigationContainerRef } from '@react-navigation/native';

export function handleDeepLink(
  url: string,
  navigationRef: NavigationContainerRef<any> | { current?: any } | any
): void {
  try {
    const path = url.replace(/^konex:\/\//, '').replace(/^https?:\/\/[^/]+\//, '');
    const [route, id] = path.split('/');
    const nav = navigationRef?.navigate ? navigationRef : navigationRef?.current;
    if (!nav?.navigate) return;
    switch (route) {
      case 'profile':
        nav.navigate('Main', { screen: 'Profile', params: { userId: id } });
        break;
      case 'squad':
        nav.navigate('Main', { screen: 'Squads', params: { squadId: id } });
        break;
      case 'post':
        nav.navigate('Main', { screen: 'Home', params: { postId: id } });
        break;
      default:
        break;
    }
  } catch (e) {
    console.warn('Deep link parse failed', e);
  }
}
