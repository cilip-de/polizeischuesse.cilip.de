/** @type {import('next').NextConfig} */

// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require("@sentry/nextjs");

const moduleExports = {
  poweredByHeader: false,
  reactStrictMode: true,
  headers() {
    return [
      {
        source: "/:path*{/}?",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=900, stale-while-revalidate=3600",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // {
          //   key: "Content-Security-Policy",
          //   value: "default-src https: 'unsafe-inline'",
          // },
          {
            key: "X-Frame-Options",
            value: "deny",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/og-viz.png",
        destination: "/api/og-viz",
      },
      {
        source: "/api/og-case.png",
        destination: "/api/og-case",
      },
    ];
  },
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.

  org: "johannes-filter",
  project: "polizeischuesse",
  token: process.env.SENTRY_TOKEN,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,
  sourceMaps: { disable: true },

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
