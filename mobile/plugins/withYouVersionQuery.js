const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withYouVersionQuery(config) {
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
};
