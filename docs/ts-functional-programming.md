# Functional Programming (TypeScript)

## Array.prototype[^mdn]

### map

* 배열 내의 모든 요소 각각에 대하여 주어진 함수를 호출한 결과를 모아 새로운 배열을 반환한다.

```ts
[1, 4, 9, 16].map((item) => item * 2); // [2, 8, 18, 32]
```

### forEach

* 주어진 함수를 배열 요소 각각에 대해 실행한다.

```ts
['a', 'b', 'c'].forEach((item) => console.log(item));
// a
// b
// c
```

### filter

* 주어진 함수의 테스트를 통과하는 모든 요소를 모아 새로운 배열로 반환한다.

```ts
[3, 10, 20, 1, 9].filter((item) => item < 10);
// [3, 1, 9]
```

### some

* 배열 안의 어떤 요소라도 주어진 판별 함수를 통과하는지 테스트한다.
* 조건에 맞는 요소가 있으면 즉시 true를 반환한다.

```ts
[1, 2, 3, 4, 5].some((item) => item % 2 === 0);
// true
```

### every

* 배열 안의 모든 요소가 주어진 판별 함수를 통과하는지 테스트한다.
* 조건에 맞지 않는 요소가 있으면 즉시 false를 반화한다.

```ts
[1, 30, 39, 29, 10, 13].every((item) => item < 40);
// true
```

### reduce

* 배열의 각 요소에 대해 주어진 리듀서(reducer) 함수를 실행하고, 하나의 결과값을 반환한다.

```ts
// 1 + 2 + 3 + 4
[1, 2, 3, 4].reduce((acc, curr) => acc + curr); // 10

// 10 + 1 + 2 + 3 + 4
[1, 2, 3, 4].reduce((acc, curr) => acc + curr, 10); // 20
```

## Monad

* 모나드는 타입이자 디자인패턴이다.
* 모나드가 되기 위해서는 다음 3가지 요소가 필요하다.
  * 타입 생성자 - 원시 타입에 대해 모나드화된 타입을 만들기 위한 생성자.
  * unit 함수 - 원시 타입의 값을 모나드에 넣는 함수. `T` 타입 값을 받아 `M<T>` 타입의 값을 반화한다.
  * bind 함수 - 다른 모나트 타입으로 동작을 연결하는 함수. `M<T>`가 있으면 `T` 타입 변수를 받아 `M<U>` 타입의 값을 반환한다.

```ts
interface M<T> { }

function unit<T>(value: T): M<T> { ... }

function bind<T, U>(instance: M<T>, transform: (value: T) => M<U>): M<U> { ... }
```

## 참고자료

* [liam.m, "Monad Programming with Scala Future", kakao Tech, 2016.](https://tech.kakao.com/2016/03/03/monad-programming-with-scala-future/)
* [안도형, "자바스크립트로 함수형 프로그래밍 아주 살짝 맛보기", rinae's devlog, 2018.](https://rinae.dev/posts/functional-js-tutorial)
* [김용균, "JavaScript 모나드", 매일 성장하기, 2015.](https://edykim.com/ko/post/javascript-monad/)

[^mdn]: [MDN web docs, "Array", developer.mozilla.org.](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array)
