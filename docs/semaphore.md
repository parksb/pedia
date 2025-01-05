# 세마포어

세마포어는 N개 프로세스가 동시에 락을 획득할 수 있도록 허용하는 [[mutex]] 기반의 동기 처리 기법이다. 물리적인 계산 리소스 이용에 제한을 적용하고 싶은 경우 사용할 수 있다.

## 스핀락 기반 세마포어 구현

```c
#define NUM 4

void semaphore_acquire(volatile int *cnt) { // 락을 얻은 프로세스 수를 의미하는 공유 변수 포인터를 받는다.
    while (1) {
        while (*cnt >= NUM); // 락을 얻은 프로세스가 NUM 이상이면 스핀하며 대기한다.
        __sync_fetch_and_add(cnt, 1); // NUM 미만이면 값을 아토믹하게 증가한다.
        if (*cnt <= NUM) { // 증가한 공유 변수 값이 NUM 이하라면 루프를 벗어나 락을 얻는다.
            break;
        }
        __sync_fetch_and_sub(cnt, 1); // 증가한 공유 변수 값이 NUM을 초과하면 다시 시도한다.
    }
}

void semaphore_release(int *cnt) {
    __sync_fetch_and_sub(cnt, 1);
}
```

```c
int cnt = 0;

void do_something() {
    while (1) {
        semaphore_acquire(&cnt);
        // critical section
        semaphore_release(&cnt);
    }
}
```

## 러스트 세마포어 구현

```rust
use std::sync::{Condvar, Mutex};

pub struct Semaphore {
    mutex: Mutex<isize>,
    cond: Condvar,
    max: isize, // 동시에 락을 획득할 수 있는 프로세스 최대 수
}

impl Semaphore {
    pub fn new(max: iszie) -> Self {
        Semaphore {
            mutex: Mutex::new(0),
            cond: Condvar::new(),
            max,
        }
    }

    pub fn wait(&self) {
        let mut cnt = self.mutex.lock().unwrap();
        while *cnt >= self.max { // 락을 획득한 프로세스가 이미 최대치라면 대기한다.
            cnt = self.cond.wait(cnt).unwrap();
        }
        *cnt += 1; // 락을 획득할 수 있으면 카운터를 증가하고 [[race-condition]]{임계 구역}으로 진입한다.
    }

    pub fn post(&self) {
        let mut cnt = self.mutex.lock().unwrap();
        *cnt -= 1;
        if *cnt <= self.max {
            self.cond.notify_one();
        }
    }
}
```

```rust
use semaphore::Semaphore;
use std::sync::atomic::{AtomicUsize, Ordering}
use std::sync::Arc;

const NUM_LOOP: usize = 100000;
const NUM_THREADS: usize = 8;
const SEM_NUM: isize = 4;

static mut CNT: AtomicUsize = AtomicUsize::new(0);

fn main() {
    let mut v = Vec::new();
    let sem = Arc::new(Semaphore::new(SEM_NUM)); // SEM_NUM만큼 동시 실행 가능한 세마포어

    for i in 0..NUM_THREADS {
        let s = sem.clone();

        let t  = std::thread::spawn(move || {
            for _ in 0..NUM_LOOP {
                s.wait();

                unsafe { CNT.fetch_add(1, Ordering::SeqCst) };
                let n = unsafe { CNT.load(Ordering::SeqCst) };
                assert!((n as isize) <= SEM_NUM);
                unsafe { CNT.fetch_sub(1, Ordering::SeqCst) };

                s.post();
            }
        });

        v.push(t);
    }

    for t in v {
        t.join().unwrap();
    }
}
```

- `std::sync::Arc`: Atomically Reference Counted
  - 스레드 세이프한 레퍼런스 카운팅 포인터. `Rc` 타입과 다르게 원자적으로 명령을 수행한다.
  - `Arc<T>` 타입은 타입 `T`의 값에 대한 공유된 오너십을 제공한다. (힙 메모리에 할당된다.)
  - `clone`을 호출하면 같은 힙 메모리 주소를 가리키는 새로운 `Arc` 인스턴스를 만들어낸다:
    ```rust
    let foo = Arc::new(vec![1.0, 2.0, 3.0]);

    let a = foo.clone();
    let b = Arc::clone(&foo); // `foo.clone()`과 동일하다.

    // `a`, `b`, `foo`는 모두 같은 메모리 주소를 가리키는 `Arc` 인스턴스다.
    ```
  - 스레드 사이에 데이터를 공유하고 싶을 때 `Arc`를 사용한다:
    ```rust
    let apple = Arc::new("the same apple");

    for _ in 0..10 {
        let apple = Arc::clone(&apple);

        thread::spawn(move || {
            println!("{:?}", apple);
        });
    }
    ```
- `Rc` 타입에 대한 자세한 내용은 [[trpl-smart-pointers]]를 참고.
