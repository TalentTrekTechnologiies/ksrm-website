import { pageMetadata } from "@/lib/seo"
export const metadata = pageMetadata({
  title: "KGCET",
  description: "KGCET - the Kandula Group Common Entrance Test. Scholarships of ₹6,000 to ₹40,000 towards B.Tech admission at K.S.R.M. College of Engineering, Kadapa.",
  path: "/kgcet",
});

export default function KgcetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
