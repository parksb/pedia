# /dev/null

* null 장치 파일.
* 항상 비어있는 특별한 파일.
* `/dev/null`로 보내진 데이터는 모두 버려진다.
* 이를 이용해 불필요한 출력 스트림을 버릴 수 있다.

## File descriptor

* `0` - 표준 출력
* `1` - 표준 출력
* `2` - 표준 에러

## 표준 출력 버리기

```sh
$ echo "Hello"
Hello
```

* 표준 출력(`1`)이 `/dev/null`로 버려지기 때문에 문자열을 출력하지 않는다:
  ```sh
  $ echo "Hello" 1> /dev/null
  ```
* 표준 출력 file descriptor를 생략할 수 있다:
  ```sh
  $ echo "Hello" > /dev/null
  ```

## 표준 에러 버리기

```sh
$ cd invalid-path
cd: no such file or directory: invalid-path
```

* 표준 에러(`2`)가 `/dev/null`로 버려지기 때문에 에러를 출력하지 않는다:
  ```sh
  $ cd invalid-path 2> /dev/null
  ```
* 리다이렉션하여 표준 에러와 표준 출력을 모두 버릴 수 있다:
  ```sh
  $ cd invalid-path > /dev/null 2>&1
  ```
  * 표준 입력은 `/dev/null`로 버러진다.
  * 표준 에러(`2`)를 표준 출력(`1`)으로 리다이렉션했기 때문에 마찬가지로 버려진다.

## 참고자료

* ["Discarding output with the /dev/null file", IBM Knowledge Center.](https://www.ibm.com/support/knowledgecenter/ko/ssw_aix_71/osmanagement/discard_output_devnull.html)
