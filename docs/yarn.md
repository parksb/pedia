# Yarn

## 개요

Yarn은 자바스크립트 패키지 매니저다. Yarn은 npm에 대한 비판으로부터 출발했다. 2017년 릴리즈된 Yarn 1은 yarn.lock 파일을 이용한 종속성 트리 고정, 캐시를 통한 속도 향상 등 npm보다 개선된 패키지 관리 환경을 제공했다. 이후 2020년 릴리즈된 Yarn 2는 Berry 또는 Yarn Berry로 불리며, Plug'n'Play(PnP) 아키텍처를 도입해 `node_modules` 디렉토리를 제거하고, 각 의존성의 위치와 버전을 `.pnp.js` 파일로 추적함으로써 더욱 빠른 성능을 달성한다.

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

Yarn PnP 프로젝트에 패키지를 설치하는 `yarn add` 명령을 실행하면 첫 번째로 의존성의 버전을 고정하는 Resolution 단계를 거친다. 이 단계에서는 우선 `package.json` 파일에 명시된 의존성의 버전 범위에 따라 정확한 버전을 결정한다. 이어서 의존성이 의존하는 또다른 의존성을 찾아내고, 이들의 버전 역시 고정함으로써 모든 머신에서 항상 고정된 버전을 사용할 수 있도록 한다. 이 결과는 `yarn.lock` 파일에 저장된다.

두 번째는 Fetch 단계로, Resolution 단계에서 결정된 버전의 의존성을 네트워크를 통해 다운로드받는다. 마지막은 Fetch 단계에서 받은 의존성을 소스코드에서 사용할 수 있는 환경을 제공하는 Link 단계다. npm의 경우 단순히 모든 의존성을 `node_modules` 디렉토리 아래에 설치한다. 반면 Yarn PnP는 상술했듯이, `node_modules` 디렉토리를 순회하지 않고 '의존성을 어떤 파일에서 `import`하는지, 그리고 무엇을 `import`하는지' 추적한다. 이렇게 추적한 정보는 위와 같이 `.pnp.js` 파일에 저장해둔다.

Yarn PnP 프로젝트를 실행하면 Node.js 프로세스는 `.pnp.cjs` 파일을 바탕으로 자바스크립트 Map 객체(PnP Map)를 만들어 메모리에 전부 로드하고, `import`와 `require` 구문에서 이를 참조한다. npm이나 pnpm과 같은 패키지 매니저들은 대부분의 시간을 파일 I/O에 소모하지만, Yarn PnP는 의존성을 PnP Map으로 관리하기 때문에 파일 I/O 연산을 획기적으로 줄일 수 있다. 따라서 일단 처음에 메모리에 PnP Map을 로드하고 나면 이후로는 `node_modules` 디렉토리를 순회할 필요없이 메모리에서 Map 연산만 수행하면 되기 때문에 속도가 굉장히 빠르다.

## 참고자료

- [박서진, "패키지 매니저의 과거, 토스의 선택, 그리고 미래", 2024](https://toss.tech/article/lightning-talks-package-manager)
- [Yarn Constraints](https://yarnpkg.com/features/constraints)
- [Yarn Plug'n'Play](https://yarnpkg.com/features/pnp)
- [Yarn Workspaces](https://yarnpkg.com/features/workspaces)
