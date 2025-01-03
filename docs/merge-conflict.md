# 병합 충돌

병합 충돌(Merge conflict)은 버전 관리 시스템에서 서로 다른 브랜치의 변경 사항을 병합할 때 같은 파일의 같은 위치가 서로 다르게 수정된 경우 발생하는 상황을 의미한다.

## 마커

충돌이 발생한 파일을 열면 현재 브랜치의 변경 사항과 병합 대상 브랜치의 변경 사항을 구분해서 표시하는 마커가 표시된다. 두 부분을 비교해서 어느 쪽을 유지할지 결정할 수 있다.

```
<<<<<<< HEAD
현재 브랜치의 변경 사항 (ours)
=======
병합 대상 브랜치의 변경 사항 (theirs)
>>>>>>> 대상 브랜치 이름 또는 커밋 해시
```

3-way 병합 도구를 사용하면 베이스 마커가 추가로 표시된다. 베이스는 두 브랜치가 분기되기 전의 내용을 표시한다.

```
<<<<<<< HEAD
현재 브랜치의 변경 사항 (ours)
||||||| 공통 조상의 커밋 해시
공통 조상의 내용 (base)
=======
병합 대상 브랜치의 변경 사항 (theirs)
>>>>>>> 대상 브랜치 이름 또는 커밋 해시
```

## git-mergetool

::: INFO
https://git-scm.com/docs/git-mergetool
:::

네오빔을 병합 도구로 사용하려면 `.gitconfig` 파일에 다음과 같은 설정을 추가한다.

```
[merge]
  tool = nvim
[mergetool "nvim"]
  cmd = nvim -d $LOCAL $REMOTE $MERGED -c 'wincmd w' -c 'wincmd J'
```

충돌 파일을 다루기 위한 플러그인을 설치하면 더욱 편리하게 사용할 수 있다.

- https://github.com/akinsho/git-conflict.nvim
- https://github.com/rhysd/conflict-marker.vim
- https://github.com/tpope/vim-fugitive
