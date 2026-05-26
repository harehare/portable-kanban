import * as React from 'react';
import { getBackend } from '../../backend';

const URL_REGEX = /https?:\/\/[^\s<>"']+/g;

const linkifyText = (text: string, onOpenUrl: (url: string) => void): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  URL_REGEX.lastIndex = 0;
  // eslint-disable-next-line no-cond-assign
  while ((match = URL_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const url = match[0];
    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          onOpenUrl(url);
        }}
      >
        {url}
      </a>,
    );
    lastIndex = match.index + url.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
};

const linkifyNode = (node: React.ReactNode, onOpenUrl: (url: string) => void): React.ReactNode => {
  if (typeof node === 'string') {
    return linkifyText(node, onOpenUrl);
  }
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    const children = React.Children.map(el.props.children, (child) =>
      linkifyNode(child, onOpenUrl),
    );
    return React.cloneElement(el, { ...el.props }, ...(children ?? []));
  }
  return node;
};

type Props = {
  child: React.ReactElement;
};

export const Linkify = ({ child }: Props) => {
  const onOpenUrl = (url: string) => getBackend().openUrl(url);
  return <>{linkifyNode(child, onOpenUrl)}</>;
};
