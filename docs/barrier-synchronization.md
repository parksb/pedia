# 배리어 동기화

배리어 동기화(Barrier synchronization)는 특정 지점에 도달한 프로세스가 N개 이상일 때 배리어를 벗어나 동기 처리를 수행하는 기법이다.

## 스핀락 기반 배리어 동기 구현

```c
void barrier(volatile int *cnt, int max) { // 프로세스 수와 임계값을 받는다.
    __sync_fetch_and_add(cnt, 1);
    while (*cnt < max); // 프로세스 수가 max가 될 때까지 대기한다.
}
```

```c
volatile int num = 0;

void *worker(void *arg) {
    barrier(&num, 10); // 모든 스레드가 이 지점에 도달할 때까지 기다린다.
    // critical section
    return NULL;
}

int main(int argc, char *argv[]) {
    pthread_t th[10];

    for (int i = 0; i < 10; i++) {
        if (pthread_create(&th[i], NULL, worker, NULL) != 0) {
            perror("pthread_create"); return -1;
        }
    }

    return 0;
}
```

스핀락으로 구현하면 불필요하게 루프를 돌아야 하므로 실제로는 Pthreads의 조건 변수를 이용한다.

## 러스트에서 배리어 동기 사용

```rust
use std::sync::{Arc, Barrier};
use std::thread;

fn main() {
    let mut v = Vec::new(); // 스레드 핸들러 벡터
    let barrier = Arc::new(Barrier::new(10)); // 10 스레드만큼의 배리어 동기

    for _ in 0..10 {
        let b  = barrier.clone();
        let th = thread::spawan(move || {
            b.wait(); // 스레드 10개가 이 지점에 도달할 때까지 대기
            println!("finished barrier");
        });
        v.push(th);
    }

    for th in v {
        th..join().unwrap()
    }
}
```
