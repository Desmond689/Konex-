export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Communities: undefined;
  Squads: undefined;
  Chat: undefined;
  Profile: undefined;
};
