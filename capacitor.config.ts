import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.socialelite.app',
  appName: 'SocialElite',
  webDir: '.',
  bundledWebRuntime: false,

  server: {
    url: 'https://socialelite.pages.dev',
    cleartext: false
  },

  android: {
    allowMixedContent: false
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#071220",
      androidSplashResourceName: "splash",
      showSpinner: false
    },

    StatusBar: {
      style: "DARK",
      backgroundColor: "#071220"
    }
  }
};

export default config;
