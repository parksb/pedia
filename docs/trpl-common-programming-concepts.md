# Common Programming Concepts (TRPL)

## Variables and Mutability

* 러스트에서 변수(variable)는 기본적으로 불변(immutable)하다.
* `let num: i32 = 10` - 불변 변수 선언.
* `let mut num: i32 = 10` - 가변 변수 선언. `mut` 키워드를 붙인다.
* `const NUM: i32 = 10` - 상수 선언.
  * 항상 불변하기 때문에 `mut` 키워드를 사용할 수 없다.
  * 불변 변수와 다르게 상수는 상수 표현식으로만 초기화할 수 있다. 함수의 결과나 런타임 중 계산되는 값으로 초기화할 수 없다.
* Shadowing: 새로 선언한 변수명이 이전에 사용한 변수명과 같다면 새 변수가 이전 변수를 '가린다'.
  ```rust
  fn main() {
      let x = 5;
      let x = x + 1;
      let x = x * 2;

      println!("The value of x is: {}", x); // The value of x is: 12
  }
  ```
  * 쉐도잉을 통해 변수를 재선언함으로써 타입을 바꿀 수 있다.

## Data Types

* 스칼라 타입 (Scalar types)
  * `i8`, `i16`, `i32`, `i64`, `i128` - 8, 16, 32, 64, 128 비트 정수 타입.
  * `f32`, `f64`, `f128` - 32, 64, 128 비트 부동소수점 타입.
  * `bool` - 불리언 타입.

* 복합 타입 (Compound types)
  * `let tup: (i32, f64, u8) = (500, 3.14, 1)` - 튜플.
    * `let (x, y, z) = tup`처럼 전개할 수 있다.
  * `let arr = [1, 2, 3, 4, 5]` - 배열.
    * `let arr: [i32; 5] = [1, 2, 3, 4, 5]` - 타입과 길이 명시.
    * `let arr = [3; 5]` - `[3, 3, 3, 3, 3]`과 같다.
    * `arr[0]`처럼 접근한다. `arr[index]` 처럼 변수를 인덱스로 넘길 수는 없다.

## Functions

* `fn main() { ... }` 형식으로 함수를 선언한다.
* 함수 바디는 statement와 expression을 담을 수 있다.
* 중괄호를 이용하면 새로운 스코프를 만들 수 있다.
  ```rust
  let x = 5;
  let y = {
      let x = 3;
      x + 1
  };
  ```
* `x + 1` 뒤에 세미콜론이 붙지 않은 이유는 이것이 expression이기 때문이다. 세미콜론을 붙이면 statement가 된다.
* 함수를 값을 반환할 수 있다. 반환 값에 이름을 붙이지 않고 화살표 뒤에 타입만을 명시해도 된다.
  ```rust
  fn five() -> i32 {
      5
  }
  ```
* 파라미터를 받을 수도 있다.
  ```rust
  fn plus_one(x: i32) -> i32 {
      x + 1
  }
  ```

## Control Flow

* `if ... else if ... else`를 지원한다.
* `if`는 expression이기 때문에 `let` statement의 우변에 올 수 있다.
  ```rust
  let number = if condition {
      10
  } else {
      20
  };
  ```
* `loop` - 프로그램을 종료하거나 `break value`를 걸기 전까지 블록을 반복한다.
* `while condition` - 조건이 거짓이 될 때까지 블록을 반복한다.
* `for element in array` - 컬렉션의 각 요소를 순회하며 블록을 반복한다.
