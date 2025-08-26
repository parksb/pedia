# 비동기 컨텍스트 (JavaScript)

::: INFO
- [TC39 Proposal: Async Context for JavaScript](https://github.com/tc39/proposal-async-context)
- [Node.js Asynchronous context tracking](https://nodejs.org/api/async_context.html#asynchronous-context-tracking)
:::

비동기 컨텍스트(Asynchronous Context)는 [[javascript]]{자바스크립트}에서 비동기 작업을 수행할 때, 해당 작업이 실행되는 환경이나 상태를 추적하고 관리하는 메커니즘이다. TC39 스테이지 2단계에 있고, Node.js에는 v12에서 도입되었다.

동기 코드는 하나의 콜 스택에서 실행되기 때문에 값의 일관성을 보장할 수 있다. 동기 코드에서는 함수 파라미터와 같은 명시적 전달, 클로저를 통한 캡처, 전역 상태와 같은 암시적 전파를 통해 값을 전달할 수 있다. 하지만 비동기 코드는 이벤트 루프를 거치면서 콜 스택이 교체되기 때문에 명시적으로 값을 전달하지 않는 한 값의 일관성을 보장할 수 없다.

```js
let shared;

async function process(key) {
    shared = key;

    return delay(100).then(() => {
        // 여기에서 shared는 key가 아닌 값이 될 수 있다.
    });
}

process(1);
process(2);
```

async/await 문법은 비동기 경계를 흐리기 때문에 값이 일관성을 보장하는 것처럼 보이게 만든다. 마치 동기 코드가 일시정지되는 것처럼 보이지만, 실제로는 콜 스택이 교체된다.

```js
let shared;

async function process(key) {
    shared = key;

    await delay(100);

    // 여기에서 shared는 key가 아닌 값이 될 수 있다.
}

process(1);
process(2);
```

비동기 컨텍스트는 논리적으로 연결된 코드 흐름을 추적해 컨텍스트를 유지한다. 비동기 컨텍스를 사용하면 명시적으로 값을 전달하지 않고도 값의 일관성을 유지할 수 있다.

```js
const context = new AsyncContext.Variable();

async function process(key) {
    context.run(key, async () => {
        await delay(100);

        // 여기에서 context.get()으로 key를 얻을 수 있다.
    });
}

process(1);
process(2);
```


