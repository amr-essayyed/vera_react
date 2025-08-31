import { useSelector, useDispatch } from "react-redux"
import type { AppDispatch, RootState } from "../state/store"
import { decrement, increment, incrementByAmount } from "../state/counter/counterSlice";

export default function Counter() {

    const count = useSelector((state: RootState)=>state.counter.value)
    const dispatch = useDispatch();

  return (
    <div className="card">
        <button 
            onClick =       {() => dispatch(increment())}
            onContextMenu = {(e)=> {
                e.preventDefault();
                return dispatch(decrement());
            }}
        >
          count is {count}
        </button>
        <button
            onClick={()=> dispatch(incrementByAmount(5))}
        >Icrement By 5</button>

        <div className="p-4">
        </div>
      </div>
  )
}
