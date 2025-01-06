// import Link from "next/link";
// import React from "react";
// import SignInButton from "./SignInButton";
// import { getAuthSession } from "@/lib/auth";
// import UserAccountNav from "./UserAccountNav";
// import { ThemeToggle } from "./ThemeToggle";
// import { Bungee_Spice } from 'next/font/google'; // Step 1: Import the font

// const honk = Bungee_Spice({ weight: ['400'], subsets: ['latin'] }); // Step 2: Initialize the font

// type Props = {};

// const Navbar = async (props: Props) => {
//   const session = await getAuthSession();
//   return (
//     <nav className="fixed inset-x-0 top-0 bg-white dark:bg-gray-950 z-[10] h-fit border-b border-zinc-300 py-2">
//       <div className="flex items-center justify-center h-full gap-2 px-2 mx-auto sm:justify-between ">
//         <Link href="/gallery" className="items-center hidden gap-2 sm:flex">
//           <p
//             className={` px-3.5 py-2 text-5xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white ${honk.className}`} // Step 3: Apply Honk font
//           >
//             SnapCurate
//           </p>
//         </Link>
//         <div className="flex items-center">
//           <Link href="/gallery" className="mr-5">
//             Dashboard
//           </Link>
//           {session?.user && (
//             <>
//               <Link href="/create" className="mr-5">
//                 Generate
//               </Link>
//               <Link href="/settings" className="mr-5">
//                 Settings
//               </Link>
//             </>
//           )}
//           <ThemeToggle className="mr-5" />
//           <div className="flex items-center">
//             {session?.user ? (
//               <UserAccountNav user={session.user} />
//             ) : (
//               <SignInButton />
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };
import Link from "next/link";
import React from "react";
import SignInButton from "./SignInButton";
import { getAuthSession } from "@/lib/auth";
import UserAccountNav from "./UserAccountNav";
import { ThemeToggle } from "./ThemeToggle";
import { Bungee } from 'next/font/google';

const honk = Bungee({ weight: ['400'], subsets: ['latin'] });

type Props = {};

const Navbar = async (props: Props) => {
  const session = await getAuthSession();
  return (
    <nav className="fixed inset-x-0 top-0 bg-white dark:bg-gray-950 z-[10] h-fit border-b border-zinc-300 py-2">
      <div className="flex items-center justify-center h-full gap-2 px-2 mx-auto sm:justify-between ">
        <Link href="/" className="items-center hidden gap-2 sm:flex">
          <p
            className={`px-3.5 py-2 text-5xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white ${honk.className}`}
          >
            SnapCurate
          </p>
        </Link>
        <div className="flex items-center">
          <Link href="/gallery" className="mr-5">
            Dashboard
          </Link>
          {session?.user && (
            <>
              <Link href="/create" className="mr-5">
                Generate
              </Link>
              <Link href="/settings" className="mr-5">
                Settings
              </Link>
            </>
          )}
          <ThemeToggle className="mr-5" />
          <div className="flex items-center">
            {session?.user ? (
              <UserAccountNav user={session.user} />
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
