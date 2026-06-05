const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

function withYouVersionAndroid(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (!manifest.queries) {
      manifest.queries = [{}];
    }

    const queries = manifest.queries[0];

    if (!queries.intent) {
      queries.intent = [];
    }

    const alreadyAdded = queries.intent.some(
      (intent) => intent.data?.[0]?.['$']?.['android:scheme'] === 'youversion'
    );

    if (!alreadyAdded) {
      queries.intent.push({
        action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
        data: [{ $: { 'android:scheme': 'youversion' } }],
      });
    }

    return config;
  });
}

function withYouVersionIos(config) {
  return withInfoPlist(config, (config) => {
    const plist = config.modResults;

    if (!Array.isArray(plist.LSApplicationQueriesSchemes)) {
      plist.LSApplicationQueriesSchemes = [];
    }

    if (!plist.LSApplicationQueriesSchemes.includes('youversion')) {
      plist.LSApplicationQueriesSchemes.push('youversion');
    }

    return config;
  });
}

module.exports = function withYouVersionQuery(config) {
  config = withYouVersionAndroid(config);
  config = withYouVersionIos(config);
  return config;
};
