# Knuth-Morris-Pratt 알고리즘

- 문자열 내에서 특정 문자열을 찾는 매칭 알고리즘.
- 단순히 나이브하게 브루트포스로 문자열을 찾는다면:
  ```py
  S = "ABCDABCDABEE"
  W = "ABCDABE"

  cnt = 0

  for s in S:
    cnt += 1
    for w in W:
      if s != w:
        cnt -= 1
        break
  ```
  - 원본 문자열 길이가 $N$, 찾을 문자열 길이가 $M$일 때 시간복잡도는 $O(NM)$.
  - 탐색하지 않아도 될 부분에서 불필요한 탐색을 하고 있음:
    ```
    A B C D A B C D A B E E
    A B C D A B X           (i=0)
      X X X X X X X         (i=1)
        X X X X X X X       (i=2)
          X X X X X X X     (i=3)
            A B C D A B E   (i=4)
              X X X X X X E (i=5)
    ```
- KMP 알고리즘은 불필요한 탐색을 줄이기 위해 만들어졌다.

## 접두사와 접미사

- LPS 테이블을 만든다.
- `ABCDABE`의 LPS 테이블:
  ```
  A        0
  AB       0
  ABC      0
  ABCD     0
  ABCDA    0
  ABCDAB   2 (AB == AB)
  ABCDABE  0
  ```
