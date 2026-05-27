/* eslint-disable @next/next/no-html-link-for-pages */
/// <reference types="react" />
import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VedaAI - AI Assessment Creator',
  description: 'Create AI-powered assessments and question papers',
  icons: {
    icon: '/logo.avif',
    apple: '/logo.avif',
  },
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return React.createElement(
    'html',
    { lang: 'en' },
    React.createElement('body', null, props.children)
  );
}
