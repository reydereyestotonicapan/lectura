const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Pods que AppCheckCore (arrastrado por GoogleSignIn) necesita como modular headers
// para poder integrarse como static library. Sin esto, `pod install` falla en EAS
// con: "The Swift pod `AppCheckCore` depends upon `GoogleUtilities` and `RecaptchaInterop`,
// which do not define modules."
const MODULAR_HEADER_PODS = ['GoogleUtilities', 'RecaptchaInterop'];

module.exports = function withModularHeaders(config) {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile'
      );
      let contents = fs.readFileSync(podfilePath, 'utf8');

      const podLines = MODULAR_HEADER_PODS.map(
        (name) => `  pod '${name}', :modular_headers => true`
      );

      // Insertar justo después de `use_expo_modules!`, evitando duplicados.
      const anchor = 'use_expo_modules!';
      if (contents.includes(anchor) && !contents.includes(podLines[0].trim())) {
        contents = contents.replace(
          anchor,
          `${anchor}\n${podLines.join('\n')}`
        );
        fs.writeFileSync(podfilePath, contents);
      }

      return config;
    },
  ]);
};
