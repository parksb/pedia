# 리액트 훅

* 함수형 컴포넌트에서 사용할 수 없던 작업들을 가능하게 해주는 기능. (v16.8에서 도입됨.)
* hooks를 도입하게된 동기. 클래스 컴포넌트를 사용할 때 나타나는 다양한 문제들이 소개되어 있다: [ko.reactjs.org/docs/hooks-intro.html#motivation](https://ko.reactjs.org/docs/hooks-intro.html#motivation)

 ## `useState`

* 원래 함수형 컴포넌트는 stateless했는데, `useState`를 쓰면 state를 사용할 수 있다.

```jsx
import React, { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

* 상태가 여러개라면 `useState`를 여러개 사용하면 된다.

```tsx
const [count, setCount] = useState('');
const [name, setName] = useState('');
```

## `useEffect`

* 컴포넌트가 렌더링 될 때마다 특정 동작을 수행하도록 하는 hook.
* 클래스 컴포넌트의 `componentDidMount`와 `componentDidUpdate`를 합쳤다고 생각하면 됨.

```jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

* 마운트될 때만 실행하고, 리렌더링할 때는 실행하고 싶지 않다면 두번째 인자로 빈 배열을 주면 된다.

```jsx
useEffect(() => {
  console.log('Mounted');
}, []);
```

* 특정 값이 업데이트 될 때만 실행하려면 두번째 인자로 검사할 값을 넣어주면 된다.

```jsx
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]);
```

* custom hooks도 많다: [github.com/rehooks/awesome-react-hooks](https://github.com/rehooks/awesome-react-hooks)

## 참고자료

* ["Hook의 개요", React.](https://ko.reactjs.org/docs/hooks-intro.html)
* [velopert, "리액트의 Hooks 완벽 정복하기", velog, 2018.](https://velog.io/@velopert/react-hooks)
