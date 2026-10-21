module.exports = {
  ci: {
    collect: {
      url: ['http://127.0.0.1:4321/'],
      numberOfRuns: 2,
      settings: {
        preset: 'desktop',
        chromeFlags: '--headless=new --no-sandbox --disable-gpu',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.88 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './artifacts/lighthouse/desktop',
    },
  },
};
