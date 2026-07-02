import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header style={{ width: "100%", background: "#fff" }}>
      <Link href="/">
        <Image
          src="/header.png"
          alt="KSRM College of Engineering"
          width={2048}
          height={333}
          priority
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            objectFit: "contain",
          }}
        />
      </Link>
    </header>
  );
}
