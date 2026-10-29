export type CodeLanguage =
  | 'typescript'
  | 'html'
  | 'css'
  | 'scss'
  | 'json'
  | 'yaml'
  | 'shell'
  | 'text';

/** Content of one displayed example. Expansion and other display settings belong to the block. */
export interface CodeSnippet {
  readonly code: string;
  readonly language: CodeLanguage;
  readonly fileName?: string;
}
