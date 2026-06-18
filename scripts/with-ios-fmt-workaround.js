const { withPodfile } = require('@expo/config-plugins');

const MARKER = '# FR3SH: Xcode fmt consteval workaround';
const SNIPPET = `
    ${MARKER}
    fmt_base = File.join(installer.sandbox.root.to_s, 'fmt/include/fmt/base.h')
    if File.exist?(fmt_base)
      fmt_contents = File.read(fmt_base)
      patched_fmt_contents = fmt_contents.gsub('#  define FMT_USE_CONSTEVAL 1', '#  define FMT_USE_CONSTEVAL 0')
      if patched_fmt_contents != fmt_contents
        File.chmod(0644, fmt_base) rescue nil
        File.write(fmt_base, patched_fmt_contents)
      end
    end

    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        definitions = config.build_settings['GCC_PREPROCESSOR_DEFINITIONS']
        definitions = ['$(inherited)'] if definitions.nil?
        definitions = [definitions] if definitions.is_a?(String)
        definitions << 'FMT_USE_CONSTEVAL=0' unless definitions.include?('FMT_USE_CONSTEVAL=0')
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = definitions
      end
    end
`;

function addFmtWorkaround(contents) {
  if (contents.includes(MARKER)) {
    return contents;
  }

  const anchor = `    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      :ccache_enabled => podfile_properties['apple.ccacheEnabled'] == 'true',
    )
`;

  if (!contents.includes(anchor)) {
    return contents;
  }

  return contents.replace(anchor, `${anchor}${SNIPPET}`);
}

module.exports = function withIosFmtWorkaround(config) {
  return withPodfile(config, (config) => {
    config.modResults.contents = addFmtWorkaround(config.modResults.contents);
    return config;
  });
};
