# Firestore 데이터 로딩 모범 사례 (Best Practice)

이 문서는 Firestore에서 데이터를 조회할 때 발생하는 `Missing or insufficient permissions` (권한 없음) 오류와 `The query requires an index` (색인 필요) 오류를 근본적으로 해결하고, 안정적인 코드를 작성하기 위한 핵심 로직을 정의합니다.

**모든 Firestore 데이터 조회는 반드시 이 패턴을 따라야 합니다.**

---

## 문제 상황

- **권한 오류:** Firestore 보안 규칙은 기본적으로 "자신이 생성한 문서만 접근 가능"하도록 설정되어 있습니다. 쿼리 시 `where("createdBy", "==", user.uid)` 같은 소유자 필터가 없으면, 보안 규칙 위반으로 데이터 조회가 거부됩니다.
- **색인 오류:** Firestore에서 `where()`로 필터링하는 동시에 `orderBy()`로 정렬하는 "복합 쿼리"를 사용하려면, Firebase 콘솔에서 해당 필드 조합에 대한 "복합 색인(Composite Index)"을 수동으로 생성해야 합니다. 색인이 없으면 쿼리가 실패합니다.

## 해결 로직: "쿼리는 필터링만, 정렬은 클라이언트에서"

이 두 가지 문제를 동시에 해결하기 위해, 데이터 조회의 역할을 다음과 같이 명확하게 분리합니다.

### 1. Firestore 쿼리: 소유자 필터링 담당

데이터를 요청하는 Firestore 쿼리에서는 **반드시 `where()` 절을 사용하여 현재 로그인한 사용자의 데이터만 필터링**합니다. `orderBy()`는 사용하지 않습니다.

```javascript
// 올바른 예시: where 필터만 사용
import { collection, query, where, onSnapshot } from "firebase/firestore";

const q = query(
    collection(db, "my_documents"), 
    where("createdBy", "==", user.uid) // 'createdBy'는 문서 소유자의 UID 필드
);

// 잘못된 예시: orderBy를 함께 사용하면 복합 색인 오류 발생 가능
const q_error = query(
    collection(db, "my_documents"), 
    where("createdBy", "==", user.uid),
    orderBy("createdAt", "desc") // AVOID THIS
);
```

### 2. 클라이언트 코드: 정렬 담당

Firestore로부터 필터링된 데이터를 받은 후, **자바스크립트의 `sort()` 메서드를 사용하여 클라이언트 측에서 직접 데이터를 정렬**합니다.

```javascript
// onSnapshot 콜백 함수 내부
onSnapshot(q, (snapshot) => {
    const fetchedDocs = snapshot.docs.map(doc => ({ ...doc.data() }));

    // 클라이언트 측에서 직접 정렬
    fetchedDocs.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    // 정렬된 데이터를 상태에 반영
    setDocuments(fetchedDocs);
});
```

---

## 요약

이 "필터링과 정렬의 분리" 원칙을 준수하면, 불필요한 Firebase 콘솔 색인 설정 작업을 피하고, 보안 규칙을 준수하며, 안정적이고 예측 가능한 데이터 로딩 로직을 구축할 수 있습니다.