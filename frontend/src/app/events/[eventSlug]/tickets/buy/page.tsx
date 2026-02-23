import { Suspense } from "react";
import BuyTicketContent from "@/app/tickets/buy/BuyTicketContent";

export const dynamic = "force-dynamic";

export default function EventBuyTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-500 border-r-transparent" />
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Loading ticket details...
            </p>
          </div>
        </div>
      }
    >
      <BuyTicketContent />
    </Suspense>
  );
}
