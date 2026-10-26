import { useRouter } from 'next/router';
export default function Details() {

 const router = useRouter();
 const newsid = router.query.newsid;
  return (
    <h1> News Details Page - {newsid}</h1>
  )
}
