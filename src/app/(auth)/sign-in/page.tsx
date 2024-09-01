"use client";
import { Icons } from "@/components/Icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader, Loader2 } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AuthValidator,
  TAuthValidator,
} from "@/lib/validators/account-credencials";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { ZodError } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
const Signin = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSeller = searchParams.get("as");
  const origin = searchParams.get("origin");
  const continueAsSeller = () => {
    router.push(`?as=seller`);
  };
  const continueAsBuyer = () => {
    router.replace(`/sign-in`, undefined);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAuthValidator>({
    resolver: zodResolver(AuthValidator),
  });

  const { mutate: signIn, isLoading } = trpc.auth.signIn.useMutation({
    onSuccess: () => {
      toast.success("Logged in successfully!");
      router.refresh();
      if (origin) {
        router.push(`/${origin}`);
        return;
      }
      if (isSeller) {
        router.push(`/sell`);
        return;
      }
      router.push(`/`);
      router.refresh();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("Invalid email or password.");
      }
    },
  });
  const onSubmit = ({ email, password }: TAuthValidator) => {
    signIn({ email, password });
  };
  return (
    <>
      <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Icons.logo className="h-20 w-20" />
            <h1 className="text-2xl font-bold">
              Signin to your {isSeller ? "seller" : ""} Account
            </h1>

            <Link
              href={"/sign-up"}
              className={buttonVariants({
                variant: "link",
                className: "text-muted-foreground gap-1.5",
              })}
            >
              Don&apos;t have an account?
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-6 ">
            {isSeller ? (
              <Button
                onClick={continueAsBuyer}
                disabled={isLoading}
                variant={"secondary"}
              >
                continue as customer{" "}
              </Button>
            ) : (
              <Button
                onClick={continueAsSeller}
                disabled={isLoading}
                variant={"secondary"}
              >
                continue as seller
              </Button>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <div className="grid gap-1 py-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    className={cn({
                      "focus-visible:ring-red-500": errors.email,
                    })}
                  />
                  {errors?.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-1 py-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    {...register("password")}
                    type="password"
                    placeholder="password"
                    className={cn({
                      "focus-visible:ring-red-500": errors.password,
                    })}
                  />
                  {errors?.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <Button disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      {" "}
                      <Loader className="size-4 animate-spin" />{" "}
                      <p className="text-sm text-gray-400">Loading...</p>{" "}
                    </div>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </div>
            </form>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center"
              >
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            <Button className="mb-5" disabled={isLoading} variant={"secondary"}>
             
              <Image
                src={"/google.svg"}
                width={"25"}
                height={"25"}
                alt="google"
              /> Google
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signin;
