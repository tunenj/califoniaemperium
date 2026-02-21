module.exports = function (api) {
  api.cache(true);
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  const plugins = [
    'react-native-reanimated/plugin',
  ];
  
  // Remove console.log in production
  if (isProduction) {
    plugins.push('transform-remove-console');
  }
  
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins,
  };
};