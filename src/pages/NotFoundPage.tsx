import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex w-full h-screen text-center justify-center items-center">
        <div>
            <div>404 | Page Not Found!</div>
            <br />
            <Link to={'/'}>
                <button>
                    Go back Home
                </button>
            </Link>
        </div>
    </div>

  )
}
