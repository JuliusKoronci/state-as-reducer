# useStateReducer

A simple implementation of useState with useReducer.

## Why?

- useState doesnt work well with nested objects or complex states
- you should not pass down the set state fn to children or if you pass id down you need to wrap it in a useCallback
- useReducer has too much boilerplate for simple use cases

## How to use

### Basic

```typescript jsx
const [state, setState] = useStateReducer();
```

```setState```  - in this case wraps around dispatch and can be safely passed around. You will not encounter references
to unmounted components. ```state``` by default will be undefined.

```typescript jsx
const [state, setState] = useStateReducer({data: 'test'});
```

### Async state producers

```typescript jsx
const fetchMyData = async () => Promise.resolve(['test'])

const [state, setState, {loading, failed}] = useStateReducer([], fetchMyData);
```

The above illustrates how we can fill in the state with data returns from a promise which often time is needed on
component mount. The same api is supported for setState:

```typescript jsx
const fetchMyData = async () => Promise.resolve(['test'])

const [state, setState] = useStateReducer([]);

setState(fetchMyData);
```

This will resolve the promise and update the state accordingly while still supporting the original useState api, e.g.

### Counter

```typescript jsx
const [state, setState] = useStateReducer(0);

setState(currentCount => currentCount + 1);
```

### Reset
```typescript jsx
const [state, setState, { reset }] = useStateReducer([]);

reset();
```

Reset will revert the state to the initial state passed in as the first argument to the hook.