import Link from "next/link"
import type { AnchorHTMLAttributes, ReactNode } from "react"

/**
 * A link whose target comes from the CMS: next/link for a page of this site,
 * a plain <a> for anything else.
 *
 * next/link prefetches its target as a page. Pointed at a Media Library file
 * (a notice image, a PDF) or another site, that prefetch is a request for
 * "/api/media/file/7377/MEDIUM/WEBP/__next._tree.txt", which 404s - six of them
 * on every homepage load, from the hero's Latest Updates list.
 *
 * Usage: <SmartLink href={item.href} className="news-item">…</SmartLink>
 */
export function isSitePage(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//") && !/^\/(api|media)\//.test(href) && !/\.\w{2,5}($|[?#])/.test(href)
}

export default function SmartLink({
  href,
  children,
  ...rest
}: { href: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  if (isSitePage(href)) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} target={rest.target ?? "_blank"} rel={rest.rel ?? "noopener noreferrer"} {...rest}>
      {children}
    </a>
  )
}
