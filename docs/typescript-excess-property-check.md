# 초과 속성 검사

타입에 명시된 변수에 객체 리터럴을 할당할 때 타입스크립트 타입 체커는 해당 타입의 속성이 있는지, 그리고 '그 외의 속성은 없는지' 확인한다. 이를 '초과 속성 검사' 또는 '잉여 속성 체크'라고 한다.

```typescript
interface Point2D {
  x: number;
  y: number;
}

const point: Point2D = { x: 1, y: 2, z: 3 };
// Error: Object literal may only specify known properties, and 'z' does not exist in type 'Point2D'.
```

위 예제에서는 초과 속성 검사를 통해 타입 오류가 발생했다. 그런데 [[structural-typing]] 관점에서는 오류가 발생하지 않아야 한다. 초과 속성 검사는 객체 리터럴에 대해서만 이뤄지기 때문에 아래와 같이 임시 변수를 사용해보면 이러한 오류가 발생하지 않는다.

```typescript
const temp = { x: 1, y: 2, z: 3 };
const point: Point2D = temp;
```

위에서 `temp`의 타입은 `{ x: number, y: number, z: number }`로 추론되기 때문에 `Point2D` 타입의 하위 타입으로 취급된다. 초과 속성 검사는 할당 가능 검사와는 구분되는 별도의 과정으로, [[structural-typing]]의 일관된 원칙을 유지하는 동시에 객체 리터럴의 예측 불가능한 속성 할당을 방지하기 위한 것이다.

초과 속성 검사는 타입 단언을 사용할 때에도 적용되지 않는다.

```typescript
const point: Point2D = { x: 1, y: 2, z: 3 } as Point2D;
```

## 참고자료

- 댄 밴더캄, "이펙티브 타입스크립트", 장원호 역, _인사이트_, 2021.
- 홍재민, [[robust-with-types-flexible-with-polymorphism]], _인사이트_, 2023.
