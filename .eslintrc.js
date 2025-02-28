module.exports = {
  root: true,
  extends: ['plugin:@next/next/recommended', '@payloadcms'],
  ignorePatterns: [
    '**/payload-types.ts',
    'src/payload/collections/Orders/hooks/utilities/recieptTemplate.html', // Add this line
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'no-console': 'off',
    'import/order': 'off',
    'simple-import-sort/imports': 'off',
  },
}
