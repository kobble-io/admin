// @ts-check`

/** @type { import('denoify/lib/config/parseParams').DenoifyParams } */
const config = {
  out: 'deno_dist',
  ports: {
    jose: 'https://deno.land/x/jose@v5.2.4/index.ts',
  },
};

module.exports = config;
