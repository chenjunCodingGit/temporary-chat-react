// src/components/Counter.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { increment, decrement, incrementByAmount } from '../features/counter/counterSlice';

const Counter: React.FC = () => {
  // 使用 useSelector 从 store 中获取 state
  const count = useSelector((state: RootState) => state.counter.value);
  // 获取 dispatch 函数
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div>
      <h2>Counter (Redux)</h2>
      <p>Current Count: {count}</p>
      <button onClick={() => dispatch(increment())} style={{ marginRight: '10px' }}>
        ADD
      </button>
      <button onClick={() => dispatch(decrement())} style={{ marginRight: '10px' }}>
        MIN
      </button>
      <button onClick={() => dispatch(incrementByAmount(5))}>
        ADD 5
      </button>
    </div>
  );
};

export default Counter;
