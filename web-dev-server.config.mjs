import {fromRollup} from '@web/dev-server-rollup';
import rollupCommonjs from '@rollup/plugin-commonjs';

const commonjs = fromRollup(rollupCommonjs);

export default {
  plugins: [
    commonjs({
      exclude: ['src', 'dist', 'instrumented']
    })
  ]
};
