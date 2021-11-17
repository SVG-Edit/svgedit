// eslint-disable-next-line node/no-unpublished-import
import { fromRollup } from '@web/dev-server-rollup';
// eslint-disable-next-line node/no-unpublished-import
import rollupCommonjs from '@rollup/plugin-commonjs';

const commonjs = fromRollup(rollupCommonjs);

export default {
  plugins: [
    commonjs({
      // explicitely list packages to increase performance
      include: [
        '**/node_modules/rgbcolor/**/*',
        '**/node_modules/raf/**/*',
        '**/node_modules/font-family-papandreou/**/*',
        '**/node_modules/svgpath/**/*',
        '**/node_modules/cssesc/**/*',
        '**/node_modules/core-js/**/*',
        '**/node_modules/performance-now/**/*'
      ]
    })
  ]
};
