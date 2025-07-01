import { getSignInUrl } from "@workos-inc/authkit-react-router";
import { redirect } from "react-router";

export const loader = async () => {
  const signInUrl = await getSignInUrl();

  return redirect(signInUrl);
};

// export default function LoginPage() {
//   const { data } = useLoaderData<typeof loader>();
//   console.log("DATAAA", data);
//   return (
//     <Unauthenticated>
//       <div className="flex flex-col items-center justify-center min-h-screen p-4">
//         <div className="w-full max-w-md space-y-8">
//           <div className="text-center">
//             <h1 className="text-3xl font-bold text-foreground mb-2">
//               Welcome Back
//             </h1>
//             <p className="text-muted-foreground">
//               Sign in to your account to continue
//             </p>
//           </div>

//           <div className="space-y-4">
//             <a href={data.signInUrl} className="w-full">
//               Login
//             </a>
//           </div>
//         </div>
//       </div>
//     </Unauthenticated>
//   );
// }
