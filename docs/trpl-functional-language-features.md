# Functional Language Features: Iterators and Closures (TRPL)

* Closures: 변수에 저장할 수 있는 function-like 구조.
* Iterators: 배열의 요소를 처리할 수 있는 방법.

## Closures: Anonymous Functions that Can Capture Their Environment

* 다른 프로그래밍 언어에서 말하는 클로저와 동일한 개념.
* 클로저를 정의하고 변수에 바인딩할 수 있다.

```rust
fn main() {
    let closure = |num| {
        println!("calculating slowly...");
        thread::sleep(Duration::from_secs(2));
        num
    }

    closure(3);
}
```

* 인자 타입을 명시할 수도 있고, 중괄호를 생략할수도 있다.

```rust
fn  add_one_v1   (x: u32) -> u32 { x + 1 }
let add_one_v2 = |x: u32| -> u32 { x + 1 };
let add_one_v3 = |x|             { x + 1 };
let add_one_v4 = |x|               x + 1  ;
```

* 클로저와 클로저를 호출한 결과값을 갖는 구조체를 만들 수 있다.
* 구조체는 결과값을 필요할 때만 클로저를 호출하고, 결과값은 저장되어 다시 계산되지 않을 것이다. 이러한 패턴을 메모이제이션(memoization) 혹은 지연평가(lazy evaluation)이라고 한다.
* `Fn` 트레잇을 사용해 타입으로 클로저를 취한다는 것을 명시할 수 있다. 모든 클로저는 `Fn`, `FnMut`, `FnOnce` 중 하나의 트레잇을 구현한다.

```rust
struct Cacher<T>
    where T: Fn(u32) -> u32
{
    calculation: T,
    value: Option<u32>,
}


impl<T> Cacher<T>
    where T: Fn(u32) -> u32
{
    fn new(calculation: T) -> Cacher<T> {
        Cacher {
            calculation,
            value: None,
        }
    }

    fn value(&mut self, arg: u32) -> u32 {
        match self.value {
            Some(v) => v,
            None => {
                let v = (self.calculation)(arg);
                self.value = Some(v);
                v
            },
        }
    }
}

fn main() {
    let mut c = Cacher::new(|a| a);

    let v1 = c.value(1);
    let v2 = c.value(2);

    assert_eq!(v2, 2);
}
```

* 클로저는 함수와 달리 환경을 캡처할 수 있다.

```rust
fn main() {
    let x = 4;

    // `x`가 클로저의 파라미터가 아니지만, 클로저가 `x`와 동일한 스코프에 정의되어 있기 때문에 사용할 수 있다.
    // 함수로는 이렇게 할 수 없다: `fn equal_to_x(z: i32) -> bool { z == x }`
    let equal_to_x = |z| z == x;

    let y = 4;

    assert!(equal_to_x(y));
}

```

* `Fn` - 환경으로부터 값을 불변으로 빌린다.
* `FnMut` - 환경으로부터 값을 가변으로 빌린다. (환경을 변경할 수 있다.)
* `FnOnce` - 환경에서 캡처한 변수를 소비한다. 소비하기 위해 클로저가 변수의 오너십을 가져간다.
* `move` 키워드를 이용해 클로저에게 강제로 오너십을 넘길 수도 있다.

```rust
fn main() {
    let x = vec![1, 2, 3];

    // `x`의 오너십이 클로저 안으로 이동한다.
    let equal_to_x = move |z| z == x;

    // 여기서부터 `x`를 사용할 수 없다.
    println!("can't use x here: {:?}", x);

    let y = vec![1, 2, 3];

    assert!(equal_to_x(y));
}
```

## Processing a Series of Items with Iterators

* 이터레이터를 게으르다. 이터레이터를 소비하는 메서드를 호출하기 전까지 이터레이터는 실행되지 않는다.
* `iter` 메서드로 이터레이터를 만들 수 있다.

```rust
let v1 = vec![1, 2, 3];
let v1_iter = v1.iter();
```

* 이터레이터로부터 새로운 이터레이터를 만들기 위해 어댑터 메서드를 사용할 수 있다.
* 어댑터 메서드를 체이닝하는 것만으로는 이터레이터가 소비되지 않는다. 이터레이터가 게으르기 때문.
* 따라서 `collect` 메서드를 사용한다.

```rust
let v1: Vec<i32> = vec![1, 2, 3];

let v2: Vec<_> = v1.iter().map(|x| x + 1).collect();

assert_eq!(v2, vec![2, 3, 4]);
```

* `Iterator` 트레잇을 구현하면 직접 이터레이터를 만들 수도 있다.
