import React from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

interface CodeEditorProps {
  value: string
  onChange: (val: string) => void
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange }) => (
  <CodeMirror
    value={value}
    height="200px"
    extensions={[javascript()]}
    theme={oneDark}
    onChange={onChange}
  />
)

export default CodeEditor
