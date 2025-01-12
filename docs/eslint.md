# ESLint

::: INFO
https://eslint.org/
:::

ESLint는 자바스크립트, JSON, 마크다운을 정적 분석하는 린트(Lint) 도구다.

## Configuration

ESLint는 `eslint.config.(js|mjs|cjs|ts|mts|cts)` 파일을 통해 설정할 수 있다. 기존에는 `.eslintrc.(js|json|yaml|yml)` 파일을 사용했으나, flat configuration을 사용하려면 `eslint.config.*` 방식으로 전환해야 한다.

8.x 버전의 ESLint는 명령을 실행한 디렉토리부터 상위 디렉토리로 올라면서 `eslint.config.*` 파일을 찾는다. 때문에 현재 디렉토리에 `.eslintrc.*` 파일이 있어도 상위 디렉토리에 `eslint.config.*` 파일이 있으면 후자를 사용하게 된다.
