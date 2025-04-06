import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import GoogleSignInButton from "./GoogleSignIn";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex items-center justify-center h-[70vh] ">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sign In Required</h1>
          <p className="text-gray-600 dark:text-gray-300">You need to be signed in to use this feature</p>
        </div>
        
        <div className="pt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sign in with Google:</p>
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
