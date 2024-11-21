# Zstandard

Zstandard(zstd)는 2015년 페이스북에서 개발한 무손실 데이터 압축 알고리즘이다.

아치 리눅스는 패키지 압축 도구를 xz에서 zstd로 교체했다. 압축 사이즈는 0.8% 정도 증가했지만, 압축 해제 속도가 ~1300% 향상됐다[^arch]. 우버는 snappy에서 zstd로 교체해 저장소 사이즈를 39% 줄였고, gzip을 zstd로 교체해 7% 줄였다[^uber].

## CLI

```sh
$ zstd path/to/file # 파일을 `.zst`로 압축
$ zstd --decompress path/to/file.zst # 압축 해제
$ zstd -level path/to/file # 압축률 지정, 1=fastest, 19=slowest, 3=default
```

## 참고자료

- https://github.com/facebook/zstd
- [RFC 8878 - Zstandard Compression and the 'application/zstd' Media Type](https://datatracker.ietf.org/doc/html/rfc8878)

[^arch]: [Now using Zstandard instead of xz for package compressionNow using Zstandard instead of xz for package compression](https://archlinux.org/news/now-using-zstandard-instead-of-xz-for-package-compression/)
[^uber]: [Cost Efficiency @ Scale in Big Data File Format](https://www.uber.com/en-TW/blog/cost-efficiency-big-data/)
