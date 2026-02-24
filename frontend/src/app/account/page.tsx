import { Suspense } from "react";
import AccountContent from "./AccountContent";

export const dynamic = "force-dynamic";

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-yellow-500 border-r-transparent" />
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Loading your account...
            </p>
          </div>
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
