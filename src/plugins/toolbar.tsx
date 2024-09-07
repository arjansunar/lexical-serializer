import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $getRoot, $getSelection, $isRangeSelection, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, REDO_COMMAND, SELECTION_CHANGE_COMMAND, UNDO_COMMAND } from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";

const LowPriority = 1;
export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);


  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));

    }
  }, []);



  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, $updateToolbar]);




  return (
    <div className="flex items-center gap-0.5" ref={toolbarRef}>
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        aria-label="Undo"
      ></button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        aria-label="Redo"
      ></button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        data-active={isBold}
        aria-label="Format Bold"
      ></button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        data-active={isItalic}
        aria-label="Format Italics"
      ></button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        data-active={isUnderline}
        aria-label="Format Underline"
      ></button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        data-active={isStrikethrough}
        aria-label="Format Strikethrough"
      ></button>

      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        }}
        aria-label="Left Align"
      ></button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
        aria-label="Center Align"
      ></button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
        aria-label="Right Align"
      ></button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        }}
        aria-label="Justify Align"
      >justify</button>

      <HtmlViewer />
    </div>
  );
}

function HtmlViewer() {
  const [editor] = useLexicalComposerContext();
  const [showHtml, controls] = useDisclosure();
  const handleHtmlToggle = useCallback(() => {
    editor.update(() => {
      const root = $getRoot();
      const firstChild = root.getFirstChild();
      if (showHtml) {
        // Convert to html
        const html = $generateHtmlFromNodes(editor, null);
        root
          .clear()
          .append($createCodeNode("html").append($createTextNode(html)));
      } else {
        if (!firstChild) {
          return;
        }
        // Convert from html
        // In the browser you can use the native DOMParser API to parse the HTML string.
        const parser = new DOMParser();
        const dom = parser.parseFromString(
          firstChild.getTextContent(),
          "text/html"
        );
        // Once you have the DOM instance it's easy to generate LexicalNodes.
        const nodes = $generateNodesFromDOM(editor, dom);
        root.clear().select();
        $insertNodes(nodes);
      }
    });
  }, [editor, showHtml]);

  useEffect(() => {
    handleHtmlToggle();
  }, [handleHtmlToggle, showHtml]);

  return <button onClick={controls.toggle}>HTML</button>;
}
