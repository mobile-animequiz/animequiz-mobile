module.exports = ({ config }) => {
  // Android uses autolinking and the OAuth Android package/SHA-1 registration.
  // The upstream config plugin supplies the additional iOS URL scheme when configured.
  const iosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME;
  if (iosUrlScheme) config.plugins = [...(config.plugins ?? []), ['@react-native-google-signin/google-signin', { iosUrlScheme }]];
  return config;
};
