import React from 'react';
import * as Client from 'react-dom/client';
import { flushSync, createPortal } from 'react-dom';
window.React = React;
window.ReactDOM = { ...Client, flushSync, createPortal };
