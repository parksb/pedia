# Yarn

## 개요

Yarn은 자바스크립트 패키지 매니저다.

## Workspaces

워크스페이스를 사용하면 하나의 프로젝트 내에서 여러 패키지를 관리할 수 있다. 특히 이는 [[monorepo]]에서 매우 유용하다. 모노레포의 패키지는 서로 종속되어야 하는 상황이 많은데, 가령 애플리케이션 패키지(`app`)가 같은 저장소에 있는 라이브러리 패키지(`utils`)를 사용하는 경우가 있다. 이때 Yarn은 프로젝트에서 워크스페이스를 사용해 의존성을 찾을 수 잇다.

```json
{
  "name": "app",
  "dependencies": {
    "utils": "workspace:^"
  }
}
```

`yarn workspaces focus` 명령을 사용하면 특정 워크스페이스에만 의존성을 설치할 수 있다. 또한 `yarn workspaces foreach` 명령을 사용하면 여러 워크스페이스에서 명령을 병렬로 실행할 수 있다.

## Constraints

제약을 사용하면 워크스페이스에 특정 규칙을 적용할 수 있다. 가령 동일한 버전의 의존성을 보장하거나, 특정 의존성 사용을 금지할 수 있다. 제약은 프로젝트의 루트에 `yarn.config.cjs` 파일을 만들어 설정할 수 있다. 만약 모든 react 의존성을 18.0.0으로 설정되도록 강제하려면 다음과 같이 작성한다.

```javascript
module.exports = {
  async constraints({Yarn}) {
    for (const dep of Yarn.dependencies({ ident: 'react' })) {
      dep.update(`18.0.0`);
    }
  },
};
```

## Plug'n'Play

Yarn PnP 프로젝트에는 `node_modules` 디렉토리가 없다. 대신 `pnp.cjs`이라는 로더 파일이 있다. 이 로더 파일에는 패키지의 위치를 비롯한 프로젝트의 의존성 트리에 관한 모든 정보가 포함되어있다.

```js
/* react 패키지 중에서 */
["react", [
  /* npm:18.2.0 버전은 */
  ["npm:18.2.0", {
    /* 이 위치에 있고 */
    "packageLocation": "./.yarn/cache/react-npm-18.2.0-98658812fc-a76d86ec97.zip/node_modules/react/",
    /* 이 의존성들을 참조한다. */
    "packageDependencies": [
      ["loose-envify", "npm:1.4.0"]
    ],
  }]
]],
```

npm이나 pnpm과 같은 패키지 매니저들은 대부분의 시간을 파일 I/O에 소모한다. 반면 Yarn PnP는 의존성을 자바스크립트 Map 객체로 관리한다. `yarn` 명령으로 의존성을 설치하면 Node.js 프로세스는 PnP Map을 메모리에 전부 로드하고, `import`와 `require` 구문에서 이를 참조한다. 따라서 일단 처음에 메모리에 PnP Map을 로드하고 나면 이후로는 `node_modules` 디렉토리를 순회할 필요없이 메모리에서 Map 연산만 수행하면 되기 때문에 속도가 굉장히 빠르다.

## 참고자료

- [박서진, "패키지 매니저의 과거, 토스의 선택, 그리고 미래", 2024](https://toss.tech/article/lightning-talks-package-manager)
- [Yarn Constraints](https://yarnpkg.com/features/constraints)
- [Yarn Plug'n'Play](https://yarnpkg.com/features/pnp)
- [Yarn Workspaces](https://yarnpkg.com/features/workspaces)
