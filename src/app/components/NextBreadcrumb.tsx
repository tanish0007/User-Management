"use client";
import { ReactNode, Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type TBreadCrumbProps = {
  homeElement: ReactNode;
  separator: ReactNode;
  children?: ReactNode;
  containerClasses?: string;
  listClasses?: string;
  activeClasses?: string;
  capitalizeLinks?: boolean;
};

const NextBreadcrumb = ({
  homeElement,
  separator,
  containerClasses,
  children,
  listClasses,
  activeClasses,
  capitalizeLinks,
}: TBreadCrumbProps) => {
  const paths = usePathname();
  const pathNames = paths.split("/").filter((path) => path);

  return (
    <div>
      <ul className={containerClasses}>
        <li className={listClasses}>
          <Link href="/">{homeElement}</Link>
        </li>

        {pathNames.map((link, index) => {
          const href = `/${pathNames.slice(0, index + 1).join("/")}`;
          const isActive = paths === href;

          return (
            <Fragment key={index}>
              <span className="mx-2 text-gray-400">{">"}</span>

              <li className={isActive ? activeClasses : listClasses}>
                <Link href={href}>
                  {capitalizeLinks
                    ? link.charAt(0).toUpperCase() + link.slice(1)
                    : link}
                </Link>
              </li>
            </Fragment>
          );
        })}
      </ul>
      {/* <ul className={containerClasses}>
                <li className={listClasses}><Link href={'/'}>{homeElement}</Link></li>
                {pathNames.length > 0 && separator}
            {
                pathNames.map( (link, index) => {
                    let href = `/${pathNames.slice(0, index + 1).join('/')}`
                    let itemClasses = paths === href ? `${listClasses} ${activeClasses}` : listClasses
                    let itemLink = capitalizeLinks ? link[0].toUpperCase() + link.slice(1, link.length) : link
                    return (
                        <Fragment key={index}>
                            <li className={itemClasses} >
                                <Link href={href}>{itemLink}</Link>
                            </li>
                            {pathNames.length !== index + 1 && separator}
                        </Fragment>
                    )
                })
            }
            </ul> */}
      {children}
    </div>
  );
};

export default NextBreadcrumb;
