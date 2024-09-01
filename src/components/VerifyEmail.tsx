"use client";

import { trpc } from "@/trpc/client";
import { Check, Loader2, XCircle } from "lucide-react";
import Image from "next/image";
import { buttonVariants } from "./ui/button";
import Link from "next/link";
interface VerifyEmailProps {
  token: string;
}
const VerifyEmailComponent = ({ token }: VerifyEmailProps) => {
  const { data, isLoading, isError } = trpc.auth.verifyEmail.useQuery({
    token,
  });
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2">
        <XCircle className="h-8 w-8 text-red-600" />
        <h3 className="font-semibold text-xl">There was a problem </h3>
        <p className="text-muted-foreground text-sm">
          This Token is not valid or has expired. Please try again later.
        </p>
      </div>
    );
  }
  if (data?.success) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="relative mb-4 h-60 w-60 text-muted-foreground">
          <Image src={"/hippo-email-sent.png"} fill alt="sent email" />
        </div>
        <h3 className="font-semibold text-2xl">You&apos;re all set! </h3>
        <p className="text-muted-foreground text-center mt-1">
          <Check className="size-4 rounded-full bg-green-600 text-white inline-flex" />{" "}
          Thank you for verifing your email.
        </p>
        <Link
          href={"/sign-in"}
          className={buttonVariants({
            className: "mt-4 w-full",
          })}
        >
          Sign in
        </Link>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="size-12 animate-spin text-zinc-300" />
        <h3 className="font-semibold text-xl">Verifying... </h3>
        <p className="text-muted-foreground text-sm">
          Please wait while we verify your email address.
        </p>
      </div>
    );
  }
};

export default VerifyEmailComponent;
