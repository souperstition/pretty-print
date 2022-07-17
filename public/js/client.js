/* global TrelloPowerUp */

const LIGHT_ICON = 'https://itsdani.me/images/pretty-print-icon.svg';
const DARK_ICON = 'https://itsdani.me/images/pretty-print-icon.svg';

TrelloPowerUp.initialize({
  'board-buttons': (t, options) => {
    return [{
      icon: {
        dark: LIGHT_ICON,
        light: DARK_ICON
      },
      text: 'Pretty Print',
      callback: (t) => {
        return t.modal({
          title: "Pretty Print",
          url: '../print.html',
          fullscreen: true,
          accentColor: '#00C2E0'
        });
      }
    }];
  }
});
