# 효과 체계

효과 체계(effect system)는 프로그램에서 발생하는 다양한 부수효과를 추적하도록 타입 체계(type system)를 확장한 것이다. 대수적 효과(algebraic effect)라는 용어는 타입 체계로부터 비롯된 것이다. 아무튼, 효과 체계의 실용적인 핵심은 함수의 데이터 타입이 어떤 부수효과를 일으키는지까지 표현할 수 있다는 점이다.

부수효과는 소프트웨어의 복잡성을 높이기 때문에 전통적인 함수형 프로그래밍 언어에서는 프로그램에서 부수효과가 있는 부분과 순수한 부분을 분리하는 데 집중해왔다. 그 방법 중 하나는 모나드를 이용해 부수 효과를 표현하는 것으로, 입출력을 수행하는 함수의 반환값을 IO 모나드로 감싸 해당 함수가 부수효과를 일으킬 수 있음을 표현하는 것을 예로 들 수 있다. 하지만 모나드는 함수에 색을 입히기 때문에, 순수한 함수형 프로그래밍 언어가 아니라면 부수효과를 일으키는 함수와 모나드를 반환하는 순수 함수를 함께 사용하기 어렵다.

한편, 대수적 효과를 사용하면 순수 함수와 부수효과를 일으키는 함수를 함께 사용할 수 있다. 가령 부수 효과를 일으키는 `print` 함수의 타입은 다음과 같이 표현할 수 있다:

```
print: String -> Unit / IO
```

::: NOTE
대수적 효과는 예외의 일반화된 정의처럼 느껴지기도 한다.
:::

## Effekt

[Effekt](https://github.com/effekt-lang/effekt)는 효과 체계를 지원하는 프로그래밍 언어이다. Effekt의 코어 컨셉을 살펴보면 대수적 효과를 이해하는 데 도움이 된다.

### 효과 안전성

Effekt는 효과를 추적할 수 있게 해주는 효과 체계를 갖추고 있다. 아래는 예외를 정의하는 예시인데, 자바의 checked exception과 비슷해 보일 것이다:

```effekt
effect exc(msg: String): Nothing

def div(n: Double, m: Double): Double / { exc } =
  if (m == 0.0) do exc("Division by zero") else n / m
```

함수 시그니처의 `Double / { exc }`에서 왼쪽 `Double`은 `div` 함수의 반환 타입이다. 오른쪽 `{ exc }`는 `div` 함수가 `exc` 효과를 일으킬 수 있으므로 `div`의 호출자가 효과를 처리해야함을 표현한다. 만약 부수효과를 일으키지 않는 순수 함수에서 `div` 함수를 사용하면 컴파일 에러가 발생한다:

```effekt
def pureFun(): Double / {} = div(42.0, 3.0)
//                           ^^^^^^^^^^^^^^
//         Effect Exc is not allowed in this context.
```

### 효과 처리자

간단한 효과로 예외를 생각해보자. 우선 아래와 같이 파일을 찾을 수 없다는 효과를 정의한다:

```effekt
effect fileNotFound(path: String): Unit
```

이 효과는 함수에서 아래와 같이 사용할 수 있다:

```effekt
def trySomeFile(f: String): Unit / { fileNotFound } = {
  println("Trying to open file " ++ f);
  do fileNotFound(f);
  println("Unreachable")
}
```

다른 프로그래밍 언어에서 예외 처리하듯이 효과를 처리할 수 있다. 아래는 `trySomeFile`을 사용하면서 효과를 처리하는 예시이다:

```effekt
def handled(): Unit / {} =
  try { trySomeFile("myFile.txt") }
  with fileNotFound { (path: String) => println("Error " ++ path) }
```

예외는 호출자로부터 제어 흐름을 가져와 처리자에게 전달한다. 예를 들어, `do fileNotFound(f)`는 `try { ... } with fileNotFound { ... }`에게 제어 흐름을 넘긴다. 효과를 처리할 때 기존 호출 시점으로 다시 제어흐름을 넘겨줄 수도 있다:

```effekt
def handledResume() =
  try { trySomeFile("myFile.txt") }
  with fileNotFound { (path: String) =>
    println("Creating file:" ++ path);
    resume(())
  }
```

## 관련문서

- [[functional-programming]]{함수형 프로그래밍}

## 참고자료

- 박재온, "코틀린에서의 대수적 효과 처리자 구현", 2023.
- [Effekt: The Core Concepts](https://effekt-lang.org/docs/concepts)
