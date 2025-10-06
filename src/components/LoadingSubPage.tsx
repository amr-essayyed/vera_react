import { Spinner } from "./ui/spinner";

interface LoadingSubPageProps {
  message?: string


}
export default function LoadingSubPage({ message }: LoadingSubPageProps) {
  return (
    <div className="flex justify-center items-center gap-2 p-4" >
      <Spinner />
      {message && <span>{message}</span>}
    </div >
  )
}
