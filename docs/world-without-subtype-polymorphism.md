# 서브타입 다형성이 없는 세상

복잡한 정보 구조를 모델링할 때 많은 프로그래머가 직관적으로 상속을 떠올리곤 한다. 객체 지향 프로그래밍에 익숙할수록 특히 그렇다. 그 결과 아래와 같은 상속 구조가 만들어진다.

```
class Circle
  extends Shape
  extends GraphicalObject
  extends Drawable
  extends ...
  extends Object
```

is-a 관계로 타입을 쌓아올리면서 상속 체인이 깊어지면 하나의 타입을 이해하기 위해 상위 타입을 살펴봐야 하고, 그 상위 타입, 그 상위 타입을 살펴보며 그 안에서 어떤 것들이 상속되는지 알아야 한다. 어떤 상위 타입에서 메서드를 정의하는지, 어떤 하위 타입에서 메서드를 오버라이드했는지 추적하다보면 트리 전체, 코드베이스 전체를 헤매고 있는 자신을 발견하게 된다.

서브타입 다형성으로 관계를 설계할 때, 상속에 다양한 층위의 의도가 뒤섞여 버리는 것이 문제다.

1. "B는 A의 명세를 만족한다"
2. "B는 A의 한 종류이다"
3. "B는 A의 구현을 물려받는다"

이 모든 의도가 `extends`나 `implements` 키워드로 선언된다. 서브타입 다형성이 없는 세상에서는 다른 방식으로 다형성을 구현할 수 있다. 이 세상에서는 명세가 가장 중요하다. 다음 코드에서 `Shape`와 `Drawable`은 명세다. 

```haskell
class Shape a where
  area :: a -> Double
  perimeter :: a -> Double

class Drawable a where
  draw :: a -> IO ()
```

명세는 "어떤 타입 `a`가 `Shape`이려면 `area`와 `perimeter` 함수를 가져야 한다"고 정의할 뿐이다. `Circle`이 명세를 만족한다는 사실을 증명하는 것은 별개다. 때문에 관계가 수직으로 쌓이는 대신, 수평으로 펼쳐진다.

```haskell
data Circle = Circle Double

instance Shape Circle where
  area (Circle r) = pi * r ^ 2
  perimeter (Circle r) = 2 * pi * r

instance Eq Circle where
  Circle r1 == Circle r2 = r1 == r2

instance Show Circle where
  show (Circle r) = "Circle " ++ show r

instance Drawable Circle where
  draw (Circle r) = putStrLn $ "r=" ++ show r
```

명세와 증명이 분리되어 있으므로 타입의 확장이 자유롭다. `extends`나 `implements`로는 다른 라이브러리에 정의된 클래스에 메서드를 추가하는 것이 불가능하다. 그러나 여기에서는 가능하다. 표준 라이브러리에 정의된 `Int`를 수정하지 않고도 `Int`가 `Drawable`이 되게 만들 수 있다.

```haskell
instance Drawable Int where
  draw n = putStrLn (replicate n '*')
```

## 관련문서

- [[functional-programming]]
- [[functional-type-system]]
- [[robust-with-types-flexible-with-polymorphism]]
- [[code-is-the-most-strict-spec]]
