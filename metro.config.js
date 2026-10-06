// eslint-disable-next-line no-undef
const { getDefaultConfig } = require("expo/metro-config");

// eslint-disable-next-line no-undef
const config = getDefaultConfig(__dirname);

// chatpack-expo and @chatpack/client use package.json "exports" (e.g. the
// "./react" subpath). Enable Metro's package-exports resolution to honor it.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
