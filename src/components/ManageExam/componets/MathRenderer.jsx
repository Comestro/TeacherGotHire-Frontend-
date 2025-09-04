import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

// Heuristic: decide if a string looks like TeX (contains \commands, ^, _, \frac, braces)
const looksLikeTeX = (s) => {
  if (!s || typeof s !== 'string') return false;
  // If contains $ or $$ it's already handled elsewhere
  if (/\$/.test(s)) return false;
  // Common TeX commands or patterns
  if (/\\(frac|int|sum|lim|sqrt|alpha|beta|gamma|pi|sin|cos|tan)\b/.test(s)) return true;
  if (/\\[a-zA-Z]+/.test(s)) return true; // any backslash command
  if (/\^{|_\{/.test(s)) return true; // superscript/subscript with braces
  if (/\^\w|_\w/.test(s)) return true; // simple sup/sub
  if (/\{|\}/.test(s)) return true;
  return false;
};

// MathRenderer: renders mixed text containing $$...$$ (display) and $...$ (inline)
const MathRenderer = ({ text }) => {
  if (!text) return null;

  // If the entire text looks like TeX (user entered raw LaTeX without $), render as BlockMath
  const trimmed = text.trim();
  if (looksLikeTeX(trimmed)) {
    return <BlockMath>{trimmed}</BlockMath>;
  }

  // Split on display math $$...$$ first (use [\s\S] to match newlines reliably)
  const displayParts = text.split(/(\$\$[\s\S]*?\$\$)/g);

  return (
    <>
      {displayParts.map((part, i) => {
        if (!part) return null;
        const displayMatch = part.match(/^\$\$([\s\S]*?)\$\$$/);
        if (displayMatch) {
          return <BlockMath key={`d-${i}`}>{displayMatch[1]}</BlockMath>;
        }

        // For non-display parts, split inline $...$
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
