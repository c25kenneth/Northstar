import { useState } from 'react';

/**
 * Parse Fast Apply format update_block to extract old and new code
 * Fast Apply format typically shows:
 * ... existing code ...
 * // changes/new code here
 * ... existing code ...
 */
const parseUpdateBlock = (updateBlock) => {
  if (!updateBlock || !updateBlock.trim()) {
    return { oldCode: '', newCode: '', hasChanges: false };
  }

  const lines = updateBlock.split('\n');
  const unifiedDiff = []; // Store unified diff entries
  let hasAnyChanges = false;
  
  // First, check if we have unified diff format (lines starting with + or -)
  const hasUnifiedFormat = lines.some(line => {
    const trimmed = line.trim();
    return (trimmed.startsWith('+') || trimmed.startsWith('-')) && 
           !trimmed.startsWith('++') && 
           !trimmed.startsWith('--') &&
           trimmed.length > 1;
  });
  
  if (hasUnifiedFormat) {
    // Parse unified diff format (like GitHub PR)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Skip git diff headers (these shouldn't be in the update_block, but filter them out if present)
      if (trimmed.startsWith('diff --git') || 
          trimmed.startsWith('index ') || 
          trimmed.startsWith('---') || 
          trimmed.startsWith('+++') ||
          trimmed.match(/^@@\s+-?\d+,\d+\s+\+?\d+,\d+\s+@@/)) {
        continue;
      }
      
      // Skip context markers
      if (trimmed.includes('...') && (trimmed.includes('existing') || trimmed.includes('code') || trimmed === '...')) {
        continue;
      }
      
      // Skip comment markers like "// YOUR CHANGES:"
      if (trimmed.toLowerCase().includes('// your') || trimmed.toLowerCase().includes('// changes')) {
        continue;
      }
      
      if (trimmed.startsWith('-') && !trimmed.startsWith('--') && trimmed.length > 1) {
        // Removed line - preserve indentation by removing only the - marker
        // Format: "-    code" or "    - code" - we want to preserve all whitespace
        const dashIndex = line.indexOf('-');
        const afterDash = line.substring(dashIndex + 1);
        // Preserve indentation before the dash marker
        const leadingSpaces = line.substring(0, dashIndex);
        // If the dash is at the start (index 0), afterDash might have indentation we want to keep
        // If dash has leading spaces, afterDash might start with content immediately
        // Let's preserve afterDash as-is (it might already have proper indentation)
        unifiedDiff.push({ type: 'removed', content: leadingSpaces + afterDash, original: line });
        hasAnyChanges = true;
      } else if (trimmed.startsWith('+') && trimmed.length > 1) {
        // Added line - preserve indentation by removing only the + marker
        const plusIndex = line.indexOf('+');
        const afterPlus = line.substring(plusIndex + 1);
        const leadingSpaces = line.substring(0, plusIndex);
        // Preserve afterPlus as-is (it might already have proper indentation)
        unifiedDiff.push({ type: 'added', content: leadingSpaces + afterPlus, original: line });
        hasAnyChanges = true;
      } else if (trimmed.length > 0) {
        // Unchanged line (context) - preserve full line including indentation
        unifiedDiff.push({ type: 'unchanged', content: line, original: line });
      }
    }
    
    // Build old and new code from unified diff
    const oldLines = [];
    const newLines = [];
    
    for (const entry of unifiedDiff) {
      if (entry.type === 'removed' || entry.type === 'unchanged') {
        oldLines.push(entry.content);
      }
      if (entry.type === 'added' || entry.type === 'unchanged') {
        newLines.push(entry.content);
      }
    }
    
    return { 
      oldCode: oldLines.join('\n'), 
      newCode: newLines.join('\n'), 
      hasChanges: hasAnyChanges,
      unifiedDiff // Store for better rendering
    };
  }
  
  // Fallback: Original parsing logic for other formats
  const oldLines = [];
  const newLines = [];
  let contextBefore = [];
  let changes = [];
  let contextAfter = [];
  let state = 'context';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    const isContextMarker = trimmed.includes('...') && (
      trimmed.includes('existing') || 
      trimmed.includes('code') || 
      trimmed === '...' ||
      /^\.{3,}/.test(trimmed)
    );
    
    if (isContextMarker) {
      if (state === 'changes' && changes.length > 0) {
        state = 'after';
      } else if (state === 'context' && contextBefore.length > 0) {
        state = 'changes';
      }
      continue;
    }

    const lowerLine = trimmed.toLowerCase();
    if (lowerLine.includes('// your') || lowerLine.includes('// new') || 
        lowerLine.includes('// add') || lowerLine.includes('// change') ||
        lowerLine.includes('// update') || lowerLine.includes('// replace')) {
      if (state === 'context') {
        state = 'changes';
      }
      continue;
    }

    if (trimmed.startsWith('-') && !trimmed.startsWith('--') && trimmed.length > 1) {
      if (state === 'context') state = 'changes';
      // Preserve indentation by finding the dash and preserving spaces before it
      const dashIndex = line.indexOf('-');
      const afterDash = line.substring(dashIndex + 1);
      const leadingSpaces = line.substring(0, dashIndex);
      // Preserve afterDash as-is to maintain indentation
      oldLines.push(leadingSpaces + afterDash);
      hasAnyChanges = true;
      continue;
    }
    
    if (trimmed.startsWith('+') && trimmed.length > 1) {
      if (state === 'context') state = 'changes';
      // Preserve indentation by finding the plus and preserving spaces before it
      const plusIndex = line.indexOf('+');
      const afterPlus = line.substring(plusIndex + 1);
      const leadingSpaces = line.substring(0, plusIndex);
      // Preserve afterPlus as-is to maintain indentation
      newLines.push(leadingSpaces + afterPlus);
      hasAnyChanges = true;
      continue;
    }

    if (state === 'context') {
      contextBefore.push(line);
    } else if (state === 'changes') {
      changes.push(line);
    } else if (state === 'after') {
      contextAfter.push(line);
    }
  }

  const oldCodeLines = [];
  const newCodeLines = [];

  oldCodeLines.push(...contextBefore);
  newCodeLines.push(...contextBefore);

  if (changes.length > 0) {
    newCodeLines.push(...changes);
    if (oldLines.length > 0) {
      oldCodeLines.push(...oldLines);
    }
  } else if (oldLines.length > 0 || newLines.length > 0) {
    if (oldLines.length > 0) {
      oldCodeLines.push(...oldLines);
    }
    if (newLines.length > 0) {
      newCodeLines.push(...newLines);
    }
  } else {
    newCodeLines.push(...changes);
  }

  oldCodeLines.push(...contextAfter);
  newCodeLines.push(...contextAfter);

  const oldCode = oldCodeLines.join('\n');
  const newCode = newCodeLines.join('\n');
  
  return { oldCode, newCode, hasChanges: oldCode !== newCode || hasAnyChanges };
};

