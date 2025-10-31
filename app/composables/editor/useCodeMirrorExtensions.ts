import { javascript } from "@codemirror/lang-javascript";
import { vue } from "@codemirror/lang-vue";
import { html } from "@codemirror/lang-html";
import { linter, lintGutter } from "@codemirror/lint";
import * as acorn from "acorn";
import * as walk from "acorn-walk";
import {
  lineNumbers,
  highlightActiveLine,
  keymap,
  EditorView,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  Decoration,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import type { DecorationSet } from "@codemirror/view";
import { RangeSetBuilder, StateField, StateEffect } from "@codemirror/state";
import {
  indentWithTab,
  history,
  defaultKeymap,
  historyKeymap,
  insertNewlineAndIndent,
} from "@codemirror/commands";
import {
  closeBrackets,
  closeBracketsKeymap,
  autocompletion,
  completionKeymap,
} from "@codemirror/autocomplete";
import {
  bracketMatching,
  indentUnit,
  foldGutter,
  foldKeymap,
  indentOnInput,
  indentService,
} from "@codemirror/language";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";

export function useCodeMirrorExtensions() {
  function buildEnfyraDecorations(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>()
    const doc = view.state.doc

    const templateDecoration = Decoration.mark({
      tagName: "span",
      class: "cm-enfyra-template",
      attributes: {
        style: "color: #4EC9B0 !important; font-weight: bold !important; background: transparent !important;"
      }
    })

    const tableAccessDecoration = Decoration.mark({
      tagName: "span",
      class: "cm-enfyra-table",
      attributes: {
        style: "color: #DCDCAA !important; font-weight: bold !important; background: transparent !important;"
      }
    })

    const percentageDecoration = Decoration.mark({
      tagName: "span",
      class: "cm-enfyra-percentage",
      attributes: {
        style: "color: #C586C0 !important; font-weight: bold !important; background: transparent !important;"
      }
    })

    for (let i = 1; i <= doc.lines; i++) {
      const line = doc.line(i)
      const text = line.text

      const templateRegex = /@(CACHE|REPOS|HELPERS|LOGS|ERRORS|BODY|DATA|STATUS|PARAMS|QUERY|USER|REQ|RES|SHARE|API|UPLOADED|THROW)\b/g
      let match
      while ((match = templateRegex.exec(text)) !== null) {
        builder.add(line.from + match.index, line.from + match.index + match[0].length, templateDecoration)
      }

      const tableRegex = /#([a-zA-Z_][a-zA-Z0-9_]*)\b/g
      while ((match = tableRegex.exec(text)) !== null) {
        builder.add(line.from + match.index, line.from + match.index + match[0].length, tableAccessDecoration)
      }

      const percentageRegex = /%([a-zA-Z_][a-zA-Z0-9_]*)\b/g
      while ((match = percentageRegex.exec(text)) !== null) {
        builder.add(line.from + match.index, line.from + match.index + match[0].length, percentageDecoration)
      }
    }

    return builder.finish()
  }

  const enfyraSyntaxPlugin = StateField.define<DecorationSet>({
    create(state) {
      return buildEnfyraDecorations({ state } as any)
    },
    update(decorations, transaction) {
      if (transaction.docChanged) {
        return buildEnfyraDecorations({ state: transaction.state } as any)
      }
      return decorations.map(transaction.changes)
    },
    provide: f => EditorView.decorations.from(f)
  })

  const vueIndentService = indentService.of((context, pos) => {
    const doc = context.state.doc;
    
    let checkPos = pos - 1;
    let prevLineText = '';
    let actualPrevLine = null;
    
    while (checkPos > 0) {
      const lineAtPos = doc.lineAt(checkPos);
      const lineText = lineAtPos.text.trim();
      
      if (lineText !== '') {
        prevLineText = lineAtPos.text;
        actualPrevLine = lineAtPos;
        break;
      }
      checkPos = lineAtPos.from - 1;
    }
    
    if (prevLineText.trim().match(/^<script[^>]*>$/)) {
      return 0; // No indent after <script>
    }
    
    const trimmedPrev = prevLineText.trim();
    const rootLevelPatterns = [
      /^(import|export|const|let|var|function|class)\b/,
      /^\/\//,  // comments
      /^\/\*/,  // block comments
    ];
    
    const isRootLevel = rootLevelPatterns.some(pattern => pattern.test(trimmedPrev)) 
                       && !trimmedPrev.includes('{') 
                       && !trimmedPrev.endsWith('{')
                       && !trimmedPrev.includes('(');
    
    if (isRootLevel) {
      return 0; // No indent for root level statements
    }
    
    const baseIndent = /^\s*/.exec(prevLineText)?.[0]?.length || 0;
    
    const trimmed = prevLineText.trim();
    const shouldIndent = trimmed.endsWith('{') || 
                         trimmed.endsWith('(') ||
                         /\b(if|for|while|function)\s*\([^)]*\)\s*{$/.test(trimmed) ||
                         /^function\s+\w+\s*\([^)]*\)\s*{/.test(trimmed);
    
    if (shouldIndent) {
      return baseIndent + 2; // Indent inside blocks
    }
    
    return baseIndent; // Keep same level
  });

  function getLanguageExtension(language?: "javascript" | "vue" | "json" | "html" | "typescript") {
    switch (language) {
      case "vue":
        return vue();
      case "html":
        return html();
      case "javascript":
      default:
        return javascript({ jsx: true, typescript: false });
    }
  }

  const createLinter = (language?: "javascript" | "vue" | "json" | "html" | "typescript", onDiagnostics?: (diags: any[]) => void) => {
    return linter((view) => {
      const diagnostics: any[] = [];
      const text = view.state.doc.toString();
      
      if (language === 'json' || language === 'html') {
        if (onDiagnostics) {
          onDiagnostics(diagnostics);
        }
        return diagnostics;
      }
      
      let codeToLint = text;
      let offset = 0;
      
      if (language === 'vue') {
        const scriptMatch = text.match(/<script[^>]*>([\s\S]*?)<\/script>/);
        if (!scriptMatch) {
          if (onDiagnostics) {
            onDiagnostics(diagnostics);
          }
          return diagnostics;
        }

        codeToLint = scriptMatch[1] || '';
        offset = text.indexOf(scriptMatch[1] || '');
      }
      
      const hasEnfyraSyntax = /@/.test(codeToLint) ||
                             /#/.test(codeToLint) ||
                             /%/.test(codeToLint);

      if (hasEnfyraSyntax) {
        if (onDiagnostics) {
          onDiagnostics(diagnostics);
        }
        return diagnostics;
      }
      
      try {
        const parseOptions: any = {
          ecmaVersion: 2022,
          sourceType: "module",
          locations: true,
          onComment: undefined,
          allowAwaitOutsideFunction: true,
        };
        
        if (language === 'javascript') {
          parseOptions.sourceType = "script"; // script mode allows return at root
          parseOptions.allowReturnOutsideFunction = true;
        }
        
        const ast = acorn.parse(codeToLint, parseOptions);
        
        const constVars = new Set<string>();
        
        walk.simple(ast, {
          VariableDeclaration(node: any) {
            if (node.kind === 'const') {
              for (const decl of node.declarations) {
                if (decl.id.type === 'Identifier') {
                  constVars.add(decl.id.name);
                }
              }
            }
          },
          AssignmentExpression(node: any) {
            if (node.left.type === 'Identifier' && constVars.has(node.left.name)) {
              diagnostics.push({
                from: node.left.start + offset,
                to: node.left.end + offset,
                severity: 'error',
                message: `Cannot assign to const variable '${node.left.name}'`,
              });
            }
          },
          UpdateExpression(node: any) {
            if (node.argument.type === 'Identifier' && constVars.has(node.argument.name)) {
              diagnostics.push({
                from: node.start + offset,
                to: node.end + offset,
                severity: 'error',
                message: `Cannot update const variable '${node.argument.name}'`,
              });
            }
          }
        });
        
      } catch (error: any) {
        if (error.loc) {
          const errorPos = offset + (error.pos || 0);
          diagnostics.push({
            from: errorPos,
            to: errorPos + 1,
            severity: 'error',
            message: error.message.replace(/\s*\(\d+:\d+\)$/, ''),
          });
        }
      }
      
      if (onDiagnostics) {
        onDiagnostics(diagnostics);
      }
      
      return diagnostics;
    });
  };

  const getBasicSetup = (language?: "javascript" | "vue" | "json" | "html" | "typescript", onDiagnostics?: (diags: any[]) => void) => {
    const setup = [
      lineNumbers(),
      highlightActiveLine(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      rectangularSelection(),
      crosshairCursor(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      highlightSelectionMatches(),
      indentUnit.of("  "),
      createLinter(language, onDiagnostics),
      lintGutter(),
      keymap.of([
        {
          key: "Enter",
          run: (view) => {
            const state = view.state;
            const pos = state.selection.main.head;
            const before = state.doc.sliceString(pos - 1, pos);
            const after = state.doc.sliceString(pos, pos + 1);

            const pairs = [
              { open: '{', close: '}' },
              { open: '[', close: ']' },
              { open: '(', close: ')' },
            ];

            for (const pair of pairs) {
              if (before === pair.open && after === pair.close) {
                const line = state.doc.lineAt(pos);
                const currentIndent = /^\s*/.exec(line.text)?.[0] || '';
                const indent = currentIndent + '  '; // Add 2 spaces

                view.dispatch({
                  changes: {
                    from: pos,
                    to: pos,
                    insert: '\n' + indent + '\n' + currentIndent
                  },
                  selection: { anchor: pos + 1 + indent.length }
                });
                return true;
              }
            }

            return insertNewlineAndIndent(view);
          },
        },
        {
          key: "Backspace",
          run: (view) => {
            const state = view.state;
            const pos = state.selection.main.head;
            const line = state.doc.lineAt(pos);

            if (line.text.trim() === '' && line.text.length > 0 && pos === line.to && line.number > 1) {
              const prevLine = state.doc.line(line.number - 1);
              const nextLine = line.number < state.doc.lines ? state.doc.line(line.number + 1) : null;

              if (prevLine && nextLine) {
                const prevTrimmed = prevLine.text.trim();
                const nextTrimmed = nextLine.text.trim();

                if ((prevTrimmed.endsWith('{') && nextTrimmed === '}') ||
                    (prevTrimmed.endsWith('[') && nextTrimmed === ']') ||
                    (prevTrimmed.endsWith('(') && nextTrimmed === ')')) {
                  view.dispatch({
                    changes: { from: prevLine.to, to: nextLine.from, insert: '' }
                  });
                  return true;
                }
              }
            }
            return false;
          },
        },
        indentWithTab,
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...searchKeymap,
      ]),
    ];
    
    if (language === 'vue') {
      setup.push(vueIndentService);
    } else if (language === 'javascript' || language === 'html' || language === 'json') {
      setup.push(indentOnInput());
    }
    
    return setup;
  };

  return {
    getLanguageExtension,
    createLinter,
    getBasicSetup,
    enfyraSyntaxPlugin, // Export plugin separately for proper ordering
    basicSetup: getBasicSetup("javascript"), // Default for backward compatibility
  };
}