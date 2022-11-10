import * as React from 'react';
import ReactLinkify from 'react-linkify';

import { vscode } from '../../../vscode';

type Props = {
  child: React.ReactElement;
};

export const Linkify = ({ child }: Props) => {
  return (
    <ReactLinkify
      componentDecorator={(decoratedHref, decoratedText, key) => (
        <a
          target="_blank"
          href={decoratedHref}
          key={key}
          rel="noopener noreferrer"
          onClick={() => {
            vscode.postMessage({
              type: 'open',
              url: decoratedHref,
            });
          }}>
          {decoratedText}
        </a>
      )}>
      {child}
    </ReactLinkify>
  );
};
