# 유닉스 성능 측정

[[unix]] 운영체제에서 애플리케이션의 성능을 측정하는 방법.

## 실행 시간

### time

[`time`](https://www.man7.org/linux/man-pages/man1/time.1.html) 명령을 사용하는 방법.

```sh
$ time sleep 5
________________________________________________________
Executed in    5.02 secs      fish           external
   usr time    2.89 millis    0.11 millis    2.78 millis
   sys time    6.00 millis    1.02 millis    4.98 millis
```

### print

애플리케이션 코드를 수정해서 실행 시간을 직접 출력할 수도 있다. 예를 들어 자바스크립트 코드는 `console.time`과 `console.timeEnd`를 사용하여 실행 시간을 측정할 수 있다.

```js
console.time('test');
// do something
console.timeEnd('test'); // test: 5004.000ms
```

## 메모리 사용량

### top

[`top`](https://man7.org/linux/man-pages/man1/top.1.html) 명령을 사용하는 방법. 측정할 프로세스의 PID를 알아야 한다.

```sh
$ top -pid $PID | awk -v pid=$PID '$1 == pid {print $8}'
50M
57M
57M
50M
```

## CPU 사용량

### top

[`top`](https://man7.org/linux/man-pages/man1/top.1.html) 명령을 사용하는 방법. 메모리 사용량 측정법과 마찬가지로 측정한 프로세스의 PID를 알아야 한다.

```sh
$ top -pid $PID | awk -v pid=$PID '$1 == pid {print $3}'
1.4
2.0
1.9
1.9
```

`top`이 표시하는 CPU 사용량은 해당 프로세스가 CPU의 전체 코어 대비 어느 정도의 비중을 점유하고 있는지를 의미한다. 만약 코어별 점유율을 알고 싶다면 [`htop`](https://htop.dev/)을 사용하면 된다.

### perf

Node.js는 `perf`를 위한 인터페이스를 제공한다: [Using Linux Perf](https://nodejs.org/en/learn/diagnostics/poor-performance/using-linux-perf)
