import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import theme from "./theme";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import TreeViewPlugin from "./plugins/tree";

const initialConfig = {
  namespace: "MyEditor",
  theme,
  onError(error: Error) {
    throw error;
  },
};

function Editor() {
  return (
    <div>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <div className="editor-scroller">
              <div className="editor">
                <ContentEditable
                  aria-placeholder="Write something"
                  placeholder={<span>Write something</span>}
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />{" "}
        <HistoryPlugin />
        <OnChangePlugin onChange={console.log} />
        <TreeViewPlugin />
      </LexicalComposer>
    </div>
  );
}

function Transformed() {
  return <div>Transformed</div>;
}

function App() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Editor />
      <Transformed />
    </div>
  );
}

export default App;