/**
 * Simple line-by-line diff for better visualization
 * This creates a unified diff view
 */
const createUnifiedDiff = (oldCode, newCode) => {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  const diff = [];
  const maxLines = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i] || '';
    const newLine = newLines[i] || '';
    
    if (oldLine === newLine) {
      // Unchanged line
      diff.push({ type: 'unchanged', oldLine, newLine, lineNum: i + 1 });
    } else if (!oldLine && newLine) {
      // Added line
      diff.push({ type: 'added', oldLine: '', newLine, lineNum: i + 1 });
    } else if (oldLine && !newLine) {
      // Removed line
      diff.push({ type: 'removed', oldLine, newLine: '', lineNum: i + 1 });
    } else {
      // Modified line
      diff.push({ type: 'modified', oldLine, newLine, lineNum: i + 1 });
    }
  }

  return diff;
};

const CodeDiff = ({ updateBlock, filePath = null }) => {
  const parsed = parseUpdateBlock(updateBlock);
  const { oldCode, newCode, hasChanges, unifiedDiff } = parsed;
  const [showUnified, setShowUnified] = useState(false); // Default to side-by-side view (old vs new)

  // If we have unified diff format, map it to diff array; otherwise create from old/new code
  const diff = unifiedDiff 
    ? unifiedDiff.map((entry, idx) => ({
        type: entry.type,
        oldLine: entry.type === 'removed' ? entry.content : entry.type === 'unchanged' ? entry.content : '',
        newLine: entry.type === 'added' ? entry.content : entry.type === 'unchanged' ? entry.content : '',
        lineNum: idx + 1
      }))
    : createUnifiedDiff(oldCode, newCode);

  // If there's no clear difference, show the raw update block
  if (!hasChanges && updateBlock) {
    return (
      <div className="rounded-lg bg-[#0A0B1A] border border-white/10 overflow-hidden">
        <div className="bg-[#1A1D3A] px-4 py-2 border-b border-white/10 flex items-center justify-between">
          <span className="text-sm text-gray-400 font-mono">{filePath || 'Code Changes'}</span>
          <span className="text-xs text-gray-500">No diff available - showing raw code</span>
        </div>
        <pre className="p-4 font-mono text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
          {updateBlock}
        </pre>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-[#0A0B1A] border border-white/10 overflow-hidden">
      {/* Header - GitHub Style */}
      <div className="bg-[#1A1D3A] px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path>
          </svg>
          <span className="text-sm text-gray-300 font-mono">{filePath || 'Code Changes'}</span>
        </div>
        <button
          onClick={() => setShowUnified(!showUnified)}
          className="text-xs px-3 py-1.5 rounded-md text-gray-300 hover:bg-white/5 hover:text-white transition-colors border border-white/10"
          title={showUnified ? 'Switch to side-by-side view' : 'Switch to unified diff view'}
        >
          {showUnified ? '↔ Old vs New' : '📋 Unified Diff'}
        </button>
      </div>

      {showUnified ? (
        /* Unified Diff View */
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1A1D3A] border-b border-white/10">
                <th className="px-4 py-2 text-left text-xs text-gray-400 font-mono w-16">Line</th>
                <th className="px-4 py-2 text-left text-xs text-gray-400">Code</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {diff.map((item, idx) => (
                <tr
                  key={idx}
                  className={`
                    ${item.type === 'added' ? 'bg-green-500/10' : ''}
                    ${item.type === 'removed' ? 'bg-red-500/10' : ''}
                    ${item.type === 'modified' ? 'bg-yellow-500/10' : ''}
                    ${item.type === 'unchanged' ? '' : 'border-l-2'}
                    ${item.type === 'added' ? 'border-green-500/30' : ''}
                    ${item.type === 'removed' ? 'border-red-500/30' : ''}
                    ${item.type === 'modified' ? 'border-yellow-500/30' : ''}
                  `}
                >
                  <td className="px-4 py-1 text-xs text-gray-500 text-right border-r border-white/5">
                    {item.lineNum}
                  </td>
                  <td className="px-4 py-1">
                    {item.type === 'removed' && (
                      <span className="text-red-400">
                        <span className="text-red-500 mr-2">-</span>
                        <span className="line-through opacity-70">{item.oldLine}</span>
                      </span>
                    )}
                    {item.type === 'added' && (
                      <span className="text-green-400">
                        <span className="text-green-500 mr-2">+</span>
                        {item.newLine}
                      </span>
                    )}
                    {item.type === 'modified' && (
                      <>
                        <div className="text-red-400">
                          <span className="text-red-500 mr-2">-</span>
                          <span className="line-through opacity-70">{item.oldLine}</span>
                        </div>
                        <div className="text-green-400">
                          <span className="text-green-500 mr-2">+</span>
                          {item.newLine}
                        </div>
                      </>
                    )}
                    {item.type === 'unchanged' && (
                      <span className="text-gray-300">{item.newLine || item.oldLine}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Side-by-Side Diff View - Old vs New */
        <div className="grid grid-cols-2 divide-x divide-white/10 overflow-hidden">
          {/* Old Code (Left Side) */}
          <div className="relative flex flex-col min-h-[300px] max-h-[600px]">
            <div className="sticky top-0 bg-red-500/20 border-b border-red-500/40 px-4 py-3 flex-shrink-0 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-red-300 uppercase tracking-wide">OLD CODE</span>
                <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                  {oldCode.split('\n').filter(l => l.trim()).length} lines
                </span>
              </div>
            </div>
            <div className="overflow-auto flex-1 bg-red-500/5">
              <pre className="p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                {(() => {
                  // Show old code with highlighting for removed/changed lines
                  // IMPORTANT: Show ALL lines, including placeholders for added lines
                  if (unifiedDiff && unifiedDiff.length > 0) {
                    return unifiedDiff.map((entry, idx) => {
                      if (entry.type === 'removed') {
                        return (
                          <span key={idx} className="block bg-red-500/20 border-l-2 border-red-500 pl-2 py-0.5 my-0.5">
                            <span className="text-red-400 line-through opacity-70">{entry.content}</span>
                          </span>
                        );
                      } else if (entry.type === 'unchanged') {
                        return <span key={idx} className="block">{entry.content}{'\n'}</span>;
                      } else if (entry.type === 'added') {
                        // For added lines in old code, show empty space to maintain alignment
                        return <span key={idx} className="block opacity-30 text-gray-500">{'\u00A0'}</span>;
                      }
                      return null;
                    });
                  }
                  
                  // Fallback: show old code as-is - split by lines to preserve all lines
                  if (oldCode) {
                    return oldCode.split('\n').map((line, idx) => (
                      <span key={idx} className="block">{line}{'\n'}</span>
                    ));
                  }
                  return <span className="text-gray-500 italic">No previous code</span>;
                })()}
              </pre>
            </div>
          </div>

          {/* New Code (Right Side) */}
          <div className="relative flex flex-col min-h-[300px] max-h-[600px]">
            <div className="sticky top-0 bg-green-500/20 border-b border-green-500/40 px-4 py-3 flex-shrink-0 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-green-300 uppercase tracking-wide">NEW CODE</span>
                <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                  {newCode.split('\n').filter(l => l.trim()).length} lines
                </span>
              </div>
            </div>
            <div className="overflow-auto flex-1 bg-green-500/5">
              <pre className="p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                {(() => {
                  // Use unifiedDiff if available for accurate change detection
                  // IMPORTANT: Show ALL lines, including placeholders for removed lines
                  if (unifiedDiff && unifiedDiff.length > 0) {
                    return unifiedDiff.map((entry, idx) => {
                      if (entry.type === 'added') {
                        // Highlight added lines
                        return (
                          <span key={idx} className="block bg-green-500/20 border-l-2 border-green-500 pl-2 py-0.5 my-0.5">
                            <span className="text-green-400">{entry.content}</span>
                          </span>
                        );
                      } else if (entry.type === 'unchanged') {
                        // Unchanged line - no highlight
                        return <span key={idx} className="block">{entry.content}{'\n'}</span>;
                      } else if (entry.type === 'removed') {
                        // For removed lines in new code, show empty space to maintain alignment
                        return <span key={idx} className="block opacity-30 text-gray-500">{'\u00A0'}</span>;
                      }
                      return null;
                    });
                  }
                  
                  // Fallback: compare newCode with oldCode line by line
                  // Show ALL lines to avoid truncation
                  const newLines = newCode.split('\n');
                  const oldLines = oldCode.split('\n');
                  const maxLines = Math.max(newLines.length, oldLines.length);
                  
                  return Array.from({ length: maxLines }, (_, idx) => {
                    const line = newLines[idx] || '';
                    const correspondingOldLine = oldLines[idx] || '';
                    // Only highlight if line content is actually different (not just whitespace)
                    const lineContent = line.trim();
                    const oldLineContent = correspondingOldLine.trim();
                    const isActuallyChanged = lineContent && 
                                             oldLineContent && 
                                             lineContent !== oldLineContent;
                    const isNewlyAdded = lineContent && !oldLineContent;
                    
                    if (isActuallyChanged || isNewlyAdded) {
                      // Show changed/added line with highlighting
                      return (
                        <span key={idx} className="block bg-green-500/20 border-l-2 border-green-500 pl-2 py-0.5 my-0.5">
                          <span className="text-green-400">{line}</span>
                        </span>
                      );
                    } else {
                      // Unchanged line or empty - no highlight
                      return <span key={idx} className="block">{line}{'\n'}</span>;
                    }
                  });
                })()}
                {newCode.split('\n').length === 0 && (
                  <span className="text-gray-500 italic">No code changes</span>
                )}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeDiff;

