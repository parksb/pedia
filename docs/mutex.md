# 뮤텍스

뮤텍스(MUTEX)는 상호배제(Mutual exclusion)의 약자로, [[race-condition]]을 실행할 수 있는 프로세스 수를 1개로 제한하는 동기 처리 기법을 의미한다.

아래와 같이 공유 변수 `lock`을 플래그로 이용해 크리티컬 섹션이 점유되어 있는지 판단한다.

```c
bool lock = false;

void do_something() {
retry:
    if (!test_and_set(&lock)) { // 락이 걸려있는지 확인하고, 락을 얻는다.
        // critical section
    } else {
        goto retry; // 락이 걸려있다면 재시도한다.
    }

    tas_release(&lock); // 락을 해제한다.
}
```

`lock`을 검사할 때 [[atomic-operation]]{TAS}를 사용하지 않으면 여러 프로세스가 동시에 락을 획득할 위험이 있다. 위 코드처럼 락을 얻을 수 있는지 반복하며 확인하는 것을 스핀락(Spinlock)이라고 한다.

```c
void spinlock_aquire(volatile bool *lock) add{
    while(1) {
        while(*lock);
        if (!test_and_set(lock)) {
            break;
        }
    }
}

void spinlock_release(bool *lock) {
    tas_release(lock);
}
```

[[atomic-operation]]{TAS} 전에 락이 `false`가 될 때까지 루프를 도는 것을 TTAS(Test and Test and Set)이라고 한다. 이렇게 하면 불필요한 [[atomic-operation]] 수행을 줄일 수 있다. [[atomic-operation]]은 성능 패널티가 크다.

스핀락은 락을 획득할 수 있을 때까지 루프를 돌며 CPU 리소스를 소비하기 때문에 락을 얻지 못하면 다른 프로세스로 컨텍스트 스위칭하는 식으로 최적화하기도 한다. 하지만 애플리케이션 레벨에서 OS 스케줄링을 제어하기 어렵기 때문에 스핀락만을 사용하는 것은 권장하지 않는다.

