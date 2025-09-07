import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "../components/ui/card";

import { useAllResource, useCreateResource, useResourceByProp } from "../hooks/useResource";
import type { Post } from "../types/post";

export default function PostsPage() {
    const {data, error, status} = useAllResource('posts');
    // const {data:post, error, status} = useResourceByProp('posts', 'id', 6);
    
    // const post = postSchema.parse(postData);

    const {mutateAsync: createResource} = useCreateResource('posts');
  return (
    <>
        <h1>Posts</h1>
        <button
            onClick={async ()=> createResource({resourceName: 'posts', resourceInstance: {"userId": 1,"title": "my Post","body": "good dignissimos aperiam dolorem qui eum\nfacilis quibusdam animi sint suscipit qui sint possimus cum\nquaerat magni maiores excepturi\nipsam ut commodi dolor voluptatum modi aut vitae food."}})}
        >post a post</button>

        <div>
            {status === 'pending' ? (
                'loading'
            ) : status === 'error' ? (
                <span>Error: {error.message}</span> 
            ) : (
                <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {data.map((post: Post)=> 
                            (
                                <Card key={post.id}>
                                    <CardHeader>
                                        <div>
                                            <CardTitle>{post.title}</CardTitle>
                                            <CardDescription>Test Posts</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent><p>{post.body}</p></CardContent>
                                </Card>
                            )
                        )}
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
                        <div className="card">Post id: {post.id}</div>
                        <div className="card">Post Title: {post.title}</div>
                        <div className="card"> {post.body}</div>
                    </div>
                </>
            )}
        </div> */}
    </>
  )
}
