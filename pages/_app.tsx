import React from 'react';
import { AppProps } from 'next/app';
import { FeedbackPage } from './feedback';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;