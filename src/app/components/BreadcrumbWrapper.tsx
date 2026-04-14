"use client";

import { usePathname } from "next/navigation";
import NextBreadcrumb from "./NextBreadcrumb";

const BreadcrumbWrapper = () => {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
  <div className="w-full border-b bg-white px-6 py-3 shadow-sm">
    <NextBreadcrumb
      homeElement={<span className="text-gray-600">Home</span>}
      separator={<span className="mx-2 text-gray-400">{'>'}</span>}
      activeClasses="text-amber-500 font-semibold"
      containerClasses="flex items-center text-sm"
      listClasses="hover:text-amber-500 transition-colors"
      capitalizeLinks
    />
  </div>
);
};

export default BreadcrumbWrapper;