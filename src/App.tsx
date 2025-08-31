import './App.css'
// import Counter from './components/Counter'
import {useAllResource, useResourceByProp} from './hooks/useResource'
import type { Post } from './types/post';

function App() {
    const {data:todos, error:todosErr, status:todosSt} = useAllResource('todoss');
    // const {data, error, status} = useAllResource('posts');
    const {data:post, error, status} = useResourceByProp('posts', 'title', 'dolorem eum magni eos aperiam quia')

  return (
    <>
        <h1>Posts</h1>
        <div>
              {status === 'pending' ? (
                'loading'
            ) : status === 'error' ? (
                <span>Error: {error.message}</span> 
            ) : (
                <>
                    <div>
                        <div className="card">Post id: {post.id}</div>
                        <div className="card">Post Title: {post.title}</div>
                        <div className="card"> {post.body}</div>
                    </div>
                </>
            )}
        </div>
        {/* <div>
            {status === 'pending' ? (
                'loading'
            ) : status === 'error' ? (
                <span>Error: {error.message}</span> 
            ) : (
                <>
                    <div>
                        {data.map((post: Post)=> <div key={post.id} className="card">Post Title: {post.title}</div>)}
                    </div>
                </>
            )}
        </div> */}
        
        <h1>Todos</h1>
        <div>
            {todosSt === 'pending' ? (
                'loading'
            ) : todosSt === 'error' ? (
                <span>Error: {todosErr.message}</span> 
            ) : (
                <>
                    <div>
                        {todos.map((todo:any)=> <div key={todo.id} className="card">todo: {todo.title}</div>)}
                    </div>
                </>
            )}
        </div>
        {/* <Counter /> */}

    </>
  )
}

export default App
