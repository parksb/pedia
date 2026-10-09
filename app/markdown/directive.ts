import type MarkdownIt from "markdown-it";

type InlineState = InstanceType<MarkdownIt["inline"]["State"]>;
type DirectiveAttributes = Readonly<Record<string, string>>;
type Directives = Readonly<Record<string, DirectiveDefinition>>;

export interface DirectiveDefinition {
  attributes: readonly string[];
  positional?: readonly string[];
  required?: readonly string[];
  validate?: (attributes: DirectiveAttributes) => boolean;
  emit: (attributes: DirectiveAttributes, output: DirectiveOutput) => void;
}

interface DirectiveOutput {
  text: (value: string) => void;
  open: (tag: string, attributes?: Readonly<Record<string, string>>) => void;
  close: (tag: string) => void;
}

interface ArgumentState {
  md: MarkdownIt;
  source: string;
  position: number;
  limit: number;
  definition: DirectiveDefinition;
  attributes: Record<string, string>;
  positionalIndex: number;
  hasNamedArguments: boolean;
}

export function directivePlugin(md: MarkdownIt, directives: Directives): void {
  md.inline.ruler.before("text", "directive", (state, silent) => {
    const directive = parseDirective(state, directives);

    if (!directive) {
      return false;
    }

    if (!silent) {
      const output = createDirectiveOutput(state);
      directive.definition.emit(directive.attributes, output);
    }

    state.pos = directive.end;

    return true;
  });
}

function parseDirective(state: InlineState, directives: Directives) {
  if (state.src[state.pos] !== "@") {
    return null;
  }

  const limit = findLineEnd(state.src, state.pos, state.posMax);
  const opening = readDirectiveOpening(state.src, state.pos, limit, directives);

  if (!opening) {
    return null;
  }

  const argumentsResult = parseArguments({
    md: state.md,
    source: state.src,
    position: opening.argumentsStart,
    limit,
    definition: opening.definition,
    attributes: Object.create(null),
    positionalIndex: 0,
    hasNamedArguments: false,
  });

  if (!argumentsResult) {
    return null;
  }

  return { ...argumentsResult, definition: opening.definition };
}

function findLineEnd(source: string, start: number, maximum: number): number {
  const newline = source.indexOf("\n", start);

  if (newline < 0) {
    return maximum;
  }

  return Math.min(newline, maximum);
}

function readDirectiveOpening(
  source: string,
  start: number,
  limit: number,
  directives: Directives,
) {
  const opening = /^@([A-Za-z][\w-]*)\{/.exec(source.slice(start, limit));

  if (!opening || !Object.hasOwn(directives, opening[1])) {
    return null;
  }

  return {
    definition: directives[opening[1]],
    argumentsStart: start + opening[0].length,
  };
}

function parseArguments(state: ArgumentState) {
  skipArgumentSpaces(state);

  if (isAtClosingBrace(state)) {
    return finishArguments(state);
  }

  while (state.position < state.limit) {
    if (!readArgument(state)) {
      return null;
    }

    const argumentEnd = state.position;
    skipArgumentSpaces(state);

    if (isAtClosingBrace(state)) {
      return finishArguments(state);
    }

    if (!readArgumentSeparator(state, argumentEnd)) {
      return null;
    }
  }

  return null;
}

function readArgument(state: ArgumentState): boolean {
  skipArgumentSpaces(state);

  const name = readArgumentName(state);

  if (!name || !state.definition.attributes.includes(name)) {
    return false;
  }

  if (Object.hasOwn(state.attributes, name)) {
    return false;
  }

  const value = readQuotedValue(state);

  if (value === null) {
    return false;
  }

  state.attributes[name] = value;

  return true;
}

function readArgumentName(state: ArgumentState): string | undefined {
  if (state.source[state.position] === '"') {
    return readPositionalName(state);
  }

  return readNamedName(state);
}

function readPositionalName(state: ArgumentState): string | undefined {
  if (state.hasNamedArguments) {
    return undefined;
  }

  const name = state.definition.positional?.[state.positionalIndex];
  state.positionalIndex += 1;

  return name;
}

function readNamedName(state: ArgumentState): string | undefined {
  const remaining = state.source.slice(state.position, state.limit);
  const match = /^([A-Za-z][\w-]*)[ \t]*=/.exec(remaining);

  if (!match) {
    return undefined;
  }

  state.hasNamedArguments = true;
  state.position += match[0].length;
  skipArgumentSpaces(state);

  return match[1];
}

function readQuotedValue(state: ArgumentState): string | null {
  if (state.source[state.position] !== '"') {
    return null;
  }

  const value = state.md.helpers.parseLinkTitle(
    state.source,
    state.position,
    state.limit,
  );

  if (!value.ok) {
    return null;
  }

  state.position = value.pos;

  return value.str;
}

function readArgumentSeparator(
  state: ArgumentState,
  argumentEnd: number,
): boolean {
  if (state.position >= state.limit) {
    return false;
  }

  if (state.source[state.position] === ",") {
    state.position += 1;

    return true;
  }

  return state.position > argumentEnd;
}

function finishArguments(state: ArgumentState) {
  if (!validateAttributes(state.definition, state.attributes)) {
    return null;
  }

  return { attributes: state.attributes, end: state.position + 1 };
}

function validateAttributes(
  definition: DirectiveDefinition,
  attributes: DirectiveAttributes,
): boolean {
  const missingRequired = definition.required?.some((name) =>
    !attributes[name]?.trim()
  );

  if (missingRequired) {
    return false;
  }

  return definition.validate?.(attributes) !== false;
}

function isAtClosingBrace(state: ArgumentState): boolean {
  return state.position < state.limit && state.source[state.position] === "}";
}

function skipArgumentSpaces(state: ArgumentState): void {
  while (
    state.position < state.limit && /[ \t]/.test(state.source[state.position])
  ) {
    state.position += 1;
  }
}

function createDirectiveOutput(state: InlineState): DirectiveOutput {
  return {
    text(value) {
      state.push("text_special", "", 0).content = value;
    },

    open(tag, attributes = {}) {
      const token = state.push("directive_open", tag, 1);

      for (const [name, value] of Object.entries(attributes)) {
        token.attrSet(name, value);
      }
    },

    close(tag) {
      state.push("directive_close", tag, -1);
    },
  };
}
