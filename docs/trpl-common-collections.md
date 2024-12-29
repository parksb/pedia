# Common Collections (TRPL)

## Vector (`Vec<T>`)

* `let v: Vec<i32> = Vec::new()`
* `let v = vec![1, 2, 3]` - `vec!` 매크로를 이용해 쉽게 벡터를 만들 수 있다.
* `v.push(4)` - 일반 배열과 다르게 선언이후 업데이트할 수 있다.
* `v.get(2)` - index 2의 요소에 접근한다.
  * `let third: &i32 = &v[2]` - 이렇게 접근할 수도 있다.
* `for`문으로 벡터를 이터레이트할 수 있다.
  ```rust
  let mut v = vec![100, 200, 300];
  for item in &mut v {
      *item += 50;
  }
  ```
  * dereference 연산자 `*`은 이후에 설명한다.

## String (`String`)

* `let mut s = String::new()` - 문자열 생성
* `let s = "Initial contents".to_string()` - String 타입에는 Display trait가 포함되어 있는데, `to_string` 메소드를 이용해 이를 구현하도록 할 수 있다.
* `s.push_str(", world!")` - 문자열을 이어붙일 수 있다.
* `s.push('w')` - 문자 하나를 이어붙일 때는 push로 할 수 있다.
* `let s = s1 + "-" + &s2 + "-" + &s3`
* `let s = &hello_world[0..4]` - 0번 인덱스부터 4번 인덱스까지의 문자열을 담는다.

## Hash map (`HashMap<K, V>`)

* `use std::collections::HashMap`으로 import해야 한다.
* `let mut scores = HashMap::new()`
* `scores.insert(String::from("Blue"), 10)` - kvp를 추가/업데이트한다.
* `scores.get(&team_name)` - key로 value를 가져온다.
* 이터레이트할 수도 있다.
  ```rust
  for (key, value) in &scores {
      println!("{}: {}", key, value);
  }
  ```
