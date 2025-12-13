import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
const looksLikeTeX = (s) => {
  if (!s || typeof s !== 'string') return false;
  if (/\$/.test(s)) return false;
  if (/\\(frac|int|sum|lim|sqrt|alpha|beta|gamma|pi|sin|cos|tan)\b/.test(s)) return true;
  if (/\\[a-zA-Z]+/.test(s)) return true; // any backslash command
  if (/\^{|_\{/.test(s)) return true; // superscript/subscript with braces
  if (/\^\w|_\w/.test(s)) return true; // simple sup/sub
  if (/\{|\}/.test(s)) return true;
  return false;
};
const MathRenderer = ({ text }) => {
  if (!text) return null;
  const trimmed = text.trim();
  if (looksLikeTeX(trimmed)) {
    return <BlockMath>{trimmed}</BlockMath>;
  }
  const displayParts = text.split(/(\$\$[\s\S]*?\$\$)/g);

  return (
    <>
      {displayParts.map((part, i) => {
        if (!part) return null;
        const displayMatch = part.match(/^\$\$([\s\S]*?)\$\$$/);
        if (displayMatch) {
          return <BlockMath key={`d-${i}`}>{displayMatch[1]}</BlockMath>;
        }
        const inlineParts = part.split(/(\$[^$]+\$)/g);
        return (
          <React.Fragment key={`p-${i}`}>
            {inlineParts.map((p, j) => {
              if (!p) return null;
              const inlineMatch = p.match(/^\$([^$]+)\$$/);
              if (inlineMatch) {
                return <InlineMath key={`i-${i}-${j}`}>{inlineMatch[1]}</InlineMath>;
              }
              return <span key={`t-${i}-${j}`}>{p}</span>;
            })}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default MathRenderer;
