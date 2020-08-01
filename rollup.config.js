import dts from 'rollup-plugin-dts';

export default [
    {
        input: 'dist/src/index.js',
        output: {
            file: 'dist/index.js'
        },
    },
    {
        input: 'dist/src/index.d.ts',
        output: {
            file: 'dist/index.d.ts'
        },
        plugins: [dts()]
    }
]