# ESLint

::: INFO
https://eslint.org/
:::

ESLint는 자바스크립트, JSON, 마크다운을 정적 분석하는 린트(Lint) 도구다.

## 구성

ESLint는 `eslint.config.(js|mjs|cjs)` 파일로 구성(configuration)을 정의할 수 있다. 기존 구성 방식은 `.eslintrc.(js|json|yaml|yml)` 파일을 사용한다.

플랫(flat) 구성은 v8.21.0 (2022년)에 도입된 새로운 구성 시스템이다. 기존 구성 방식의 복잡성 문제에 대한 대안으로 제시되었고, v9에서는 기본 구성 시스템이 되었다. 플랫 구성은 보다 단순하고 유연하다. 기존의 구성 시스템은 상위에 있는 `eslintrc` 파일을 상속하느 계층형 구조였다. 이러한 구조는 구성을 더욱 복잡하게 만드는 원인이 되었다. 플랫 구성 방식은 원칙적으로 하나의 구성 파일만 사용하기 때문에 상위에 어떤 구성 파일이 있는지 찾아보지 않아도 된다.

플랫 구성 시스템은 배열에 담긴 각 구성 객체를 병합해 하나의 구성을 만드는 방식으로 동작한다. 뒤에 오는 구성 객체는 앞에 오는 구성 객체를 덮어쓴다.

```js
export default [
    {
        rules: {
            'no-console': 'error',
        },
    },
    {
        rules: {
            'no-console': 'off',
        },
    },
];
```

위와 같이 구성을 작성하면 `no-console` 규칙이 `off`로 설정된다. 또한 `files` 키로 해당 구성 객체가 적용될 파일을 지정할 수 있다. `files` 키를 지정하지 않으면 기본 자바스크립트 파일(`*.(js|mjs|cjs)`)에 규칙이 적용된다.

```js
export default [
    {
        rules: {
            'no-console': 'error',
        },
    },
    {
        files: ['*.test.js'],
        rules: {
            'no-console': 'off',
        },
    },
];
```

위와 같이 구성을 작성하면 `*.test.js` 파일에서는 `no-console` 규칙이 비활성화되고, 다른 자바스크립트 파일에서는 활성화된다. 주의할 점은 앞에 나오는 구성 객체에 정의된 `files` 키가 뒤에 나오는 구성 객체에도 적용된다는 점이다. 만약 아래와 같이 순서를 바꾸면 `*.test.js` 파일에 대해 `no-console` 규칙이 `error`로 설정된다.

```js
export default [
    {
        files: ['*.test.js'],
        rules: {
            'no-console': 'off',
        },
    },
    {
        rules: {
            'no-console': 'error',
        },
    },
];
```

따라서 더 '구체적인' 구성 객체를 뒤에 배치해야 한다. 구성의 적용 순서를 비롯해 적용된 구성의 상세한 정보를 살펴보려면 `eslint --inspect-config` 명령을 사용하면 된다.

8.x 버전 ESLint CLI는 실행 직후 기존 구성 방식을 사용하는지, 플랫 구성을 사용하는지 파악한다. 이를 위해 명령을 실행한 디렉토리부터 상위 디렉토리로 올라면서 `eslint.config` 파일을 찾는다. 만약 상위 디렉토리에 `eslint.config` 파일이 있다면 플랫 구성 모드로 동작하고, 그렇지 않으면 기존 구성 방식으로 동작한다. 현재 디렉토리에 `eslintrc` 파일이 있어도 상위 디렉토리에 `eslint.config` 파일이 있으면 후자를 사용하게 되며, 컴퓨터의 루트 디렉토리에 `eslint.config` 파일이 있으면 시스템의 모든 프로젝트가 플랫 구성 방식으로 동작하게 된다.

기존에는 린팅할 파일에서 가장 가까운 구성 파일을 찾아 적용했지만, 플랫 구성 방식에서는 명령을 실행한 위치부터 시작해 상위 디렉토리로 올라가면서 구성 파일을 찾는다. [[monorepo]]에서는 각 워크스페이스마다 구성 파일을 따로 두는 경우가 있는데, 플랫 구성에서는 명령을 실행한 위치에 따라 다른 구성 파일이 적용될 수 있어 주의해야 한다. 린팅할 파일을 기준으로 구성 파일을 탐색하도록 하려면 아래와 같이 피쳐 플래그를 사용해야 한다.

```
$ eslint --flag unstable_config_lookup_from_file example.js
```

## 참고자료

- [ESLint's new config system, Part 1: Background](https://eslint.org/blog/2022/08/new-config-system-part-1/)
- [ESLint's new config system, Part 2: Introduction to flat config](https://eslint.org/blog/2022/08/new-config-system-part-2/)
- [ESLint's new config system, Part 3: Developer preview](https://eslint.org/blog/2022/08/new-config-system-part-3/)
