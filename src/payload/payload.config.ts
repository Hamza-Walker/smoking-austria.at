import BeforeDashboard from './components/BeforeDashboard';
import BeforeLogin from './components/BeforeLogin';
import Categories from './collections/Categories';
import { Footer } from './globals/Footer';
import type { GenerateTitle } from '@payloadcms/plugin-seo/types';
import { Header } from './globals/Header';
import { Media } from './collections/Media';
import { Orders } from './collections/Orders';
import { Pages } from './collections/Pages';
import Products from './collections/Products';
import { Settings } from './globals/Settings';
import Users from './collections/Users';
import type { Configuration as WebpackConfig } from 'webpack';
import { buildConfig } from 'payload/config';
import { createPaymentIntent } from './endpoints/create-payment-intent';
import { customersProxy } from './endpoints/customers';
import dotenv from 'dotenv'; // Correct import for dotenv
import { merge } from 'webpack-merge';
import nestedDocs from '@payloadcms/plugin-nested-docs';
import path from 'path';
import { payloadCloud } from '@payloadcms/plugin-cloud';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { priceUpdated } from './stripe/webhooks/priceUpdated';
import { productUpdated } from './stripe/webhooks/productUpdated';
import { productsProxy } from './endpoints/products';
import redirects from '@payloadcms/plugin-redirects';
import { seed } from './endpoints/seed';
import seo from '@payloadcms/plugin-seo';
import { slateEditor } from '@payloadcms/richtext-slate';
import stripePlugin from '@payloadcms/plugin-stripe';
import { webpackBundler } from '@payloadcms/bundler-webpack';

const generateTitle: GenerateTitle = () => {
  return 'My Store';
};

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

const mockModulePath = path.resolve(__dirname, './emptyModuleMock.js');

const customWebpackConfig: WebpackConfig = {
  resolve: {
    fallback: {
      assert: require.resolve('assert/'),
      url: require.resolve('url/'),
      os: require.resolve('os-browserify/browser'),
      fs: false,
      child_process: false,
    },
    alias: {
      dotenv: path.resolve(__dirname, './dotenv.js'),
      [path.resolve(__dirname, 'collections/Products/hooks/beforeChange')]: mockModulePath,
      [path.resolve(__dirname, 'collections/Users/hooks/createStripeCustomer')]: mockModulePath,
      [path.resolve(__dirname, 'collections/Users/endpoints/customer')]: mockModulePath,
      [path.resolve(__dirname, 'endpoints/create-payment-intent')]: mockModulePath,
      [path.resolve(__dirname, 'endpoints/customers')]: mockModulePath,
      [path.resolve(__dirname, 'endpoints/products')]: mockModulePath,
      [path.resolve(__dirname, 'endpoints/seed')]: mockModulePath,
      stripe: mockModulePath,
      express: mockModulePath,
    },
  },
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
};

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
    components: {
      beforeLogin: [BeforeLogin],
      beforeDashboard: [BeforeDashboard],
    },
    webpack: config => merge(config, customWebpackConfig),
  },
  editor: slateEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  collections: [Pages, Products, Orders, Media, Categories, Users],
  globals: [Settings, Header, Footer],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  cors: ['https://checkout.stripe.com', process.env.PAYLOAD_PUBLIC_SERVER_URL || ''].filter(Boolean),
  csrf: ['https://checkout.stripe.com', process.env.PAYLOAD_PUBLIC_SERVER_URL || ''].filter(Boolean),
  endpoints: [
    {
      path: '/create-payment-intent',
      method: 'post',
      handler: createPaymentIntent,
    },
    {
      path: '/stripe/customers',
      method: 'get',
      handler: customersProxy,
    },
    {
      path: '/stripe/products',
      method: 'get',
      handler: productsProxy,
    },
    {
      path: '/seed',
      method: 'get',
      handler: seed,
    },
  ],
  plugins: [
    stripePlugin({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
      isTestKey: Boolean(process.env.PAYLOAD_PUBLIC_STRIPE_IS_TEST_KEY),
      stripeWebhooksEndpointSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET,
      rest: false,
      webhooks: {
        'product.created': productUpdated,
        'product.updated': productUpdated,
        'price.updated': priceUpdated,
      },
    }),
    redirects({
      collections: ['pages', 'products'],
    }),
    nestedDocs({
      collections: ['categories'],
    }),
    seo({
      collections: ['pages', 'products'],
      generateTitle,
      uploadsCollection: 'media',
    }),
    payloadCloud(),
  ],
})
