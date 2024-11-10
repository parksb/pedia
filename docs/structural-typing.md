# 구조적 타이핑

## 개요

같은 구조를 가졌다면 같은 타입으로 취급하는 방식의 타입 시스템. 오리 테스트("오리처럼 생겼고, 오리처럼 수영하고, 오리처럼 소리낸다면 그것은 오리이다")를 타입 시스템에 적용한 것으로, 덕 타이핑(duck typing)이라고도 한다.

아래와 같이 2차원 벡터를 나타내는 인터페이스와 그 벡터의 길이를 구하는 함수가 있다.

```typescript
interface Vector2D {
  x: number;
  y: number;
}

function length(v: Vector2D) {
  return Math.sqrt(v.x ** 2 + v.y ** 2);
}
```

만약 이름붙인 벡터를 표현하는 인터페이스를 추가해도 `length` 함수는 여전히 작동한다.

```typescript
interface NamedVector2D {
  x: number;
  y: number;
  name: string;
}

const v: NamedVector2D = { x: 3, y: 4, name: "Zee" };
length(v) // 5
```

`NamedVector2D`와 `Vector2D` 사이에 어떠한 관계도 정의하지 않았지만, `NamedVector2D`는 `Vector2D`의 하위 타입으로 취급된다. 이러한 방식의 타이핑은 외부 라이프러리에서 정의한 타입을 확장할 때 유용하다. 만약 `NamedVector2D`가 `Vector2D`와 다른 라이브러리에 정의되어 있어 프로그래머가 수정할 수 없어서 두 타입의 관계를 정의할 수 없더라도, 구조적 타이핑 덕분에 `length` 함수를 그대로 사용할 수 있다.

그런데 구조적 타이핑으로 인해 런타임에 문제가 생길 수도 있다. 아래와 같은 3차원 벡터를 나타내는 인터페이스를 생각해보자. 여기서 `normalize` 함수는 벡터의 길이를 1로 만든다.

```typescript
interface Vector3D {
  x: number;
  y: number;
  z: number;
}

function normalize(v: Vector3D) {
  const len = length(v);
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

normalize({ x: 3, y: 4, z: 5 }); // { x: 0.6, y: 0.8, z: 1 }
```

`length` 함수는 2차원 벡터의 길이를 구하는 함수지만, 3차원 벡터를 전달해도 타입 체킹을 통과하기 때문에 결과적으로 `z`가 정규화에서 무시되고 말았다. 구조적 타이핑에서 타입은 기본적으로 열려있다.

## 관련문서

- [[typescript]]
