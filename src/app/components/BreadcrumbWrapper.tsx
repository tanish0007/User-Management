"use client";

import { usePathname } from "next/navigation";
import NextBreadcrumb from "./NextBreadcrumb";

const BreadcrumbWrapper = () => {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <NextBreadcrumb
      homeElement={"Home"}
      separator={<span> {'>'} </span>}
      activeClasses="text-amber-500"
      containerClasses="flex py-5 bg-gradient-to-r from-purple-600 to-blue-600"
      listClasses="hover:underline mx-2 font-bold"
      capitalizeLinks
    />
  );
};

export default BreadcrumbWrapper;